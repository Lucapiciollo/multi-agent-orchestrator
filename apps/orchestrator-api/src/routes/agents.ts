import { Router } from "express";
import { readJson } from "../utils.js";

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

agentsRouter.get("/", async (_req, res) => {
  try {
    const agents = await readJson<RawAgent[]>("agents/registry.json");
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
      provider: a.provider as AgentDefinition["provider"]
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
