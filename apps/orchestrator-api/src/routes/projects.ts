import { Router } from "express";
import path from "node:path";
import { readFile, writeFile, access } from "node:fs/promises";
import { ROOT_DIR } from "../config.js";

export const projectsRouter = Router();

const PROJECTS_FILE = path.join(ROOT_DIR, "workspace", "projects.json");

async function loadProjects(): Promise<ProjectDefinition[]> {
  try {
    await access(PROJECTS_FILE);
    const content = await readFile(PROJECTS_FILE, "utf8");
    return JSON.parse(content) as ProjectDefinition[];
  } catch {
    return [];
  }
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
