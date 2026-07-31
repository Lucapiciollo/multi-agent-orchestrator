import { Router } from "express";
import path from "node:path";
import { readFile, readdir } from "node:fs/promises";
import { readJson } from "../utils.js";
import { ROOT_DIR } from "../config.js";

export const skillsRouter = Router();

interface RawSkill    { id: string; name: string; description: string; file: string; }
interface RawAgent    { id: string; skills: string[]; }
interface RawTask     { skillIds?: string[]; }
interface RawWorkflow { id: string; tasks: RawTask[]; }

interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  file: string;
  usedByAgents: string[];
  usedByWorkflows: string[];
  content?: string;
}

skillsRouter.get("/", async (_req, res) => {
  try {
    const [rawSkills, rawAgents] = await Promise.all([
      readJson<RawSkill[]>("skills/registry.json"),
      readJson<RawAgent[]>("agents/registry.json"),
    ]);

    // Build reverse map: skillId → agentIds
    const skillAgentMap = new Map<string, string[]>();
    for (const agent of rawAgents) {
      for (const skillId of agent.skills ?? []) {
        const existing = skillAgentMap.get(skillId) ?? [];
        existing.push(agent.id);
        skillAgentMap.set(skillId, existing);
      }
    }

    // Build reverse map: skillId → workflowIds (scanning all workflow files)
    const skillWorkflowMap = new Map<string, string[]>();
    try {
      const wfDir = path.join(ROOT_DIR, "workflows");
      const wfFiles = (await readdir(wfDir)).filter(f => f.endsWith(".workflow.json"));
      for (const file of wfFiles) {
        try {
          const wf = await readJson<RawWorkflow>(`workflows/${file}`);
          for (const task of wf.tasks ?? []) {
            for (const skillId of task.skillIds ?? []) {
              const existing = skillWorkflowMap.get(skillId) ?? [];
              if (!existing.includes(wf.id)) existing.push(wf.id);
              skillWorkflowMap.set(skillId, existing);
            }
          }
        } catch { /* skip malformed */ }
      }
    } catch { /* workflows dir not accessible */ }

    const data: SkillDefinition[] = rawSkills.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      file: s.file,
      usedByAgents: skillAgentMap.get(s.id) ?? [],
      usedByWorkflows: skillWorkflowMap.get(s.id) ?? []
    }));
    res.json({ data, meta: { total: data.length } });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err), statusCode: 500 });
  }
});

skillsRouter.get("/:id", async (req, res) => {
  try {
    const rawSkills = await readJson<RawSkill[]>("skills/registry.json");
    const skill = rawSkills.find(s => s.id === req.params["id"]);
    if (!skill) {
      res.status(404).json({ error: "NotFound", message: `Skill '${req.params["id"]}' not found`, statusCode: 404 });
      return;
    }
    let content: string | undefined;
    try {
      content = await readFile(path.join(ROOT_DIR, skill.file), "utf8");
    } catch { /* file not accessible */ }

    res.json({ data: { ...skill, content } });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err), statusCode: 500 });
  }
});
