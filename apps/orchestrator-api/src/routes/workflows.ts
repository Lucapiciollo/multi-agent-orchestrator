import { Router } from "express";
import path from "node:path";
import { readdir } from "node:fs/promises";
import { readJson } from "../utils.js";
import { ROOT_DIR } from "../index.js";

export const workflowsRouter = Router();

interface RawAgent { id: string; skills: string[]; }

function effectiveSkills(agentSkills: string[], taskSkillIds: string[]): string[] {
  return [...new Set([...agentSkills, ...taskSkillIds])];
}

async function loadWorkflows(): Promise<WorkflowDefinition[]> {
  const agentsRaw = await readJson<RawAgent[]>("agents/registry.json");
  const agentSkillMap = new Map(agentsRaw.map(a => [a.id, a.skills ?? []]));

  const dir = path.join(ROOT_DIR, "workflows");
  const files = (await readdir(dir)).filter(f => f.endsWith(".workflow.json"));

  const workflows: WorkflowDefinition[] = [];
  for (const file of files) {
    try {
      const raw = await readJson<WorkflowDefinition>(`workflows/${file}`);
      const enriched: WorkflowDefinition = {
        ...raw,
        tasks: raw.tasks.map(task => ({
          ...task,
          effectiveSkills: effectiveSkills(
            agentSkillMap.get(task.agentId) ?? [],
            task.skillIds ?? []
          )
        }))
      };
      workflows.push(enriched);
    } catch { /* skip malformed */ }
  }
  return workflows;
}

workflowsRouter.get("/", async (_req, res) => {
  try {
    const data = await loadWorkflows();
    res.json({ data, meta: { total: data.length } });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err), statusCode: 500 });
  }
});

workflowsRouter.get("/:id", async (req, res) => {
  try {
    const workflows = await loadWorkflows();
    const wf = workflows.find(w => w.id === req.params["id"]);
    if (!wf) {
      res.status(404).json({ error: "NotFound", message: `Workflow '${req.params["id"]}' not found`, statusCode: 404 });
      return;
    }
    res.json({ data: wf });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err), statusCode: 500 });
  }
});
