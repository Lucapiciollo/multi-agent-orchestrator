import { Router } from "express";
import path from "node:path";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
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
      skills: skillOverrides.get(a.id) ?? a.skills ?? [],
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

// ── In-memory skill overrides con persistenza su disco ───────────────────
const OVERRIDES_PATH = path.join(ROOT_DIR, "workspace", "logs", "skill-overrides.json");
const skillOverrides = new Map<string, string[]>();

// Carica overrides da disco all'avvio
(async () => {
  try {
    if (existsSync(OVERRIDES_PATH)) {
      const raw = await readFile(OVERRIDES_PATH, "utf8");
      const saved: Record<string, string[]> = JSON.parse(raw);
      for (const [agentId, skills] of Object.entries(saved)) {
        skillOverrides.set(agentId, skills);
      }
      console.log(`[skill-overrides] Loaded ${skillOverrides.size} overrides from disk`);
    }
  } catch { /* first run */ }
})();

async function persistOverrides() {
  try {
    await mkdir(path.dirname(OVERRIDES_PATH), { recursive: true });
    const obj: Record<string, string[]> = {};
    for (const [k, v] of skillOverrides) obj[k] = v;
    await writeFile(OVERRIDES_PATH, JSON.stringify(obj, null, 2), "utf8");
  } catch { /* non-critical */ }
}

agentsRouter.get("/:id/skills", async (req, res) => {
  const agentId = req.params["id"] ?? "";
  try {
    const agents = await readJson<RawAgent[]>("agents/registry.json");
    const agent = agents.find(a => a.id === agentId);
    if (!agent) { res.status(404).json({ error: "NotFound", message: "Agent not found", statusCode: 404 }); return; }
    const allSkills = await readJson<{ id: string; name: string; description: string }[]>("skills/registry.json");
    const activeSkills = skillOverrides.get(agentId) ?? agent.skills ?? [];
    res.json({
      data: allSkills.map(s => ({ ...s, active: activeSkills.includes(s.id) })),
      activeSkills
    });
  } catch (err) { res.status(500).json({ error: "InternalError", message: String(err), statusCode: 500 }); }
});

agentsRouter.patch("/:id/skills", async (req, res) => {
  const agentId = req.params["id"] ?? "";
  const { skills } = req.body as { skills: string[] };
  if (!Array.isArray(skills)) { res.status(400).json({ error: "BadRequest", message: "skills deve essere un array", statusCode: 400 }); return; }
  skillOverrides.set(agentId, skills);
  await persistOverrides();
  res.json({ data: { agentId, skills, overridden: true, persisted: true } });
});

agentsRouter.delete("/:id/skills/override", async (req, res) => {
  const agentId = req.params["id"] ?? "";
  skillOverrides.delete(agentId);
  await persistOverrides();
  res.json({ data: { agentId, reset: true } });
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
