import { Router } from "express";
import path from "node:path";
import { readdir, readFile, writeFile, mkdir, rename, stat } from "node:fs/promises";
import { readJson, initSseHeaders, sendSse } from "../utils.js";
import { ROOT_DIR } from "../config.js";
import { executionStore, type ExecutionEvent, type TaskResult } from "../execution-store.js";
import { CancellationRegistry } from "../../../../src/cancellation.js";

export const executionsRouter = Router();

// ── Safety net: sposta i file scritti nei path globali → runDir ───────────
// Viene chiamata dopo ogni task completato. Se l'agente ha scritto in
// workspace/output/ o workspace/context/ invece del runDir, i file
// vengono spostati automaticamente nella cartella isolata del run.
async function enforceRunIsolation(
  execId: string,
  runDir: string,   // es. "workspace/runs/angular-responsive-golden-master"
  taskStartMs: number
): Promise<string[]> {
  const moved: string[] = [];
  const GLOBAL_DIRS = ["workspace/output", "workspace/context", "workspace/reports", "workspace/logs"];

  for (const globalDir of GLOBAL_DIRS) {
    const absGlobal = path.join(ROOT_DIR, globalDir);
    // Segmento finale (output|context|reports|logs) per costruire il path run
    const segment = globalDir.replace("workspace/", "");  // es. "output"

    async function walkAndMove(dir: string): Promise<void> {
      let entries: string[];
      try { entries = await readdir(dir); } catch { return; }
      for (const entry of entries) {
        const full = path.join(dir, entry);
        let s;
        try { s = await stat(full); } catch { continue; }
        if (s.isDirectory()) {
          await walkAndMove(full);
        } else {
          // Sposta solo i file creati DOPO l'avvio del task
          if (s.mtimeMs >= taskStartMs - 500) {
            const rel = path.relative(absGlobal, full).replace(/\\/g, "/");
            const dest = path.join(ROOT_DIR, runDir, segment, rel);
            try {
              await mkdir(path.dirname(dest), { recursive: true });
              await rename(full, dest);
              const relFull = `${globalDir}/${rel}`;
              moved.push(`${relFull} → ${runDir}/${segment}/${rel}`);
              executionStore.addLog(execId, {
                type: "task.files-moved",
                executionId: execId,
                timestamp: new Date().toISOString(),
                message: `[isolation] Spostato ${relFull} → ${runDir}/${segment}/${rel}`
              });
            } catch { /* file già spostato o in uso */ }
          }
        }
      }
    }

    await walkAndMove(absGlobal);
  }
  return moved;
}

// ── GET /api/executions ───────────────────────────────────────────────────
executionsRouter.get("/", (_req, res) => {
  const list = executionStore.list();
  res.json({ data: list, meta: { total: list.length } });
});

// ── GET /api/executions/:id ───────────────────────────────────────────────
executionsRouter.get("/:id", (req, res) => {
  const ex = executionStore.get(req.params["id"] ?? "");
  if (!ex) {
    res.status(404).json({ error: "NotFound", message: "Execution not found", statusCode: 404 });
    return;
  }
  res.json({ data: ex });
});

// ── GET /api/executions/:id/events (SSE) ─────────────────────────────────
executionsRouter.get("/:id/events", (req, res) => {
  const execId = req.params["id"] ?? "";
  const ex = executionStore.get(execId);
  if (!ex) {
    res.status(404).json({ error: "NotFound", message: "Execution not found", statusCode: 404 });
    return;
  }

  initSseHeaders(res);

  // Replay existing logs
  for (const event of ex.logs) {
    sendSse(res, event.type, event);
  }

  // Subscribe to new events
  const handler = (event: ExecutionEvent) => {
    if (event.executionId !== execId) return;
    sendSse(res, event.type, event);
    if (
      event.type === "execution.completed" ||
      event.type === "execution.failed" ||
      event.type === "execution.cancelled"
    ) {
      res.end();
    }
  };

  executionStore.on("event", handler);
  req.on("close", () => executionStore.off("event", handler));
});

// ── Shared helpers (exported for upload-and-run) ─────────────────────────
export async function findWorkflow(workflowId: string): Promise<WorkflowDefinition> {
  try {
    return await readJson<WorkflowDefinition>(`workflows/${workflowId}.workflow.json`);
  } catch {
    const dir = path.join(ROOT_DIR, "workflows");
    const files = (await readdir(dir)).filter(f => f.endsWith(".workflow.json"));
    for (const file of files) {
      const wf = await readJson<WorkflowDefinition>(`workflows/${file}`);
      if (wf.id === workflowId) return wf;
    }
    throw new Error(`Workflow '${workflowId}' not found`);
  }
}

// ── Slug dal nome file input ──────────────────────────────────────────────
// "timevision-report-v128 1.html" → "timevision-report-v128-1"
async function detectInputSlug(): Promise<{ slug: string; inputFile: string } | null> {
  try {
    const inputDir = path.join(ROOT_DIR, "workspace", "input");
    const files = await readdir(inputDir).catch(() => [] as string[]);
    if (!files.length) return null;
    // Pick most-recently-modified file
    let latest = files[0]!;
    const { stat } = await import("node:fs/promises");
    let latestMtime = 0;
    for (const f of files) {
      const s = await stat(path.join(inputDir, f)).catch(() => null);
      if (s && s.mtimeMs > latestMtime) { latestMtime = s.mtimeMs; latest = f; }
    }
    // Slugify: remove extension, replace spaces+dots+special chars with dash, lowercase
    const base = path.basename(latest, path.extname(latest));
    const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return { slug: slug || "run", inputFile: latest };
  } catch { return null; }
}

// ── Riscrittura path del workflow per run isolato ─────────────────────────
// ── Riscrittura path del workflow per run isolato ─────────────────────────
// Sostituisce workspace/(context|output|reports|logs) → workspace/runs/{slug}/$1
// in: inputPaths, outputPaths, description del task, contextFiles del piano,
//     metadata.gateCandidatesPath e metadata.gateOutputPath.
// Se inputFile è specificato, workspace/input/** → workspace/input/{file}.
function rewriteWorkflowPaths<T extends WorkflowDefinition>(
  wf: T, slug: string, inputFile?: string
): T {
  const prefix = `workspace/runs/${slug}`;
  const OUTPUT_RE = /workspace\/(context|output|reports|logs)(\/|$)/g;

  const rewriteStr = (s: string): string =>
    s.replace(OUTPUT_RE, `${prefix}/$1$2`);

  const rewritePath = (p: string): string => {
    // workspace/input/** → workspace/input/{file} se specificato
    if (inputFile && (p === "workspace/input/**" || p === "workspace/input/*")) {
      return `workspace/input/${inputFile}`;
    }
    return rewriteStr(p);
  };

  // Riscrive anche i contextFiles del piano
  const newContextFiles = (wf.contextFiles ?? []).map(rewriteStr);

  const rewriteTask = (task: any) => {
    const newMeta = task.metadata
      ? {
          ...task.metadata,
          gateCandidatesPath: task.metadata.gateCandidatesPath
            ? rewriteStr(task.metadata.gateCandidatesPath) : task.metadata.gateCandidatesPath,
          gateOutputPath: task.metadata.gateOutputPath
            ? rewriteStr(task.metadata.gateOutputPath) : task.metadata.gateOutputPath,
        }
      : task.metadata;
    return {
      ...task,
      description:  task.description  ? rewriteStr(task.description)  : task.description,
      inputPaths:   task.inputPaths?.map(rewritePath),
      outputPaths:  task.outputPaths?.map(rewriteStr),
      metadata:     newMeta,
    };
  };

  return { ...wf, contextFiles: newContextFiles, tasks: wf.tasks.map(rewriteTask) } as T;
}

export async function createAndRunExecution(
  workflowId: string,
  taskId?: string,
  inputFile?: string
): Promise<{ id: string; status: string }> {
  const workflow = await findWorkflow(workflowId);
  const req: StartExecutionRequest = { workflowId, taskId };

  // Determine run slug from input file
  // Priority: 1) explicit inputFile passed by caller  2) most-recently-modified file in workspace/input/
  let slug: string;
  let actualInputFile: string;

  if (inputFile) {
    // Explicit file passed — use it directly, never auto-detect
    actualInputFile = inputFile;
    const base = path.basename(inputFile, path.extname(inputFile));
    slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "run";
  } else {
    const detected = await detectInputSlug();
    slug = detected?.slug ?? "run";
    actualInputFile = detected?.inputFile ?? "";
  }

  // Create the isolated run directory upfront
  const runDir = `workspace/runs/${slug}`;
  await mkdir(path.join(ROOT_DIR, runDir, "context"), { recursive: true });
  await mkdir(path.join(ROOT_DIR, runDir, "output"),  { recursive: true });
  await mkdir(path.join(ROOT_DIR, runDir, "reports"), { recursive: true });

  // Rewrite workflow paths to use the run directory + pin the specific input file
  // Skip isolation if the workflow explicitly opts out (es. integrate-lib-to-webapp)
  const skipIsolation = !!(workflow as any).skipIsolation;
  const isolatedWorkflow = skipIsolation ? workflow : rewriteWorkflowPaths(workflow, slug, actualInputFile);

  // If a specific taskId is requested, build a single-task workflow
  const runMeta = skipIsolation ? {} : { runDir, runInputFile: actualInputFile };
  const plan = taskId
    ? { ...isolatedWorkflow, ...runMeta, objective: `[Step singolo] ${taskId} — ${isolatedWorkflow.objective}`, tasks: isolatedWorkflow.tasks.map((t: any) => ({ ...t, status: t.id === taskId ? "pending" : "completed" })) }
    : { ...isolatedWorkflow, ...runMeta };

  const execution = executionStore.create(req, plan.objective, taskId ? 1 : workflow.tasks.length, {
    runDir, runSlug: slug, inputFile: actualInputFile
  });
  void runWorkflowAsync(execution.id, plan as any, req);
  return { id: execution.id, status: execution.status };
}

// ── POST /api/executions ─────────────────────────────────────────────────
executionsRouter.post("/", async (req, res) => {
  const body = req.body as StartExecutionRequest;

  if (!body.workflowId) {
    res.status(400).json({ error: "BadRequest", message: "workflowId is required", statusCode: 400 });
    return;
  }

  try {
    // Optional: run only a specific task (skip all others)
    // inputFile: nome esplicito del file da processare (evita auto-rilevamento)
    const execution = await createAndRunExecution(body.workflowId, body.taskId, body.inputFile);
    res.status(201).json({ data: execution });
  } catch (e: any) {
    res.status(404).json({ error: "NotFound", message: e.message, statusCode: 404 });
  }
});

// ── POST /api/executions/:id/cancel ───────────────────────────────────────
executionsRouter.post("/:id/cancel", (req, res) => {
  const execId = req.params["id"] ?? "";
  const cancelled = executionStore.cancel(execId);
  if (!cancelled) {
    const ex = executionStore.get(execId);
    if (!ex) {
      res.status(404).json({ error: "NotFound", message: "Execution not found", statusCode: 404 });
    } else {
      res.status(409).json({ error: "Conflict", message: `Cannot cancel execution in status '${ex.status}'`, statusCode: 409 });
    }
    return;
  }
  res.json({ data: { cancelled: true } });
});

// ── POST /api/executions/:id/tasks/:taskId/retry ──────────────────────────
executionsRouter.post("/:id/tasks/:taskId/retry", async (req, res) => {
  const execId  = req.params["id"]     ?? "";
  const taskId  = req.params["taskId"] ?? "";

  const ex = executionStore.get(execId);
  if (!ex) {
    res.status(404).json({ error: "NotFound", message: "Execution not found", statusCode: 404 });
    return;
  }
  const taskEntry = ex.tasks.find(t => t.id === taskId);
  if (!taskEntry) {
    res.status(404).json({ error: "NotFound", message: `Task '${taskId}' not found`, statusCode: 404 });
    return;
  }
  if (!["failed", "blocked", "completed", "running"].includes(taskEntry.status)) {
    res.status(409).json({ error: "Conflict", message: `Task status '${taskEntry.status}' cannot be retried`, statusCode: 409 });
    return;
  }
  if (executionStore.isRunning(execId)) {
    res.status(409).json({ error: "Conflict", message: "L'esecuzione è già in corso: attendi il completamento prima di riprovare un task", statusCode: 409 });
    return;
  }

  try {
    const workflow = await findWorkflow(ex.workflowId);
    // Reset target task + any blocked downstream tasks
    executionStore.updateTask(execId, taskId, { status: "pending", attempts: 0, errors: [] } as Partial<TaskResult>);
    for (const t of ex.tasks) {
      if (t.status === "blocked") {
        executionStore.updateTask(execId, t.id, { status: "pending", attempts: 0 } as Partial<TaskResult>);
      }
    }
    // Re-open execution status if it was failed/completed
    if (ex.status === "failed" || ex.status === "completed") {
      executionStore.setStatus(execId, "running");
      executionStore.update(execId, { completedAt: undefined });
    }
    executionStore.addLog(execId, {
      type: "task.retry",
      executionId: execId,
      taskId,
      timestamp: new Date().toISOString(),
      message: `Riprova task: ${taskEntry.title}`
    });

    void retryTaskAsync(execId, workflow, taskId, ex.tasks);
    res.json({ data: { retrying: true, taskId } });
  } catch (e: any) {
    res.status(500).json({ error: "InternalError", message: e.message, statusCode: 500 });
  }
});

// ── GET /api/executions/:id/gate ─────────────────────────────────────────
// Restituisce il contenuto del report generato dal task-gate (es. le sezioni
// di menu candidate) più le opzioni estratte, in modo che la UI possa
// mostrare un menu a tendina con le scelte disponibili prima di riprendere.
executionsRouter.get("/:id/gate", async (req, res) => {
  const execId = req.params["id"] ?? "";
  const ex = executionStore.get(execId);
  if (!ex) {
    res.status(404).json({ error: "NotFound", message: "Execution not found", statusCode: 404 });
    return;
  }
  try {
    const workflow = await findWorkflow(ex.workflowId);
    const gateTask = workflow.tasks.find((t: any) => t.metadata?.gate === true);
    if (!gateTask) {
      res.status(404).json({ error: "NotFound", message: "Questo workflow non ha uno step di attesa scelta utente", statusCode: 404 });
      return;
    }
    const meta = (gateTask as any).metadata ?? {};

    // ── Path isolation: usa il runDir dell'esecuzione ─────────────────────
    // Il candidatesPath nel workflow punta a workspace/output/... (path generico).
    // Se l'esecuzione è isolata (runDir presente), il file è sotto workspace/runs/{slug}/...
    const isolatePath = (p: string): string => {
      if (!ex.runDir || !p) return p;
      // workspace/output/... → workspace/runs/{slug}/output/...
      return p.replace(
        /^workspace\/(context|output|reports|logs)(\/|$)/,
        `${ex.runDir}/$1$2`
      );
    };

    const candidatesPath = isolatePath(meta.gateCandidatesPath ?? "");
    let markdown = "";
    try {
      markdown = await readFile(path.join(ROOT_DIR, candidatesPath), "utf8");
    } catch { /* non ancora prodotto */ }

    // Estrae le voci nel formato "[N] Label" prodotto dallo step di analisi menu
    const options: { index: number; label: string }[] = [];
    const re = /^\[(\d+)\]\s+(.+?)\s*$/gm;
    let m: RegExpExecArray | null;
    while ((m = re.exec(markdown)) !== null) {
      options.push({ index: Number(m[1]), label: (m[2] ?? "").replace(/★.*$/, "").trim() });
    }

    res.json({
      data: {
        gateLabel: meta.gateLabel ?? "Scegli un'opzione",
        gateTaskId: gateTask.id,
        candidatesMarkdown: markdown,
        options
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: "InternalError", message: e.message, statusCode: 500 });
  }
});

// ── POST /api/executions/:id/select-section ──────────────────────────────
// Riceve la scelta dell'utente (es. la sezione di menu da angularizzare),
// la scrive nel file atteso dai task successivi e riprende l'esecuzione.
executionsRouter.post("/:id/select-section", async (req, res) => {
  const execId = req.params["id"] ?? "";
  const section = (req.body?.section ?? "").toString().trim();

  const ex = executionStore.get(execId);
  if (!ex) {
    res.status(404).json({ error: "NotFound", message: "Execution not found", statusCode: 404 });
    return;
  }
  if (ex.status !== "awaiting_input") {
    res.status(409).json({ error: "Conflict", message: `L'esecuzione non è in attesa di una scelta (stato attuale: '${ex.status}')`, statusCode: 409 });
    return;
  }
  if (!section) {
    res.status(400).json({ error: "BadRequest", message: "Il campo 'section' è obbligatorio", statusCode: 400 });
    return;
  }
  if (executionStore.isRunning(execId)) {
    res.status(409).json({ error: "Conflict", message: "L'esecuzione è già in corso", statusCode: 409 });
    return;
  }

  try {
    const workflow = await findWorkflow(ex.workflowId);
    const gateTask = workflow.tasks.find((t: any) => t.metadata?.gate === true);

    // ── Path isolation: scrive nel runDir dell'esecuzione (non nel path generico) ──
    const isolatePath = (p: string): string => {
      if (!ex.runDir || !p) return p;
      return p.replace(
        /^workspace\/(context|output|reports|logs)(\/|$)/,
        `${ex.runDir}/$1$2`
      );
    };

    const rawOutputPath: string = (gateTask as any)?.metadata?.gateOutputPath ?? "workspace/output/gate-selection.md";
    const outputPath = isolatePath(rawOutputPath);

    const abs = path.join(ROOT_DIR, outputPath);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(
      abs,
      `# Sezione selezionata dall'utente\n\n**Sezione scelta:** ${section}\n\n_Selezionata manualmente dall'interfaccia il ${new Date().toISOString()}. Da usare come SELECTED SECTION vincolante per tutti i task successivi (Phase 2 in poi)._\n`,
      "utf8"
    );

    executionStore.setStatus(execId, "running");
    executionStore.addLog(execId, {
      type: "execution.resumed",
      executionId: execId,
      timestamp: new Date().toISOString(),
      message: `Sezione scelta dall'utente: "${section}". Ripresa esecuzione.`
    });

    void resumeAfterGateAsync(execId, workflow, ex.tasks);
    res.json({ data: { resuming: true, section } });
  } catch (e: any) {
    res.status(500).json({ error: "InternalError", message: e.message, statusCode: 500 });
  }
});

// ── Async runner ──────────────────────────────────────────────────────────
async function runWorkflowAsync(
  execId: string,
  workflow: WorkflowDefinition,
  _req: StartExecutionRequest
): Promise<void> {
  const abortCtrl = new AbortController();
  executionStore.registerAbort(execId, abortCtrl);
  CancellationRegistry.register(execId);  // Also register for providers

  try {
    executionStore.setStatus(execId, "running");
    executionStore.update(execId, { startedAt: new Date().toISOString() });
    executionStore.addLog(execId, {
      type: "execution.started",
      executionId: execId,
      timestamp: new Date().toISOString(),
      message: `Avvio workflow: ${workflow.objective}`
    });

    // Dynamically import core orchestrator
    const { Registry } = await import("../../../../src/registry.js");
    const { ProviderFactory } = await import("../../../../src/provider-factory.js");
    const { PromptBuilder } = await import("../../../../src/prompt-builder.js");
    const { PathPolicy } = await import("../../../../src/path-policy.js");
    const { ResultValidator } = await import("../../../../src/validator.js");
    const { GitCheckpointService } = await import("../../../../src/checkpoint.js");
    const { Reporter } = await import("../../../../src/reporter.js");
    const { Orchestrator } = await import("../../../../src/orchestrator.js");
    const { loadConfig } = await import("../../../../src/config.js");

    const config = loadConfig();
    const registry = new Registry(ROOT_DIR);
    await registry.load();

    const providerFactory = new ProviderFactory(config);
    const promptBuilder = new PromptBuilder(ROOT_DIR);
    const pathPolicy = new PathPolicy();
    const validator = new ResultValidator(pathPolicy);
    const checkpoint = new GitCheckpointService();
    const reporter = new Reporter(ROOT_DIR);

    const orchestrator = new Orchestrator(
      ROOT_DIR, config, registry, providerFactory,
      promptBuilder, pathPolicy, validator, checkpoint, reporter
    );

    // Patch plan tasks to match runtime types
    const plan = { ...workflow, tasks: workflow.tasks.map(t => ({ ...t })) };

    // Log each task start/end by monkey-patching (simple approach)
    for (const task of plan.tasks) {
      executionStore.addTask(execId, {
        id: task.id,
        title: task.title,
        agentId: task.agentId,
        provider: "pending",
        model: "",
        skills: [...(task.skillIds ?? [])],
        status: "pending",
        attempts: 0,
        errors: [],
        inputPaths: [...(task.inputPaths ?? [])],
        outputPaths: [...(task.outputPaths ?? [])],
        changedFiles: [],
        commandsExecuted: []
      } as TaskResult);
    }

    // ── Task lifecycle helpers ────────────────────────────────────────────
    const taskById = (taskId: string) => plan.tasks.find(t => t.id === taskId);
    const taskStartTimes = new Map<string, number>(); // safety net: timestamp avvio

    const onTaskStart = (taskId: string) => {
      const t = taskById(taskId);
      executionStore.updateTask(execId, taskId, { status: "running" } as Partial<TaskResult>);
      executionStore.addLog(execId, {
        type: "task.started",
        executionId: execId,
        taskId,
        timestamp: new Date().toISOString(),
        message: `Avvio task: ${t?.title ?? taskId}`
      });
      if (t?.inputPaths?.length) {
        executionStore.addLog(execId, {
          type: "task.reading-files",
          executionId: execId,
          taskId,
          timestamp: new Date().toISOString(),
          message: `File in lettura: ${t.inputPaths.join(", ")}`
        });
      }
      // Registra il timestamp di avvio per il safety net
      taskStartTimes.set(taskId, Date.now());
    };

    const onTaskEnd = (taskId: string, status: 'completed' | 'failed') => {
      executionStore.updateTask(execId, taskId, { status } as Partial<TaskResult>);
      if (status === 'completed') executionStore.update(execId, { completedTasks: (executionStore.get(execId)?.completedTasks ?? 0) + 1 });
      if (status === 'failed')    executionStore.update(execId, { failedTasks:    (executionStore.get(execId)?.failedTasks    ?? 0) + 1 });
      // Safety net: sposta file scritti fuori dal runDir → runDir
      if (plan.runDir) {
        const startMs = taskStartTimes.get(taskId) ?? Date.now();
        void enforceRunIsolation(execId, plan.runDir, startMs);
      }
    };

    // ── Human-in-the-loop gate ──────────────────────────────────────────
    // Se un task ha metadata.gate === true, esegui SOLO fino a quel task
    // (incluso) in questa passata: il workflow si ferma in attesa che
    // l'utente fornisca la propria scelta tramite POST /select-section,
    // che riprenderà l'esecuzione dai task successivi (vedi resumeAfterGateAsync).
    const gateIndex = plan.tasks.findIndex(t => (t as any).metadata?.gate === true);
    const execTasks = gateIndex === -1 ? plan.tasks : plan.tasks.slice(0, gateIndex + 1);

    const report = await orchestrator.execute(
      { ...plan, tasks: execTasks } as Parameters<typeof orchestrator.execute>[0],
      // onTaskOutput: stream Copilot stdout chunk → SSE task.output
      (taskId: string, chunk: string) => {
        const lines = chunk.split(/\r?\n/).filter(l => l.trim());
        for (const line of lines) {
          executionStore.addLog(execId, {
            type: "task.output",
            executionId: execId,
            taskId,
            timestamp: new Date().toISOString(),
            message: line
          });
        }
      },
      onTaskStart,
      onTaskEnd
    );

    // Check if cancelled mid-execution
    if (abortCtrl.signal.aborted) {
      executionStore.deregisterAbort(execId);
      return;
    }

    // If we stopped at a gate and it completed successfully, pause here:
    // do NOT mark the execution completed/failed — wait for user input.
    if (gateIndex !== -1 && report.success) {
      for (const taskReport of report.tasks) {
        executionStore.updateTask(execId, taskReport.id, {
          status: taskReport.status as import("../../../packages/shared-contracts/src/index.js").TaskStatus,
          attempts: taskReport.attempts,
          summary: taskReport.summary,
          errors: taskReport.errors,
          provider: taskReport.provider ?? "",
          model: taskReport.model ?? "",
          skills: taskReport.skills ?? [],
          changedFiles: taskReport.changedFiles ?? [],
          commandsExecuted: taskReport.commandsExecuted ?? []
        } as Partial<TaskResult>);
        executionStore.addLog(execId, {
          type: "task.completed",
          executionId: execId,
          taskId: taskReport.id,
          timestamp: new Date().toISOString(),
          message: taskReport.summary ?? taskReport.status
        });
      }
      executionStore.update(execId, {
        completedTasks: executionStore.get(execId)?.tasks.filter(t => t.status === "completed").length ?? 0
      });
      executionStore.setStatus(execId, "awaiting_input");
      executionStore.addLog(execId, {
        type: "execution.awaiting-input",
        executionId: execId,
        timestamp: new Date().toISOString(),
        message: (plan.tasks[gateIndex] as any).metadata?.gateLabel ?? "In attesa della scelta dell'utente"
      });
      executionStore.deregisterAbort(execId);
      CancellationRegistry.deregister(execId);
      return;
    }

    // Update task results from report
    for (const taskReport of report.tasks) {
      const status = taskReport.status as import("../../../packages/shared-contracts/src/index.js").TaskStatus;
      executionStore.updateTask(execId, taskReport.id, {
        status,
        attempts: taskReport.attempts,
        summary: taskReport.summary,
        errors: taskReport.errors,
        provider: taskReport.provider ?? "",
        model: taskReport.model ?? "",
        skills: taskReport.skills ?? [],
        changedFiles: taskReport.changedFiles ?? [],
        commandsExecuted: taskReport.commandsExecuted ?? []
      } as Partial<TaskResult>);
      executionStore.addLog(execId, {
        type: status === "completed" ? "task.completed" : "task.failed",
        executionId: execId,
        taskId: taskReport.id,
        timestamp: new Date().toISOString(),
        message: taskReport.summary ?? taskReport.status
      });
      // Emit changed files event if any
      if (taskReport.changedFiles?.length) {
        executionStore.addLog(execId, {
          type: "task.files-changed",
          executionId: execId,
          taskId: taskReport.id,
          timestamp: new Date().toISOString(),
          message: `File modificati: ${taskReport.changedFiles.join(", ")}`
        });
      }
    }

    executionStore.setStatus(execId, report.success ? "completed" : "failed");
    executionStore.update(execId, {
      completedAt: new Date().toISOString(),
      success: report.success,
      completedTasks: report.tasks.filter(t => t.status === "completed").length,
      failedTasks: report.tasks.filter(t => t.status === "failed").length
    });
    executionStore.addLog(execId, {
      type: report.success ? "execution.completed" : "execution.failed",
      executionId: execId,
      timestamp: new Date().toISOString(),
      message: report.success ? "Workflow completato con successo" : "Workflow terminato con errori"
    });
    executionStore.deregisterAbort(execId);
    CancellationRegistry.deregister(execId);
  } catch (err) {
    executionStore.deregisterAbort(execId);
    CancellationRegistry.deregister(execId);
    // If aborted by user, the status is already "cancelled" — don't overwrite
    const ex = executionStore.get(execId);
    if (ex?.status === "cancelled") return;
    executionStore.setStatus(execId, "failed");
    executionStore.update(execId, { completedAt: new Date().toISOString() });
    executionStore.addLog(execId, {
      type: "execution.failed",
      executionId: execId,
      timestamp: new Date().toISOString(),
      message: err instanceof Error ? err.message : String(err)
    });
  }
}

// ── retryTaskAsync ────────────────────────────────────────────────────────
async function retryTaskAsync(
  execId: string,
  workflow: WorkflowDefinition,
  targetTaskId: string,
  currentTasks: TaskResult[]
): Promise<void> {
  const abortCtrl = new AbortController();
  executionStore.registerAbort(execId, abortCtrl);
  CancellationRegistry.register(execId);

  try {
    const { Registry }            = await import("../../../../src/registry.js");
    const { ProviderFactory }     = await import("../../../../src/provider-factory.js");
    const { PromptBuilder }       = await import("../../../../src/prompt-builder.js");
    const { PathPolicy }          = await import("../../../../src/path-policy.js");
    const { ResultValidator }     = await import("../../../../src/validator.js");
    const { GitCheckpointService }= await import("../../../../src/checkpoint.js");
    const { Reporter }            = await import("../../../../src/reporter.js");
    const { Orchestrator }        = await import("../../../../src/orchestrator.js");
    const { loadConfig }          = await import("../../../../src/config.js");

    const config      = loadConfig();
    const registry    = new Registry(ROOT_DIR);
    await registry.load();

    const orchestrator = new Orchestrator(
      ROOT_DIR, config, registry,
      new ProviderFactory(config),
      new PromptBuilder(ROOT_DIR),
      new PathPolicy(),
      new ResultValidator(new PathPolicy()),
      new GitCheckpointService(),
      new Reporter(ROOT_DIR)
    );

    // Build plan: completed tasks keep status=completed, pending/failed=pending
    const taskStatusMap = new Map(currentTasks.map(t => [t.id, t.status]));
    const plan = {
      ...workflow,
      tasks: workflow.tasks.map(t => ({
        ...t,
        status: taskStatusMap.get(t.id) === "completed" ? "completed" : "pending",
        attempts: 0
      }))
    };

    const taskById = (id: string) => plan.tasks.find(t => t.id === id);

    const onTaskStart = (taskId: string) => {
      const t = taskById(taskId);
      executionStore.updateTask(execId, taskId, { status: "running" } as Partial<TaskResult>);
      executionStore.addLog(execId, { type: "task.started", executionId: execId, taskId, timestamp: new Date().toISOString(), message: `Avvio task: ${t?.title ?? taskId}` });
    };

    const onTaskEnd = (taskId: string, status: "completed" | "failed") => {
      executionStore.updateTask(execId, taskId, { status } as Partial<TaskResult>);
      if (status === "completed") executionStore.update(execId, { completedTasks: (executionStore.get(execId)?.completedTasks ?? 0) + 1 });
      if (status === "failed")    executionStore.update(execId, { failedTasks:    (executionStore.get(execId)?.failedTasks    ?? 0) + 1 });
    };

    const report = await orchestrator.execute(
      plan as Parameters<typeof orchestrator.execute>[0],
      (taskId, chunk) => {
        const lines = chunk.split(/\r?\n/).filter(l => l.trim());
        for (const line of lines) {
          executionStore.addLog(execId, { type: "task.output", executionId: execId, taskId, timestamp: new Date().toISOString(), message: line });
        }
      },
      onTaskStart,
      onTaskEnd
    );

    // Sync final results
    for (const taskReport of report.tasks) {
      const status = taskReport.status as TaskResult["status"];
      executionStore.updateTask(execId, taskReport.id, {
        status, attempts: taskReport.attempts, summary: taskReport.summary,
        errors: taskReport.errors, provider: taskReport.provider ?? "",
        model: taskReport.model ?? "", changedFiles: taskReport.changedFiles ?? [],
        commandsExecuted: taskReport.commandsExecuted ?? []
      } as Partial<TaskResult>);
    }

    const allCompleted = executionStore.get(execId)?.tasks.every(t => t.status === "completed") ?? false;
    executionStore.setStatus(execId, allCompleted ? "completed" : "failed");
    executionStore.update(execId, {
      completedAt: new Date().toISOString(),
      // Ricalcola i contatori dallo stato reale dei task invece di fidarsi degli
      // incrementi di onTaskEnd, che possono contare un fallimento transitorio
      // (poi risolto da un retry interno all'orchestrator) come errore permanente.
      completedTasks: executionStore.get(execId)?.tasks.filter(t => t.status === "completed").length ?? 0,
      failedTasks: executionStore.get(execId)?.tasks.filter(t => t.status === "failed").length ?? 0
    });
    executionStore.addLog(execId, {
      type: allCompleted ? "execution.completed" : "execution.failed",
      executionId: execId,
      timestamp: new Date().toISOString(),
      message: allCompleted ? "Workflow completato con successo" : "Workflow terminato con errori"
    });
  } catch (err) {
    const ex = executionStore.get(execId);
    if (ex?.status !== "cancelled") {
      executionStore.setStatus(execId, "failed");
      executionStore.update(execId, { completedAt: new Date().toISOString() });
      executionStore.addLog(execId, { type: "execution.failed", executionId: execId, timestamp: new Date().toISOString(), message: err instanceof Error ? err.message : String(err) });
    }
  } finally {
    executionStore.deregisterAbort(execId);
    CancellationRegistry.deregister(execId);
  }
}

// ── resumeAfterGateAsync ──────────────────────────────────────────────────
// Riprende un'esecuzione ferma in "awaiting_input" dopo che l'utente ha
// fornito la propria scelta (es. select-section): i task già completati
// (incluso il task-gate) restano tali, tutti gli altri ripartono da "pending".
async function resumeAfterGateAsync(
  execId: string,
  workflow: WorkflowDefinition,
  currentTasks: TaskResult[]
): Promise<void> {
  const abortCtrl = new AbortController();
  executionStore.registerAbort(execId, abortCtrl);
  CancellationRegistry.register(execId);

  try {
    const { Registry }             = await import("../../../../src/registry.js");
    const { ProviderFactory }      = await import("../../../../src/provider-factory.js");
    const { PromptBuilder }        = await import("../../../../src/prompt-builder.js");
    const { PathPolicy }           = await import("../../../../src/path-policy.js");
    const { ResultValidator }      = await import("../../../../src/validator.js");
    const { GitCheckpointService } = await import("../../../../src/checkpoint.js");
    const { Reporter }             = await import("../../../../src/reporter.js");
    const { Orchestrator }         = await import("../../../../src/orchestrator.js");
    const { loadConfig }           = await import("../../../../src/config.js");

    const config   = loadConfig();
    const registry = new Registry(ROOT_DIR);
    await registry.load();

    const orchestrator = new Orchestrator(
      ROOT_DIR, config, registry,
      new ProviderFactory(config),
      new PromptBuilder(ROOT_DIR),
      new PathPolicy(),
      new ResultValidator(new PathPolicy()),
      new GitCheckpointService(),
      new Reporter(ROOT_DIR)
    );

    // I task già completati (gate incluso) restano completati; tutti gli altri ripartono.
    const taskStatusMap = new Map(currentTasks.map(t => [t.id, t.status]));
    const plan = {
      ...workflow,
      tasks: workflow.tasks.map(t => ({
        ...t,
        status: taskStatusMap.get(t.id) === "completed" ? "completed" : "pending",
        attempts: 0
      }))
    };

    const taskById = (id: string) => plan.tasks.find(t => t.id === id);

    const onTaskStart = (taskId: string) => {
      const t = taskById(taskId);
      executionStore.updateTask(execId, taskId, { status: "running" } as Partial<TaskResult>);
      executionStore.addLog(execId, { type: "task.started", executionId: execId, taskId, timestamp: new Date().toISOString(), message: `Avvio task: ${t?.title ?? taskId}` });
    };

    const onTaskEnd = (taskId: string, status: "completed" | "failed") => {
      executionStore.updateTask(execId, taskId, { status } as Partial<TaskResult>);
      if (status === "completed") executionStore.update(execId, { completedTasks: (executionStore.get(execId)?.completedTasks ?? 0) + 1 });
      if (status === "failed")    executionStore.update(execId, { failedTasks:    (executionStore.get(execId)?.failedTasks    ?? 0) + 1 });
    };

    const report = await orchestrator.execute(
      plan as Parameters<typeof orchestrator.execute>[0],
      (taskId, chunk) => {
        const lines = chunk.split(/\r?\n/).filter(l => l.trim());
        for (const line of lines) {
          executionStore.addLog(execId, { type: "task.output", executionId: execId, taskId, timestamp: new Date().toISOString(), message: line });
        }
      },
      onTaskStart,
      onTaskEnd
    );

    if (abortCtrl.signal.aborted) {
      executionStore.deregisterAbort(execId);
      return;
    }

    for (const taskReport of report.tasks) {
      const status = taskReport.status as TaskResult["status"];
      executionStore.updateTask(execId, taskReport.id, {
        status, attempts: taskReport.attempts, summary: taskReport.summary,
        errors: taskReport.errors, provider: taskReport.provider ?? "",
        model: taskReport.model ?? "", changedFiles: taskReport.changedFiles ?? [],
        commandsExecuted: taskReport.commandsExecuted ?? []
      } as Partial<TaskResult>);
      executionStore.addLog(execId, {
        type: status === "completed" ? "task.completed" : "task.failed",
        executionId: execId,
        taskId: taskReport.id,
        timestamp: new Date().toISOString(),
        message: taskReport.summary ?? taskReport.status
      });
    }

    const allCompleted = executionStore.get(execId)?.tasks.every(t => t.status === "completed") ?? false;
    executionStore.setStatus(execId, allCompleted ? "completed" : "failed");
    executionStore.update(execId, {
      completedAt: new Date().toISOString(),
      success: allCompleted,
      completedTasks: executionStore.get(execId)?.tasks.filter(t => t.status === "completed").length ?? 0,
      failedTasks: executionStore.get(execId)?.tasks.filter(t => t.status === "failed").length ?? 0
    });
    executionStore.addLog(execId, {
      type: allCompleted ? "execution.completed" : "execution.failed",
      executionId: execId,
      timestamp: new Date().toISOString(),
      message: allCompleted ? "Workflow completato con successo" : "Workflow terminato con errori"
    });
  } catch (err) {
    const ex = executionStore.get(execId);
    if (ex?.status !== "cancelled") {
      executionStore.setStatus(execId, "failed");
      executionStore.update(execId, { completedAt: new Date().toISOString() });
      executionStore.addLog(execId, { type: "execution.failed", executionId: execId, timestamp: new Date().toISOString(), message: err instanceof Error ? err.message : String(err) });
    }
  } finally {
    executionStore.deregisterAbort(execId);
    CancellationRegistry.deregister(execId);
  }
}

