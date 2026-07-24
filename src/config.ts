import type { ProviderType } from "./models.js";

export interface AppConfig {
  defaultProvider: ProviderType;
  copilotCommand?: string | undefined;
  copilotArgs: string[];
  copilotModel: string;
  copilotTimeoutMs: number;
  ollamaHost: string;
  ollamaModel: string;
  ollamaTimeoutMs: number;
  failFast: boolean;
  maxConcurrency: number;
  maxAttempts: number;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseProviderType(value: string | undefined): ProviderType {
  if (value === "copilot" || value === "cli") return "copilot";
  if (value === "ollama") return "ollama";
  return "mock";
}

export function loadConfig(): AppConfig {
  const defaultProvider = parseProviderType(process.env["AGENT_PROVIDER"]);
  const copilotArgs = (process.env["COPILOT_ARGS"] ?? "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  const config: AppConfig = {
    defaultProvider,
    copilotArgs,
    copilotModel: process.env["COPILOT_MODEL"] ?? "claude-sonnet-5",
    copilotTimeoutMs: parsePositiveInt(process.env["COPILOT_TIMEOUT_MS"], 300_000),
    ollamaHost: process.env["OLLAMA_HOST"] ?? "http://127.0.0.1:11434",
    ollamaModel: process.env["OLLAMA_MODEL"] ?? "qwen3-coder:30b",
    ollamaTimeoutMs: parsePositiveInt(process.env["OLLAMA_TIMEOUT_MS"], 600_000),
    failFast: parseBoolean(process.env["FAIL_FAST"], true),
    maxConcurrency: parsePositiveInt(process.env["MAX_CONCURRENCY"], 1),
    maxAttempts: parsePositiveInt(process.env["MAX_ATTEMPTS"], 2)
  };

  if (process.env["COPILOT_COMMAND"]) {
    config.copilotCommand = process.env["COPILOT_COMMAND"];
  }

  return config;
}
