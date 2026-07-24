import { Router } from "express";
import path from "node:path";
import { readdir } from "node:fs/promises";
import { readJson, initSseHeaders, sendSse } from "../utils.js";
import { ROOT_DIR } from "../index.js";
import { executionStore, type ExecutionEvent, type TaskResult } from "../execution-store.js";

export const executionsRouter = Router();

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

// ── POST /api/executions ─────────────────────────────────────────────────
executionsRouter.post("/", async (req, res) => {
  const body = req.body as StartExecutionRequest;

  if (!body.workflowId) {
    res.status(400).json({ error: "BadRequest", message: "workflowId is required", statusCode: 400 });
    return;
  }

  // Load workflow
  let workflow: WorkflowDefinition;
  try {
    workflow = await readJson<WorkflowDefinition>(`workflows/${body.workflowId}.workflow.json`);
  } catch {
    // Try to find by id
    try {
      const dir = path.join(ROOT_DIR, "workflows");
      const files = (await readdir(dir)).filter(f => f.endsWith(".workflow.json"));
      let found: WorkflowDefinition | undefined;
      for (const file of files) {
        const wf = await readJson<WorkflowDefinition>(`workflows/${file}`);
        if (wf.id === body.workflowId) { found = wf; break; }
      }
      if (!found) {
        res.status(404).json({ error: "NotFound", message: `Workflow '${body.workflowId}' not found`, statusCode: 404 });
        return;
      }
      workflow = found;
    } catch {
      res.status(404).json({ error: "NotFound", message: `Workflow '${body.workflowId}' not found`, statusCode: 404 });
      return;
    }
  }

  const execution = executionStore.create(body, workflow.objective, workflow.tasks.length);

  // Run the workflow asynchronously via CLI (import & reuse core)
  void runWorkflowAsync(execution.id, workflow, body);

  res.status(201).json({ data: execution });
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

// ── Async runner ──────────────────────────────────────────────────────────
async function runWorkflowAsync(
  execId: string,
  workflow: WorkflowDefinition,
  _req: StartExecutionRequest
): Promise<void> {
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
        errors: []
      } as TaskResult);
    }

    const report = await orchestrator.execute(plan as Parameters<typeof orchestrator.execute>[0]);

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
        skills: taskReport.skills ?? []
      });
      executionStore.addLog(execId, {
        type: status === "completed" ? "task.completed" : "task.failed",
        executionId: execId,
        taskId: taskReport.id,
        timestamp: new Date().toISOString(),
        message: taskReport.summary ?? taskReport.status
      });
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
  } catch (err) {
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
