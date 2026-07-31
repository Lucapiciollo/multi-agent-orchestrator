import { Router, Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import { ROOT_DIR } from "../config.js";
import { findWorkflow, createAndRunExecution } from "./executions.js";

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

// GET /api/workspace/routing — restituisce le regole di routing file→workflow
workspaceRouter.get("/routing", async (_req: Request, res: Response) => {
  try {
    const routingPath = path.join(ROOT_DIR, "workspace", "routing.json");
    const raw = await fs.readFile(routingPath, "utf-8");
    res.json({ data: JSON.parse(raw) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/workspace/upload-and-run
// Body: { name: string, content: string (base64), mimeType?: string, workflowId?: string }
// 1. Salva il file in workspace/input/
// 2. Se workflowId è specificato dall'utente, usa direttamente quello (scelta manuale).
//    Altrimenti l'orchestratore decide da solo consultando workspace/routing.json.
// 3. Avvia l'esecuzione e restituisce l'execution ID
workspaceRouter.post("/upload-and-run", async (req: Request, res: Response) => {
  try {
    const { name, content, mimeType, workflowId } = req.body as {
      name: string; content: string; mimeType?: string; workflowId?: string;
    };
    if (!name || !content) {
      res.status(400).json({ error: "name e content obbligatori" });
      return;
    }
    const safeName = path.basename(name);
    if (!safeName || safeName.startsWith(".")) {
      res.status(400).json({ error: "Nome file non valido" });
      return;
    }

    // 1. Salva file
    await ensureInputDir();
    const buffer = Buffer.from(content, "base64");
    const dest = path.join(INPUT_DIR, safeName);
    await fs.writeFile(dest, buffer);

    // 2. Workflow scelto manualmente dall'utente: bypassa il routing automatico
    if (workflowId) {
      try {
        await findWorkflow(workflowId);
      } catch {
        res.status(404).json({ error: `Workflow '${workflowId}' non trovato` });
        return;
      }

      const execution = await createAndRunExecution(workflowId);

      res.status(201).json({
        data: {
          file: { name: safeName, size: buffer.length },
          matched: { ruleId: "manual", label: "Selezionato manualmente", workflowId },
          execution
        }
      });
      return;
    }

    // 3. Nessun workflow specificato: l'orchestratore decide da solo tramite routing.json
    const routingPath = path.join(ROOT_DIR, "workspace", "routing.json");
    const routingRaw = await fs.readFile(routingPath, "utf-8");
    const routing = JSON.parse(routingRaw) as {
      rules: Array<{ id: string; label: string; match: { extensions: string[]; mimeTypes: string[] }; workflowId: string }>
    };

    const ext = path.extname(safeName).toLowerCase();
    const matched = routing.rules.find(r =>
      r.match.extensions.includes(ext) ||
      (mimeType && r.match.mimeTypes.includes(mimeType))
    );

    if (!matched) {
      res.status(422).json({
        error: "NoRoute",
        message: `Nessun workflow configurato per i file con estensione '${ext}'. File salvato in workspace/input/${safeName}. Seleziona un workflow manualmente per procedere.`,
        file: { name: safeName, size: buffer.length }
      });
      return;
    }

    // Verifica che il workflow esista
    try {
      await findWorkflow(matched.workflowId);
    } catch {
      res.status(404).json({ error: `Workflow '${matched.workflowId}' non trovato` });
      return;
    }

    // Avvia esecuzione
    const execution = await createAndRunExecution(matched.workflowId);

    res.status(201).json({
      data: {
        file: { name: safeName, size: buffer.length },
        matched: { ruleId: matched.id, label: matched.label, workflowId: matched.workflowId },
        execution
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
