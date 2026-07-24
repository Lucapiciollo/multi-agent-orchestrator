/**
 * Azure DevOps Watcher — Daemon di polling
 *
 * Avvio:  npm run watch:devops
 *
 * Strategia di connessione (automatica):
 *   1. MCP server (@azure-devops/mcp)  ← preferito, usa credenziali VS Code
 *   2. REST API + ADO_PAT              ← fallback con PAT
 *   3. REST API + Azure CLI (az login) ← fallback senza PAT
 *
 * Configurazione minima nel .env:
 *   ADO_ORG_URL=https://dev.azure.com/agiccloud
 *   ADO_PROJECT=TimeVision
 */

import "dotenv/config";
import path from "node:path";
import chalk from "chalk";
import { checkbox, select } from "@inquirer/prompts";
import { DevOpsMcpClient } from "./devops-mcp-client.js";
import { DevOpsClient, resolveAuthHeader, type WorkItemSummary, type ProjectStateInfo, type MemberInfo, type IterationType } from "./devops-client.js";
import { writeJson, ensureDir } from "./fs-utils.js";

const rootDir = process.cwd();

// ─── Helpers ───────────────────────────────────────────────────────────────

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** OSC 8 hyperlink — cliccabile in Windows Terminal / iTerm2 */
function link(url: string, text: string): string {
  return `\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007`;
}

/** Estrae il numero o nome dello sprint dall'IterationPath */
function sprintLabel(iterationPath: string): string {
  const match = iterationPath.match(/sprint\s*(\d+)/i);
  if (match !== null && match[1] !== undefined) return `S${match[1]}`;
  const parts = iterationPath.split(/[/\\]/);
  const last = parts.at(-1) ?? "";
  return last === iterationPath.split(/[/\\]/)[0] ? "—" : last.slice(0, 10);
}

/** Colore della cella Stato in base al nome */
function colorState(state: string, padded: string): string {
  const s = state.toLowerCase();
  if (s.includes("new") || s.includes("to do") || s.includes("proposed") ||
      s.includes("plannabl") || s.includes("requested") || s.includes("approv")) {
    return chalk.blue(padded);
  }
  if (s.includes("progress") || s.includes("activ") || s.includes("analys") ||
      s.includes("design") || s.includes("work")) {
    return chalk.yellow(padded);
  }
  if (s.includes("resolv") || s.includes("review") || s.includes(" qa") ||
      s.includes("ready") || s.includes("verif")) {
    return chalk.cyan(padded);
  }
  if (s.includes("clos") || s.includes("done") || s.includes("complet") ||
      s.includes("business appr")) {
    return chalk.green(padded);
  }
  if (s.includes("remov") || s.includes("cancel") || s.includes("block")) {
    return chalk.gray(padded);
  }
  return padded;
}

function makeSep(widths: number[], l: string, m: string, r: string): string {
  return l + widths.map(w => "─".repeat(w + 2)).join(m) + r;
}

function formatTable(items: WorkItemSummary[]): string {
  const termWidth = process.stdout.columns ?? 140;

  const idW       = Math.max(...items.map(i => String(i.id).length), 5);
  const typeW     = Math.max(...items.map(i => i.workItemType.length), 4);
  const sprintW   = Math.max(...items.map(i => sprintLabel(i.iterationPath).length), 6);
  const stateW    = Math.max(...items.map(i => i.state.length), 5);

  const shortName = (s: string) => {
    const parts = s.split(" ");
    if (parts.length < 2) return s.slice(0, 12);
    return `${parts[0] ?? ""} ${(parts[1] ?? "").charAt(0)}.`;
  };
  const assigneeW = Math.max(...items.map(i => shortName(i.assignedTo).length), 8);

  const idColW = idW + 1; // include '#' prefix
  // Larghezza titolo = terminale - 6 colonne * (bordi+spazi) - larghezze fisse
  // Formula: termWidth = 3*(nCols+1=7) + sum(colWidths) → 7 borders + 12 spaces + colWidths
  const titleW = Math.max(15, termWidth - (19 + idColW + typeW + sprintW + stateW + assigneeW));

  const widths = [idColW, typeW, sprintW, stateW, assigneeW, titleW];
  const col    = (s: string, w: number) => s.padEnd(w);

  const top    = makeSep(widths, "┌", "┬", "┐");
  const mid    = makeSep(widths, "├", "┼", "┤");
  const bottom = makeSep(widths, "└", "┴", "┘");

  const head = "│ " + [
    chalk.bold(col("#ID",        idColW)),
    chalk.bold(col("Tipo",       typeW)),
    chalk.bold(col("Sprint",     sprintW)),
    chalk.bold(col("Stato",      stateW)),
    chalk.bold(col("Assegnato",  assigneeW)),
    chalk.bold("Titolo"),
  ].join(" │ ") + " │";

  const rows = items.map(i => {
    const idText    = `#${String(i.id).padStart(idW)}`;
    const idCell    = link(i.url, idText);
    const sprint    = col(sprintLabel(i.iterationPath), sprintW);
    const assignee  = col(shortName(i.assignedTo), assigneeW);
    const stateCell = colorState(i.state, col(i.state, stateW));
    const prioLen   = i.priority !== null ? 5 : 0;
    const prio      = i.priority !== null ? chalk.dim(` [P${i.priority}]`) : "";
    const maxT      = titleW - prioLen;
    const titleTxt  = i.title.length > maxT ? i.title.slice(0, maxT - 3) + "..." : i.title;
    const titleCell = titleTxt.padEnd(titleW - prioLen) + prio;
    return "│ " + [idCell, col(i.workItemType, typeW), sprint, stateCell, assignee, titleCell].join(" │ ") + " │";
  });

  return [top, head, mid, ...rows, bottom].join("\n");
}

// ─── Selezione sprint/iterazione ─────────────────────────────────────────────

async function selectIteration(): Promise<IterationType> {
  if (!process.stdin.isTTY) return "current";
  try {
    return await select<IterationType>({
      message: "Filtra per sprint:",
      choices: [
        { value: "current",     name: "Solo sprint corrente (@CurrentIteration)",    description: "Default" },
        { value: "all",         name: "Tutti  — sprint e backlog" },
        { value: "not-current", name: "Fuori dallo sprint corrente (backlog + altri sprint)" },
      ],
      default: "current",
    });
  } catch {
    return "current";
  }
}

// ─── Selezione membri ─────────────────────────────────────────────────────

async function selectMembers(members: MemberInfo[]): Promise<string[]> {
  if (!process.stdin.isTTY) return ["@Me"];

  const choices = [
    { value: "@Me", name: "@Me  — solo io (token corrente)", checked: true },
    ...members.map(m => ({
      value: m.uniqueName,
      name: `${m.displayName.padEnd(26)} <${m.uniqueName}>`,
      checked: false,
    })),
  ];

  let selected: string[];
  try {
    selected = await checkbox({
      message: "Membri da monitorare (Spazio = toggle, A = tutti, Enter = conferma):",
      choices,
      pageSize: 12,
    });
  } catch {
    return ["@Me"];
  }

  return selected.length > 0 ? selected : ["@Me"];
}

// ─── Selezione stati ─────────────────────────────────────────────────────

/** Stati di fallback se l'API non risponde */
const FALLBACK_STATES: ProjectStateInfo[] = [
  { name: "New",      category: "Proposed"   },
  { name: "Active",   category: "InProgress" },
  { name: "Resolved", category: "Resolved"   },
  { name: "Closed",   category: "Completed"  },
];

const CATEGORY_LABEL: Record<string, string> = {
  Proposed:   "da fare",
  InProgress: "in lavorazione",
  Resolved:   "risolto, da verificare",
  Completed:  "completato / chiuso",
  Removed:    "rimosso",
};

async function selectStates(projectStates: ProjectStateInfo[]): Promise<string[]> {
  if (!process.stdin.isTTY) return ["New"];

  const src = projectStates.length > 0 ? projectStates : FALLBACK_STATES;
  const choices = src.map(s => ({
    value: s.name,
    name: `${s.name.padEnd(14)} [${(CATEGORY_LABEL[s.category] ?? s.category)}]`,
    checked: s.category === "Proposed" || s.category === "InProgress",
  }));

  let selected: string[];
  try {
    selected = await checkbox({
      message: "Stati da monitorare (Spazio = toggle, A = tutti, Enter = conferma):",
      choices,
      pageSize: 12,
    });
  } catch {
    return ["New"];
  }

  return selected.length > 0 ? selected : ["New"];
}

// ─── Ciclo di polling ──────────────────────────────────────────────────────

async function poll(
  fetcher: () => Promise<WorkItemSummary[]>,
  project: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  process.stdout.write(`\n[${timestamp}] Polling ${project}...`);

  try {
    const items = await fetcher();

    const outputPath = path.join(rootDir, "workspace", "output", "devops-items.json");
    await ensureDir(path.dirname(outputPath));
    await writeJson(outputPath, {
      fetchedAt: timestamp,
      count: items.length,
      items,
    });

    if (items.length === 0) {
      console.log(` nessun item negli stati selezionati.`);
      return;
    }

    console.log(` ${items.length} item:\n`);
    console.log(formatTable(items));
    console.log(`\n  Salvati in workspace/output/devops-items.json`);
  } catch (err) {
    console.error(`\n  ✗ Errore: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Strategia di connessione ──────────────────────────────────────────────

async function buildFetcher(
  orgUrl: string,
  project: string,
  orgName: string,
  states: string[],
  assignees: string[],
  iteration: IterationType
): Promise<() => Promise<WorkItemSummary[]>> {

  // Info MCP (solo diagnostica — non usato per le query)
  if (orgName && process.env["ADO_MCP_INFO"] === "true") {
    try {
      const mcp = new DevOpsMcpClient(orgName, project);
      const tools = await mcp.listTools();
      console.log(`  MCP info: ${tools.length} tool disponibili`);
    } catch { /* silenzioso */ }
  }

  // REST API con PAT — unica fonte affidabile per le query
  process.stdout.write("  Connessione via REST API... ");
  let authHeader: string;
  try {
    authHeader = await resolveAuthHeader();
    console.log("OK");
  } catch (err) {
    console.error(`\n  ✗ ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
  const client = new DevOpsClient(orgUrl, project, authHeader);
  return () => client.getMyItems(states, assignees, iteration);
}

// ─── Entry point ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const orgUrl = process.env["ADO_ORG_URL"];
  const project = process.env["ADO_PROJECT"];
  const intervalMs = parsePositiveInt(process.env["ADO_POLL_INTERVAL_MS"], 300_000);

  if (!orgUrl || !project) {
    console.error(
      "Errore: ADO_ORG_URL e ADO_PROJECT devono essere impostati nel .env\n" +
      "  Esempio:\n" +
      "    ADO_ORG_URL=https://dev.azure.com/agiccloud\n" +
      "    ADO_PROJECT=TimeVision"
    );
    process.exit(1);
  }

  const orgName = orgUrl.replace(/\/$/, "").split("/").at(-1) ?? "";

  console.log("╔══════════════════════════════════════════╗");
  console.log("║  Azure DevOps Watcher  (MCP + REST)      ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`  Org:        ${orgUrl}`);
  console.log(`  Project:    ${project}`);
  console.log(`  Intervallo: ${intervalMs / 1000}s`);

  // Leggi gli stati reali dal progetto ADO (via REST), poi mostra la selezione
  let projectStates: ProjectStateInfo[] = [];
  let teamMembers: MemberInfo[] = [];
  let metaClient: DevOpsClient | null = null;
  try {
    const authForMeta = await resolveAuthHeader();
    metaClient = new DevOpsClient(orgUrl, project, authForMeta);
    process.stdout.write("  Lettura stati del progetto... ");
    projectStates = await metaClient.fetchProjectStates();
    console.log(projectStates.length > 0 ? `${projectStates.length} stati trovati` : "nessuno (uso default)");
    process.stdout.write("  Lettura membri del team...    ");
    teamMembers = await metaClient.fetchTeamMembers();
    console.log(teamMembers.length > 0 ? `${teamMembers.length} membri trovati` : "nessuno (uso @Me)");
  } catch {
    console.log("  Impossibile leggere metadati da ADO — uso valori predefiniti.");
  }

  const states = await selectStates(projectStates);
  console.log(`  Stati:      ${states.join(", ")}`);

  const iteration = await selectIteration();
  const iterLabel = iteration === "current" ? "sprint corrente" : iteration === "not-current" ? "fuori sprint" : "tutti";
  console.log(`  Sprint:     ${iterLabel}`);

  const assignees = await selectMembers(teamMembers);
  console.log(`  Membri:     ${assignees.join(", ")}`);

  const fetcher = await buildFetcher(orgUrl, project, orgName, states, assignees, iteration);

  await poll(fetcher, project);

  setInterval(() => { void poll(fetcher, project); }, intervalMs);
  console.log("\n  Watcher attivo. Premi Ctrl+C per uscire.");
}

// Gestione graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n  Watcher fermato.");
  process.exit(0);
});

void main();
