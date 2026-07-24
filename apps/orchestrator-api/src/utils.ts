import path from "node:path";
import { readFile } from "node:fs/promises";
import { ROOT_DIR } from "./index.js";

export async function readJson<T>(relativePath: string): Promise<T> {
  const abs = path.join(ROOT_DIR, relativePath);
  const content = await readFile(abs, "utf8");
  return JSON.parse(content) as T;
}

export function sanitizePath(p: string): string {
  // Strip sensitive path info — never expose full COPILOT_COMMAND path
  return p.replace(/^.*[/\\]/, "..../");
}

export function sendSse(res: import("express").Response, event: string, data: unknown): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function initSseHeaders(res: import("express").Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
}
