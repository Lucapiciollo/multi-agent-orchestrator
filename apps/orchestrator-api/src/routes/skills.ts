import { Router } from "express";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { readJson } from "../utils.js";
import { ROOT_DIR } from "../config.js";

export const skillsRouter = Router();

interface RawSkill { id: string; name: string; description: string; file: string; }
interface RawAgent { id: string; skills: string[]; }

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

    const data: SkillDefinition[] = rawSkills.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      file: s.file,
      usedByAgents: skillAgentMap.get(s.id) ?? []
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
