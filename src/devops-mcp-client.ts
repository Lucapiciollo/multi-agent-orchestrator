/**
 * Client Azure DevOps via MCP Server (@azure-devops/mcp).
 *
 * Lancia il processo MCP in stdio e comunica via JSON-RPC 2.0.
 * L'autenticazione è gestita interamente dal server MCP
 * (usa le credenziali VS Code / Azure CLI già configurate).
 *
 * Fix Windows: npx su Windows è uno script .cmd — serve npx.cmd con spawn shell:false.
 */

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import type { WorkItemSummary } from "./devops-client.js";

/** Spawn del server MCP — usa cmd /c su Windows per evitare EINVAL e shell:true */
function spawnMcpProcess(org: string) {
  if (process.platform === "win32") {
    return spawn("cmd", ["/c", "npx", "-y", "@azure-devops/mcp", org], {
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
      windowsHide: true,
    });
  }
  return spawn("npx", ["-y", "@azure-devops/mcp", org], {
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
    windowsHide: true,
  });
}

interface RpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: unknown;
}

interface RpcNotification {
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
}

interface RpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: { code: number; message: string } | undefined;
}

function isRpcResponse(v: unknown): v is RpcResponse {
  return (
    typeof v === "object" &&
    v !== null &&
    (v as Record<string, unknown>)["jsonrpc"] === "2.0" &&
    typeof (v as Record<string, unknown>)["id"] === "number" &&
    ("result" in v || "error" in v)
  );
}

// ─── MCP-specific types ────────────────────────────────────────────────────

interface McpTool {
  name: string;
  description?: string | undefined;
}

interface McpToolsListResult {
  tools: McpTool[];
}

interface McpContentItem {
  type: string;
  text?: string | undefined;
}

interface McpToolCallResult {
  content: McpContentItem[];
  isError?: boolean | undefined;
}

function isMcpToolsListResult(v: unknown): v is McpToolsListResult {
  return (
    typeof v === "object" &&
    v !== null &&
    Array.isArray((v as Record<string, unknown>)["tools"])
  );
}

function isMcpToolCallResult(v: unknown): v is McpToolCallResult {
  return (
    typeof v === "object" &&
    v !== null &&
    Array.isArray((v as Record<string, unknown>)["content"])
  );
}

// ─── ADO item mapping ──────────────────────────────────────────────────────

interface AdoItemRaw {
  id?: number | undefined;
  fields?: Record<string, unknown> | undefined;
  [key: string]: unknown;
}

function mapToSummary(raw: AdoItemRaw, org: string, project: string): WorkItemSummary {
  const f: Record<string, unknown> = raw.fields ?? raw;
  const id = typeof raw.id === "number" ? raw.id : 0;

  const assignedTo = f["System.AssignedTo"];
  const assignedToStr =
    typeof assignedTo === "string"
      ? assignedTo
      : typeof assignedTo === "object" && assignedTo !== null
        ? String((assignedTo as Record<string, unknown>)["displayName"] ?? "")
        : "";

  const priority = f["Microsoft.VSTS.Common.Priority"];

  return {
    id,
    title: String(f["System.Title"] ?? ""),
    workItemType: String(f["System.WorkItemType"] ?? ""),
    state: String(f["System.State"] ?? ""),
    priority: typeof priority === "number" ? priority : null,
    assignedTo: assignedToStr,
    createdDate: String(f["System.CreatedDate"] ?? ""),
    areaPath: String(f["System.AreaPath"] ?? ""),
    iterationPath: String(f["System.IterationPath"] ?? ""),
    url: `https://dev.azure.com/${org}/${project}/_workitems/edit/${id}`,
  };
}

function parseToolText(text: string, org: string, project: string): WorkItemSummary[] {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed)) {
      return (parsed as AdoItemRaw[]).map(item => mapToSummary(item, org, project));
    }
    if (typeof parsed === "object" && parsed !== null) {
      const obj = parsed as Record<string, unknown>;
      if (Array.isArray(obj["value"])) {
        return (obj["value"] as AdoItemRaw[]).map(item => mapToSummary(item, org, project));
      }
      if (Array.isArray(obj["workItems"])) {
        return (obj["workItems"] as AdoItemRaw[]).map(item => mapToSummary(item, org, project));
      }
    }
  } catch {
    // risposta testuale non strutturata
  }
  return [];
}

// ─── Tool discovery ────────────────────────────────────────────────────────

// Candidati in ordine di preferenza — i tool ADO MCP ufficiali hanno prefisso wit_
const QUERY_TOOL_CANDIDATES = [
  "wit_query_by_wiql",          // @azure-devops/mcp ufficiale
  "wit_get_query_results_by_id",// alternativa MCP
  "query_work_items",
  "run_wiql",
  "search_work_items",
  "list_work_items",
  "get_work_items",
];

function findQueryTool(tools: McpTool[]): McpTool | undefined {
  for (const name of QUERY_TOOL_CANDIDATES) {
    const found = tools.find(t => t.name === name);
    if (found !== undefined) return found;
  }
  // Fallback: cerca tool con "wiql" o "query" nel nome, ma NON "backlog" o "iteration"
  return tools.find(t =>
    (t.name.includes("wiql") || t.name.includes("query")) &&
    !t.name.includes("backlog") &&
    !t.name.includes("iteration")
  );
}

function buildToolArgs(toolName: string, wiql: string, project: string): Record<string, unknown> {
  switch (toolName) {
    // Tool nativi @azure-devops/mcp
    case "wit_query_by_wiql":
      return { wiql, project, timePrecision: false, top: 200 };
    case "wit_get_query_results_by_id":
      return { wiql, project };
    // Tool generici
    case "query_work_items":
    case "run_wiql":
      return { wiql, project };
    case "search_work_items":
    case "list_work_items":
      return { query: wiql, project };
    default:
      return { wiql, query: wiql, project };
  }
}

// ─── Helpers MCP session ───────────────────────────────────────────────────

type PendingMap = Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>;

function attachRpcReader(
  child: ReturnType<typeof spawn>,
  pending: PendingMap
): void {
  if (!child.stdout) return;
  const rl = createInterface({ input: child.stdout });
  rl.on("line", (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let msg: unknown;
    try { msg = JSON.parse(trimmed); } catch { return; }
    if (!isRpcResponse(msg)) return;
    const handler = pending.get(msg.id);
    if (!handler) return;
    pending.delete(msg.id);
    if (msg.error) {
      handler.reject(new Error(`MCP ${msg.error.code}: ${msg.error.message}`));
    } else {
      handler.resolve(msg.result);
    }
  });
}

function makeRpcHelpers(
  child: ReturnType<typeof spawn>,
  pending: PendingMap,
  idRef: { value: number },
  timeoutMs: number
) {
  const write = (msg: RpcRequest | RpcNotification): void => {
    child.stdin?.write(JSON.stringify(msg) + "\n");
  };

  const request = <T>(method: string, params?: unknown): Promise<T> => {
    const id = idRef.value++;
    return new Promise<T>((res, rej) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        rej(new Error(`MCP timeout (${timeoutMs}ms): ${method}`));
      }, timeoutMs);
      pending.set(id, {
        resolve: v => { clearTimeout(timer); res(v as T); },
        reject: e => { clearTimeout(timer); rej(e); },
      });
      write({ jsonrpc: "2.0", id, method, ...(params !== undefined ? { params } : {}) });
    });
  };

  return { write, request };
}

// ─── Client principale ─────────────────────────────────────────────────────

export class DevOpsMcpClient {
  constructor(
    private readonly org: string,
    private readonly project: string,
    private readonly timeoutMs: number = 60_000
  ) {}

  async getMyItems(states: string[] = ["New"], assignees: string[] = ["@Me"]): Promise<WorkItemSummary[]> {
    return new Promise<WorkItemSummary[]>((resolve, reject) => {
      const child = spawnMcpProcess(this.org);
      const pending: PendingMap = new Map();
      const idRef = { value: 1 };

      attachRpcReader(child, pending);

      child.on("error", reject);
      child.on("close", () => {
        for (const h of pending.values()) {
          h.reject(new Error("Processo MCP terminato inaspettatamente"));
        }
      });

      const { write, request } = makeRpcHelpers(child, pending, idRef, this.timeoutMs);

      const run = async (): Promise<WorkItemSummary[]> => {
        await request("initialize", {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "devops-watcher", version: "1.0.0" },
        });
        write({ jsonrpc: "2.0", method: "notifications/initialized" });

        const toolsResult = await request<unknown>("tools/list");
        if (!isMcpToolsListResult(toolsResult)) {
          throw new Error("tools/list ha restituito un formato inatteso");
        }

        const queryTool = findQueryTool(toolsResult.tools);
        if (!queryTool) {
          const names = toolsResult.tools.map(t => t.name).join(", ");
          throw new Error(`Nessun tool work-item trovato. Disponibili: ${names || "(nessuno)"}`);
        }

        const stateList = states.map(s => `'${s}'`).join(", ");

        // Costruisci filtro assegnatari (rispetta ADO_ME_EMAIL se impostato)
        const meEmail = process.env["ADO_ME_EMAIL"];
        const specificEmails = assignees.filter(a => a !== "@Me");
        const includeMe = assignees.includes("@Me");
        let assigneeFilter: string;
        if (specificEmails.length === 0) {
          assigneeFilter = meEmail
            ? `[System.AssignedTo] = '${meEmail}'`
            : "[System.AssignedTo] = @Me";
        } else if (includeMe && meEmail) {
          const all = [...new Set([meEmail, ...specificEmails])].map(e => `'${e}'`).join(", ");
          assigneeFilter = `[System.AssignedTo] IN (${all})`;
        } else if (includeMe) {
          const quoted = specificEmails.map(e => `'${e}'`).join(", ");
          assigneeFilter = `([System.AssignedTo] = @Me OR [System.AssignedTo] IN (${quoted}))`;
        } else {
          const quoted = specificEmails.map(e => `'${e}'`).join(", ");
          assigneeFilter = `[System.AssignedTo] IN (${quoted})`;
        }

        const wiql =
          `SELECT [System.Id],[System.Title],[System.WorkItemType],` +
          `[System.State],[Microsoft.VSTS.Common.Priority],` +
          `[System.AssignedTo],[System.CreatedDate],[System.AreaPath] ` +
          `FROM WorkItems ` +
          `WHERE ${assigneeFilter} ` +
          `AND [System.State] IN (${stateList}) ` +
          `AND [System.TeamProject] = '${this.project}' ` +
          `ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.CreatedDate] DESC`;

        const callResult = await request<unknown>("tools/call", {
          name: queryTool.name,
          arguments: buildToolArgs(queryTool.name, wiql, this.project),
        });
        child.stdin.end();

        if (!isMcpToolCallResult(callResult)) return [];
        if (callResult.isError === true) return [];
        const text = callResult.content.find(c => c.type === "text")?.text ?? "";
        return parseToolText(text, this.org, this.project);
      };

      run().then(resolve).catch(reject);
    });
  }

  /** Elenca i tool disponibili sul server MCP (utile per debug). */
  async listTools(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      const child = spawnMcpProcess(this.org);
      const pending: PendingMap = new Map();
      const idRef = { value: 1 };

      attachRpcReader(child, pending);
      child.on("error", reject);

      const { write, request } = makeRpcHelpers(child, pending, idRef, 60_000);

      const run = async (): Promise<string[]> => {
        await request("initialize", {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "devops-watcher", version: "1.0.0" },
        });
        write({ jsonrpc: "2.0", method: "notifications/initialized" });
        const result = await request<unknown>("tools/list");
        child.stdin.end();
        if (!isMcpToolsListResult(result)) return [];
        return result.tools.map(t => t.name);
      };

      run().then(resolve).catch(reject);
    });
  }
}