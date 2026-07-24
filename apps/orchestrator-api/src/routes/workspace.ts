import { Router, Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import { ROOT_DIR } from "../config.js";

export const workspaceRouter = Router();

const INPUT_DIR = path.join(ROOT_DIR, "workspace", "input");

// Assicura che la cartella esista
async function ensureInputDir() {
  await fs.mkdir(INPUT_DIR, { recursive: true });
}

// GET /api/workspace/input — lista file caricati
workspaceRouter.get("/input", async (_req: Request, res: Response) => {
  try {
    await ensureInputDir();
    const files = await fs.readdir(INPUT_DIR);
    const details = await Promise.all(
      files.map(async (name) => {
        const stat = await fs.stat(path.join(INPUT_DIR, name));
        return { name, size: stat.size, uploadedAt: stat.mtime };
      })
    );
    res.json({ data: details });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/workspace/input — carica un file (base64 JSON)
// Body: { name: string, content: string (base64), mimeType?: string }
workspaceRouter.post("/input", async (req: Request, res: Response) => {
  try {
    const { name, content } = req.body as { name: string; content: string };
    if (!name || !content) {
      res.status(400).json({ error: "name e content obbligatori" });
      return;
    }
    // Sanitizza il nome file: solo basename, niente traversal
    const safeName = path.basename(name);
    if (!safeName || safeName.startsWith(".")) {
      res.status(400).json({ error: "Nome file non valido" });
      return;
    }
    await ensureInputDir();
    const buffer = Buffer.from(content, "base64");
    const dest = path.join(INPUT_DIR, safeName);
    await fs.writeFile(dest, buffer);
    res.json({ data: { name: safeName, size: buffer.length, path: `workspace/input/${safeName}` } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/workspace/input/:name — rimuove un file
workspaceRouter.delete("/input/:name", async (req: Request, res: Response) => {
  try {
    const safeName = path.basename(req.params["name"]);
    const target = path.join(INPUT_DIR, safeName);
    // Verifica che il file sia dentro INPUT_DIR (anti path traversal)
    const resolved = path.resolve(target);
    if (!resolved.startsWith(path.resolve(INPUT_DIR))) {
      res.status(403).json({ error: "Accesso negato" });
      return;
    }
    await fs.unlink(target);
    res.json({ data: { deleted: safeName } });
  } catch (e: any) {
    res.status(404).json({ error: "File non trovato" });
  }
});
