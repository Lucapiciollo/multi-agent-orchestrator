import type { AgentRunRequest, AgentRunResult, ResultError } from "../models.js";
import type { AgentProvider } from "./provider.js";
import { CancellationRegistry } from "../cancellation.js";

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

export class OllamaProvider implements AgentProvider {
  constructor(
    private readonly host: string,
    private readonly model: string,
    private readonly timeoutMs: number
  ) {}

  async run(
    request: AgentRunRequest,
    prompt: string
  ): Promise<AgentRunResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    // Combine with external cancellation signal (if registered)
    const execSignal = CancellationRegistry.getSignal(request.task.id.split("-")[0] ?? "");
    if (execSignal) {
      execSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    let raw: string;

    try {
      const response = await fetch(`${this.host}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: "json",
          options: { temperature: 0.1 }
        }),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(
          `Ollama HTTP ${response.status}: ${await response.text()}`
        );
      }

      const data = (await response.json()) as OllamaGenerateResponse;
      raw = data.response ?? "";
    } catch (err) {
      clearTimeout(timer);
      // Re-throw so FallbackProvider can activate
      throw err instanceof Error
        ? err
        : new Error(`OllamaProvider: errore di rete — ${String(err)}`);
    }

    return this.parseResult(request, raw);
  }

  private parseResult(
    request: AgentRunRequest,
    raw: string
  ): AgentRunResult {
    const cleaned = this.extractJson(raw);

    try {
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;

      return {
        agentId: request.agent.id,
        taskId: request.task.id,
        provider: "ollama",
        model: this.model,
        summary: this.parseString(parsed["summary"]) ?? "Attività completata.",
        changedFiles: this.parseStringArray(parsed["changedFiles"]),
        commandsExecuted: this.parseStringArray(parsed["commandsExecuted"]),
        errors: this.parseErrors(parsed["errors"]),
        artifacts: this.parseRecord(parsed["artifacts"]),
        rawOutput: raw
      };
    } catch {
      return {
        agentId: request.agent.id,
        taskId: request.task.id,
        provider: "ollama",
        model: this.model,
        summary: raw.trim() || "Ollama non ha restituito JSON valido.",
        changedFiles: [],
        commandsExecuted: [],
        errors: [],
        artifacts: { responseFormat: "text" },
        rawOutput: raw
      };
    }
  }

  private extractJson(value: string): string {
    const trimmed = value.trim();

    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced !== null && fenced[1] !== undefined) {
      return fenced[1].trim();
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return trimmed.slice(firstBrace, lastBrace + 1);
    }

    return trimmed;
  }

  private parseString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  private parseStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string");
  }

  private parseErrors(value: unknown): Array<string | ResultError> {
    if (!Array.isArray(value)) return [];
    const result: Array<string | ResultError> = [];
    for (const item of value) {
      if (typeof item === "string") {
        result.push(item);
      } else if (this.isResultError(item)) {
        result.push(item);
      }
    }
    return result;
  }

  private isResultError(value: unknown): value is ResultError {
    if (typeof value !== "object" || value === null) return false;
    const obj = value as Record<string, unknown>;
    return typeof obj["severity"] === "string" && typeof obj["message"] === "string";
  }

  private parseRecord(value: unknown): Record<string, unknown> {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return {};
  }
}
