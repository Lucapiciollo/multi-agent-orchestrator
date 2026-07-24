import "dotenv/config";
import path from "node:path";
import chalk from "chalk";
import { checkbox } from "@inquirer/prompts";
import { Command } from "commander";
import { loadConfig } from "./config.js";
import { Registry } from "./registry.js";
import { ProviderFactory } from "./provider-factory.js";
import { PromptBuilder } from "./prompt-builder.js";
import { PathPolicy } from "./path-policy.js";
import { ResultValidator } from "./validator.js";
import { GitCheckpointService } from "./checkpoint.js";
import { Reporter } from "./reporter.js";
import { Orchestrator } from "./orchestrator.js";
import { loadWorkflow } from "./workflow-loader.js";
import { selectTasksInteractive } from "./task-selector.js";
import { DevOpsClient, resolveAuthHeader, type WorkItemDetail, type WorkItemSummary } from "./devops-client.js";
import { readJson } from "./fs-utils.js";
import type { ExecutionPlan } from "./models.js";

const rootDir = process.cwd();
const program = new Command();

async function createRuntime() {
  const config = loadConfig();
  const registry = new Registry(rootDir);
  await registry.load();

  const providerFactory = new ProviderFactory(config);
  const promptBuilder = new PromptBuilder(rootDir);
  const pathPolicy = new PathPolicy();
  const validator = new ResultValidator(pathPolicy);
  const checkpoint = new GitCheckpointService();
  const reporter = new Reporter(rootDir);

  const orchestrator = new Orchestrator(
    rootDir,
    config,
    registry,
    providerFactory,
    promptBuilder,
    pathPolicy,
    validator,
    checkpoint,
    reporter
  );

  return { config, registry, orchestrator };
}

program
  .name("multi-agent")
  .description("Orchestratore multi-agent basato su skill")
  .version("1.0.0");

program
  .command("agents")
  .description("Elenca gli agenti registrati")
  .action(async () => {
    const { registry } = await createRuntime();
    for (const agent of registry.listAgents()) {
      console.log(
        `${chalk.bold(agent.id)} - ${agent.name}\n  ${agent.description}\n`
      );
    }
  });

program
  .command("skills")
  .description("Elenca le skill registrate")
  .action(async () => {
    const { registry } = await createRuntime();
    for (const skill of registry.listSkills()) {
      console.log(
        `${chalk.bold(skill.id)} - ${skill.name}\n  ${skill.description}\n`
      );
    }
  });

program
  .command("validate")
  .argument("<workflow>", "File workflow JSON")
  .description("Valida e carica un workflow")
  .action(async workflow => {
    const { registry } = await createRuntime();
    const plan = await loadWorkflow(rootDir, workflow);

    for (const task of plan.tasks) {
      registry.getAgent(task.agentId);
      await registry.loadSkills(task.skillIds);
    }

    console.log(chalk.green(`Workflow valido: ${plan.id}`));
  });

program
  .command("run")
  .argument("<workflow>", "File workflow JSON")
  .option("--all", "Esegui tutti i task senza chiedere")
  .description("Esegue un workflow")
  .action(async (workflow, options: { all?: boolean }) => {
    const { config, orchestrator } = await createRuntime();
    const plan = await loadWorkflow(rootDir, workflow);

    await selectTasksInteractive(plan, options.all === true);

    console.log(chalk.cyan(`Provider default: ${config.defaultProvider}`));
    console.log(chalk.cyan(`Workflow: ${plan.id}`));
    console.log(chalk.cyan(`Obiettivo: ${plan.objective}\n`));

    const report = await orchestrator.execute(plan);

    for (const task of report.tasks) {
      const marker =
        task.status === "completed"
          ? chalk.green("✓")
          : task.status === "failed"
            ? chalk.red("✗")
            : chalk.yellow("•");

      console.log(`${marker} ${task.id}: ${task.status}`);
    }

    console.log(
      report.success
        ? chalk.green("\nWorkflow completato.")
        : chalk.red("\nWorkflow non completato.")
    );

    process.exitCode = report.success ? 0 : 1;
  });

// ─── Comandi Azure DevOps ────────────────────────────────────────────────

async function getAdoClient(): Promise<DevOpsClient | null> {
  const orgUrl = process.env["ADO_ORG_URL"];
  const project = process.env["ADO_PROJECT"];
  if (!orgUrl || !project) {
    console.error(chalk.red("Errore: ADO_ORG_URL e ADO_PROJECT devono essere impostati nel .env"));
    return null;
  }
  try {
    const auth = await resolveAuthHeader();
    return new DevOpsClient(orgUrl, project, auth);
  } catch (err) {
    console.error(chalk.red(`Autenticazione ADO fallita: ${err instanceof Error ? err.message : String(err)}`));
    return null;
  }
}

program
  .command("devops:states")
  .description("Elenca gli stati dei work item del progetto ADO configurato")
  .action(async () => {
    const client = await getAdoClient();
    if (!client) { process.exitCode = 1; return; }

    const states = await client.fetchProjectStates();
    if (states.length === 0) {
      console.log(chalk.yellow("Nessuno stato trovato (verifica ADO_ORG_URL e ADO_PROJECT)."));
      return;
    }

    const maxName = Math.max(...states.map(s => s.name.length), 5);
    const maxCat  = Math.max(...states.map(s => s.category.length), 8);
    console.log(chalk.bold(`\n  ${"Stato".padEnd(maxName)}  ${"Categoria".padEnd(maxCat)}`));
    console.log(`  ${"─".repeat(maxName)}  ${"─".repeat(maxCat)}`);
    for (const s of states) {
      const cat = s.category;
      const color =
        cat === "Proposed"   ? chalk.blue   :
        cat === "InProgress" ? chalk.yellow :
        cat === "Resolved"   ? chalk.cyan   :
        cat === "Completed"  ? chalk.green  :
                               chalk.gray;
      console.log(`  ${s.name.padEnd(maxName)}  ${color(cat.padEnd(maxCat))}`);
    }
    console.log();
  });

program
  .command("devops:members")
  .description("Elenca i membri del team del progetto ADO configurato")
  .action(async () => {
    const client = await getAdoClient();
    if (!client) { process.exitCode = 1; return; }

    const members = await client.fetchTeamMembers();
    if (members.length === 0) {
      console.log(chalk.yellow("Nessun membro trovato."));
      return;
    }

    const maxName = Math.max(...members.map(m => m.displayName.length), 4);
    console.log(chalk.bold(`\n  ${"Nome".padEnd(maxName)}  Email`));
    console.log(`  ${"─".repeat(maxName)}  ${"─".repeat(40)}`);
    for (const m of members) {
      console.log(`  ${m.displayName.padEnd(maxName)}  ${chalk.dim(m.uniqueName)}`);
    }
    console.log();
  });

program
  .command("devops:inspect")
  .argument("<id>", "ID numerico del work item ADO")
  .description("Diagnostica un work item specifico: mostra tutti i campi e spiega perch\u00e9 potrebbe non apparire nel watcher")
  .action(async (rawId: string) => {
    const id = parseInt(rawId, 10);
    if (!Number.isFinite(id)) {
      console.error(chalk.red(`ID non valido: ${rawId}`));
      process.exitCode = 1;
      return;
    }

    const client = await getAdoClient();
    if (!client) { process.exitCode = 1; return; }

    let item: WorkItemDetail | null;
    try {
      item = await client.inspectWorkItem(id);
    } catch (err) {
      console.error(chalk.red(`Errore: ${err instanceof Error ? err.message : String(err)}`));
      process.exitCode = 1;
      return;
    }

    if (!item) {
      console.log(chalk.yellow(`\nWork item #${id} non trovato (404).`));
      return;
    }

    const row = (label: string, value: string) =>
      `  ${chalk.dim(label.padEnd(20))} ${value}`;

    console.log(chalk.bold(`\n  Work item #${item.id}\n`));
    console.log(row("Titolo:",        item.title));
    console.log(row("Tipo:",          item.workItemType));
    console.log(row("Stato:",         item.state));
    console.log(row("Assegnato a:",   item.assignedTo || "(nessuno)"));
    console.log(row("Email:",         item.assignedToEmail || "(nessuna)"));
    console.log(row("Progetto:",      item.teamProject));
    console.log(row("Area path:",     item.areaPath));
    console.log(row("Iterazione:",    item.iterationPath));
    console.log(row("Priorit\u00e0:",      item.priority !== null ? `P${item.priority}` : "(nessuna)"));
    console.log(row("Creato:",        item.createdDate.slice(0, 10)));
    console.log(row("Modificato:",    item.changedDate.slice(0, 10)));
    console.log(row("URL:",           item.url));

    // Diagnostica perch\u00e9 non appare nel watcher
    const issues: string[] = [];
    const orgUrl  = process.env["ADO_ORG_URL"] ?? "";
    const project = process.env["ADO_PROJECT"] ?? "";

    if (item.teamProject.toLowerCase() !== project.toLowerCase()) {
      issues.push(`Il progetto ADO dell'item ("${item.teamProject}") \u2260 ADO_PROJECT ("${project}")`);
    }
    if (!item.assignedToEmail && !item.assignedTo) {
      issues.push("L'item non \u00e8 assegnato a nessuno \u2014 il filtro @Me lo esclude.");
    }

    const watchedStates = ["New", "Active"];
    if (!watchedStates.includes(item.state)) {
      issues.push(`Stato "${item.state}" non \u00e8 tra quelli monitorati (selezionalo nel prompt del watcher).`);
    }

    if (issues.length > 0) {
      console.log(chalk.yellow(`\n  ⚠ Perch\u00e9 non appare nel watcher:`));
      for (const issue of issues) console.log(chalk.yellow(`    \u2022 ${issue}`));
    } else {
      console.log(chalk.green(`\n  \u2713 Il work item dovrebbe apparire nel watcher.`));
      const meEmail = process.env["ADO_ME_EMAIL"];
      if (meEmail) {
        console.log(chalk.dim(`    Filtro attivo: ADO_ME_EMAIL="${meEmail}" \u2192 usato al posto di @Me.`));
      } else {
        console.log(chalk.dim(`    Se non appare, imposta ADO_ME_EMAIL=${item.assignedToEmail} nel .env`));
      }
    }
    console.log();
  });

// ─── Analisi AI dei work item ────────────────────────────────────────────────

interface ProjectConfig {
  name: string;
  sourceRoot: string;
  description?: string | undefined;
  areaPaths: string[];
}

interface ProjectContext {
  framework?: string | undefined;
  projects?: ProjectConfig[] | undefined;
}

/** Mostra un checkbox con tutti i work item — nessuno pre-selezionato */
async function selectItemsToAnalyze(items: WorkItemSummary[]): Promise<WorkItemSummary[]> {
  if (!process.stdin.isTTY || items.length === 0) return items;

  const sprintOf = (p: string) => {
    const m = p.match(/sprint\s*(\d+)/i);
    return m?.[1] !== undefined ? `S${m[1]}` : p.split(/[/\\]/).at(-1) ?? "—";
  };

  const choices = items.map(i => ({
    value: String(i.id),   // sempre stringa per evitare mismatch di tipo
    name: `#${String(i.id).padEnd(7)} [${i.workItemType.padEnd(4)}] ${sprintOf(i.iterationPath).padEnd(5)}  ${i.title.slice(0, 60)}`,
    checked: false,        // nessuno pre-selezionato: l'utente sceglie esplicitamente
  }));

  console.log(chalk.dim("  Spazio = seleziona/deseleziona  |  A = tutti  |  Enter = conferma\n"));

  let selected: string[];
  try {
    selected = await checkbox<string>({
      message: `Work item da analizzare (${items.length} disponibili):`,
      choices,
      pageSize: 20,
    });
  } catch {
    return items; // Ctrl+C → analizza tutto
  }

  if (selected.length === 0) {
    console.log(chalk.yellow("  Nessun item selezionato — analisi di tutti i work item.\n"));
    return items;
  }

  const selectedSet = new Set(selected);
  return items.filter(i => selectedSet.has(String(i.id)));
}
function matchProject(
  areaPath: string,
  projects: ProjectConfig[]
): ProjectConfig | undefined {
  return (
    projects.find(p => p.areaPaths.some(ap => areaPath.startsWith(ap))) ??
    projects[0]
  );
}

function buildAnalysisDescription(
  item: WorkItemSummary,
  project: ProjectConfig | undefined
): string {
  const sprint  = item.iterationPath.split(/[/\\]/).at(-1) ?? "";
  const prio    = item.priority !== null ? `P${item.priority}` : "non definita";
  const srcNote = project
    ? `Codice sorgente in: ${project.sourceRoot}/src/  (${project.description ?? project.name})`
    : "Codice sorgente non configurato per questa area.";
  return [
    `Analizza il ${item.workItemType} ADO #${item.id}:`,
    `Titolo: "${item.title}"`,
    `Tipo: ${item.workItemType} | Stato: ${item.state} | Priorità: ${prio} | Sprint: ${sprint}`,
    `Area: ${item.areaPath}`,
    `URL: ${item.url}`,
    ``,
    srcNote,
    ``,
    `Obiettivi:`,
    `1. Identifica il componente Angular impattato (da areaPath e titolo).`,
    `2. Suggerisci passi di investigazione specifici.`,
    `3. Stima la complessit\u00e0 (bassa/media/alta) con motivazione.`,
    `4. Proponi una strategia di fix con approccio tecnico.`,
    `5. Identifica dipendenze o rischi.`,
    ``,
    `Rispondi SOLO con JSON valido. Non modificare file.`,
  ].join("\n");
}

program
  .command("devops:analyze")
  .option("--only-bugs", "Analizza solo i Bug (ignora Task e User Story)")
  .description("Avvia un'analisi AI per ogni work item in workspace/output/devops-items.json")
  .action(async (options: { onlyBugs?: boolean }) => {
    const itemsPath = path.join(rootDir, "workspace", "output", "devops-items.json");
    let items: WorkItemSummary[];
    try {
      const raw = await readJson<{ items: WorkItemSummary[] }>(itemsPath);
      items = raw.items ?? [];
      if (options.onlyBugs) items = items.filter(i => i.workItemType === "Bug");
    } catch {
      console.error(chalk.red(
        "Errore: workspace/output/devops-items.json non trovato.\n" +
        "Avvia prima: npm run watch:devops"
      ));
      process.exitCode = 1; return;
    }

    if (items.length === 0) {
      console.log(chalk.yellow("Nessun item da analizzare."));
      return;
    }

    // Selezione interattiva — tutti pre-selezionati
    items = await selectItemsToAnalyze(items);

    if (items.length === 0) {
      console.log(chalk.yellow("Nessun item selezionato."));
      return;
    }

    // Leggi configurazione progetti
    let projectCtx: ProjectContext = {};
    try {
      projectCtx = await readJson<ProjectContext>(
        path.join(rootDir, "workspace", "context", "project.json")
      );
    } catch { /* usa default */ }
    const projects = projectCtx.projects ?? [];

    console.log(chalk.cyan(`\n  Analisi AI — ${items.length} work item`));
    console.log(chalk.dim(`  Provider: copilot / claude-sonnet-5`));
    console.log(chalk.dim(`  Progetti configurati: ${projects.length > 0 ? projects.map(p => p.name).join(", ") : "nessuno"}`));
    console.log(chalk.dim(`  Output: workspace/reports/devops/\n`));

    const plan: ExecutionPlan = {
      id: `devops-analysis-${Date.now()}`,
      objective: `Analisi AI dei work item ADO: ${items.map(i => `#${i.id}`).join(", ")}`,
      projectRoot: ".",
      contextFiles: ["workspace/context/project.json"],
      createGitCheckpoints: false,
      tasks: items.map(item => {
        const proj = matchProject(item.areaPath, projects);
        const srcGlob = proj ? `${proj.sourceRoot}/src/**` : null;
        return {
          id: `analyze-${item.id}`,
          title: `#${item.id} ${item.workItemType}: ${item.title.slice(0, 50)}`,
          description: buildAnalysisDescription(item, proj),
          agentId: "devops-watcher-agent",
          skillIds: [],
          dependencies: [],
          inputPaths: [
            "workspace/output/devops-items.json",
            "workspace/context/project.json",
            ...(srcGlob ? [srcGlob] : []),
          ],
          outputPaths: [`workspace/reports/devops/item-${item.id}-analysis.json`],
          validationCriteria: [],
          status: "pending" as const,
          attempts: 0,
          maxAttempts: 1,
          continueOnError: true,
          metadata: {
            adoId:       item.id,
            adoType:     item.workItemType,
            adoPriority: item.priority,
            adoUrl:      item.url,
          },
        };
      }),
    };

    const { config, orchestrator } = await createRuntime();
    // Assicura che la cartella output esista
    await (await import("./fs-utils.js")).ensureDir(
      path.join(rootDir, "workspace", "reports", "devops")
    );
    console.log(chalk.cyan(`  Provider attivo: ${config.defaultProvider}\n`));

    const report = await orchestrator.execute(plan);

    for (const task of report.tasks) {
      const marker = task.status === "completed" ? chalk.green("\u2713") :
                     task.status === "skipped"   ? chalk.yellow("\u2022") :
                                                   chalk.red("\u2717");
      console.log(`${marker} ${task.id}: ${task.status}`);
      if (task.summary) console.log(chalk.dim(`    ${task.summary}`));
    }

    console.log(
      report.success
        ? chalk.green("\nAnalisi completata. Report in workspace/reports/devops/")
        : chalk.red("\nAnalisi non completata.")
    );
    process.exitCode = report.success ? 0 : 1;
  });

program.parseAsync().catch(error => {
  console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
