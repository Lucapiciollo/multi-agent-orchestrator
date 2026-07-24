import { spawn } from "node:child_process";
import path from "node:path";
import type { AgentRunRequest, AgentRunResult, ResultError } from "../models.js";
import type { AgentProvider } from "./provider.js";

interface ProcessOutput {
  stdout: string;
  stderr: string;
  code: number;
}

export class CopilotProvider implements AgentProvider {
  constructor(
    private readonly command: string,
    private readonly model: string,
    private readonly args: string[],
    private readonly timeoutMs: number
  ) {}

  async run(
    request: AgentRunRequest,
    prompt: string
  ): Promise<AgentRunResult> {
    const commandArgs = [
      ...this.args,
      "--no-custom-instructions",
      "-p",
      prompt
    ];

    const cwd = path.resolve(process.cwd(), request.plan.projectRoot);

    let output: ProcessOutput;
    try {
      output = await this.execute(commandArgs, cwd);
    } catch (err) {
      // Timeout throws — allow FallbackProvider to catch
      throw err;
    }

    if (output.code !== 0) {
      return {
        agentId: request.agent.id,
        taskId: request.task.id,
        provider: "copilot",
        model: this.model,
        summary: "Copilot CLI ha restituito un errore.",
        changedFiles: [],
        commandsExecuted: [`${this.command} -p <prompt>`],
        errors: [output.stderr.trim() || `Exit code ${output.code}`],
        artifacts: {},
        rawOutput: output.stdout
      };
    }

    return this.parseResult(request, output);
  }

  private execute(
    args: string[],
    cwd: string
  ): Promise<ProcessOutput> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.command, args, {
        cwd,
        shell: false,
        env: { ...process.env, NO_COLOR: "1" },
        windowsHide: true
      });

      let stdout = "";
      let stderr = "";
      let settled = false;

      // ── Spinner live (aggiorna la stessa riga) ──────────────────────────
      const frames = ["|", "/", "-", "\\"];
      const startMs = Date.now();
      const spinInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startMs) / 1000);
        const frame = frames[Math.floor(Date.now() / 200) % frames.length] ?? "|";
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const time = mins > 0 ? `${mins}m${secs}s` : `${secs}s`;
        process.stdout.write(`\r  ${frame}  Copilot elabora... ${time}   `);
      }, 200);

      const clearSpinner = (): void => {
        clearInterval(spinInterval);
        process.stdout.write("\r" + " ".repeat(45) + "\r");
      };
      // ───────────────────────────────────────────────────────────────────

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        clearSpinner();
        child.kill("SIGTERM");
        setTimeout(() => child.kill("SIGKILL"), 2_000);
        reject(new Error(`CopilotProvider: timeout dopo ${this.timeoutMs}ms`));
      }, this.timeoutMs);

      child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
      child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });

      child.on("error", err => {
        if (settled) return;
        settled = true;
        clearSpinner();
        clearTimeout(timer);
        reject(err);
      });

      child.on("close", code => {
        if (settled) return;
        settled = true;
        clearSpinner();
        clearTimeout(timer);
        resolve({ stdout, stderr, code: code ?? 1 });
      });
    });
  }

  private parseResult(
    request: AgentRunRequest,
    output: ProcessOutput
  ): AgentRunResult {
    const cleaned = this.extractJson(output.stdout);

    try {
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;

      return {
        agentId: request.agent.id,
        taskId: request.task.id,
        provider: "copilot",
        model: this.model,
        summary: this.parseString(parsed["summary"]) ?? "Attività completata.",
        changedFiles: this.parseStringArray(parsed["changedFiles"]),
        commandsExecuted: this.parseStringArray(parsed["commandsExecuted"]),
        errors: this.parseErrors(parsed["errors"]),
        artifacts: this.parseRecord(parsed["artifacts"]),
        rawOutput: output.stdout
      };
    } catch {
      return {
        agentId: request.agent.id,
        taskId: request.task.id,
        provider: "copilot",
        model: this.model,
        summary: output.stdout.trim() || "Copilot non ha restituito JSON valido.",
        changedFiles: [],
        commandsExecuted: [`${this.command} -p <prompt>`],
        errors: [],
        artifacts: { responseFormat: "text", stderr: output.stderr.trim() },
        rawOutput: output.stdout
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
