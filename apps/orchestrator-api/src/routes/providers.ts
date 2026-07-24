import { Router } from "express";
import { spawn } from "node:child_process";
import { ROOT_DIR } from "../index.js";

export const providersRouter = Router();

async function checkCopilot(): Promise<ProviderStatus> {
  const start = Date.now();
  const copilotCmd = process.env["COPILOT_COMMAND"];
  const model = process.env["COPILOT_MODEL"] ?? "claude-sonnet-5";

  if (!copilotCmd) {
    return { id: "copilot", name: "Copilot CLI", model, health: "unavailable", lastCheckedAt: new Date().toISOString(), details: "COPILOT_COMMAND non configurato" };
  }

  return new Promise(resolve => {
    const child = spawn(copilotCmd, ["--version"], { shell: false, windowsHide: true });
    const timer = setTimeout(() => {
      child.kill();
      resolve({ id: "copilot", name: "Copilot CLI", model, health: "degraded", latencyMs: 5000, lastCheckedAt: new Date().toISOString(), details: "Timeout" });
    }, 5000);

    child.on("close", code => {
      clearTimeout(timer);
      const latencyMs = Date.now() - start;
      resolve({
        id: "copilot",
        name: "Copilot CLI",
        model,
        health: code === 0 ? "healthy" : "degraded",
        latencyMs,
        lastCheckedAt: new Date().toISOString()
      });
    });

    child.on("error", () => {
      clearTimeout(timer);
      resolve({ id: "copilot", name: "Copilot CLI", model, health: "unavailable", lastCheckedAt: new Date().toISOString() });
    });
  });
}

async function checkOllama(): Promise<ProviderStatus> {
  const start = Date.now();
  const host = process.env["OLLAMA_HOST"] ?? "http://127.0.0.1:11434";
  const model = process.env["OLLAMA_MODEL"] ?? "qwen3-coder:30b";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${host}/api/tags`, { signal: controller.signal });
    clearTimeout(timer);
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { id: "ollama", name: "Ollama", model, health: "healthy", latencyMs, lastCheckedAt: new Date().toISOString() };
    }
    return { id: "ollama", name: "Ollama", model, health: "degraded", latencyMs, lastCheckedAt: new Date().toISOString(), details: `HTTP ${res.status}` };
  } catch {
    return { id: "ollama", name: "Ollama", model, health: "unavailable", lastCheckedAt: new Date().toISOString(), details: `${host} non raggiungibile` };
  }
}

providersRouter.get("/status", async (_req, res) => {
  try {
    const [copilot, ollama] = await Promise.all([checkCopilot(), checkOllama()]);
    res.json({ data: [copilot, ollama] });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: String(err), statusCode: 500 });
  }
});
