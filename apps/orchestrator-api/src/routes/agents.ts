import { Router } from "express";
import path from "node:path";
import { readdir } from "node:fs/promises";
import { readJson } from "../utils.js";
import { ROOT_DIR } from "../config.js";

export const agentsRouter = Router();

interface RawAgent {
  id: string;
  name: string;
  description: string;
  skills: string[];
  tags: string[];
  capabilities: string[];
  allowedPaths: string[];
  forbiddenPaths: string[];
  priority: number;
  provider?: {
    type: string;
    model?: string;
    fallbackProvider?: string;
    fallbackModel?: string;
    timeoutMs?: number;
  };
}
interface RawTask     { agentId?: string; }
interface RawWorkflow { id: string; tasks: RawTask[]; }

agentsRouter.get("/", async (_req, res) => {
  try {
    const agents = await readJson<RawAgent[]>("agents/registry.json");

    // Build reverse map: agentId → workflowIds
    const agentWorkflowMap = new Map<string, string[]>();
    try {
      const wfDir = path.join(ROOT_DIR, "workflows");
      const wfFiles = (await readdir(wfDir)).filter(f => f.endsWith(".workflow.json"));
      for (const file of wfFiles) {
        try {
          const wf = await readJson<RawWorkflow>(`workflows/${file}`);
          for (const task of wf.tasks ?? []) {
            if (!task.agentId) continue;
            const existing = agentWorkflowMap.get(task.agentId) ?? [];
            if (!existing.includes(wf.id)) existing.push(wf.id);
            agentWorkflowMap.set(task.agentId, existing);
          }
        } catch { /* skip malformed */ }
      }
    } catch { /* workflows dir not accessible */ }

    const data: AgentDefinition[] = agents.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      skills: a.skills ?? [],
      tags: a.tags ?? [],
      capabilities: a.capabilities ?? [],
      allowedPaths: a.allowedPaths ?? [],
      forbiddenPaths: a.forbiddenPaths ?? [],
      priority: a.priority ?? 0,
      provider: a.provider as AgentDefinition["provider"],
      usedByWorkflows: agentWorkflowMap.get(a.id) ?? []
    }));
    res.json({ data, meta: { total: data.length } });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err), statusCode: 500 });
  }
});

agentsRouter.get("/:id", async (req, res) => {
  try {
    const agents = await readJson<RawAgent[]>("agents/registry.json");
    const agent = agents.find(a => a.id === req.params["id"]);
    if (!agent) {
      res.status(404).json({ error: "NotFound", message: `Agent '${req.params["id"]}' not found`, statusCode: 404 });
      return;
    }
    res.json({ data: agent });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err), statusCode: 500 });
  }
});
