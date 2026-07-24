import { Router } from "express";
import path from "node:path";
import { readFile, writeFile, access } from "node:fs/promises";
import { ROOT_DIR } from "../config.js";

export const projectsRouter = Router();

const PROJECTS_FILE   = path.join(ROOT_DIR, "workspace", "projects.json");
const CONTEXT_FILE    = path.join(ROOT_DIR, "workspace", "context", "project.json");

async function loadProjects(): Promise<ProjectDefinition[]> {
  const results: ProjectDefinition[] = [];

  // 1. Legge workspace/projects.json (formato nativo)
  try {
    await access(PROJECTS_FILE);
    const raw = JSON.parse(await readFile(PROJECTS_FILE, "utf8")) as ProjectDefinition[];
    results.push(...raw);
  } catch { /* file non esiste */ }

  // 2. Legge workspace/context/project.json (formato contesto orchestratore)
  try {
    await access(CONTEXT_FILE);
    const ctx = JSON.parse(await readFile(CONTEXT_FILE, "utf8")) as {
      projects?: Array<{ name: string; sourceRoot?: string; description?: string; realPath?: string; }>;
    };
    const existingIds = new Set(results.map(p => p.id));
    for (const p of ctx.projects ?? []) {
      if (!existingIds.has(p.name)) {
        results.push({
          id:          p.name,
          name:        p.name,
          rootPath:    p.realPath ?? p.sourceRoot ?? p.name,
          type:        "angular",
          enabled:     true,
          description: p.description,
        });
      }
    }
  } catch { /* file non leggibile */ }

  return results;
}

async function saveProjects(projects: ProjectDefinition[]): Promise<void> {
  await writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
}

projectsRouter.get("/", async (_req, res) => {
  try {
    const data = await loadProjects();
    res.json({ data, meta: { total: data.length } });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err), statusCode: 500 });
  }
});

projectsRouter.post("/", async (req, res) => {
  const body = req.body as Partial<ProjectDefinition>;
  if (!body.id || !body.name || !body.rootPath) {
    res.status(400).json({ error: "BadRequest", message: "id, name and rootPath are required", statusCode: 400 });
    return;
  }
  try {
    const projects = await loadProjects();
    if (projects.some(p => p.id === body.id)) {
      res.status(409).json({ error: "Conflict", message: `Project '${body.id}' already exists`, statusCode: 409 });
      return;
    }
    const project: ProjectDefinition = {
      id: body.id,
      name: body.name,
      rootPath: body.rootPath,
      type: body.type ?? "generic",
      enabled: body.enabled ?? true,
      description: body.description
    };
    projects.push(project);
    await saveProjects(projects);
    res.status(201).json({ data: project });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err), statusCode: 500 });
  }
});

projectsRouter.delete("/:id", async (req, res) => {
  try {
    const projects = await loadProjects();
    const idx = projects.findIndex(p => p.id === req.params["id"]);
    if (idx < 0) {
      res.status(404).json({ error: "NotFound", message: "Project not found", statusCode: 404 });
      return;
    }
    projects.splice(idx, 1);
    await saveProjects(projects);
    res.json({ data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err), statusCode: 500 });
  }
});
