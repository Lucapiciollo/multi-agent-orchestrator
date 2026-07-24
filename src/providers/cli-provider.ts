import { spawn } from "node:child_process";
import path from "node:path";
import type {
  AgentRunRequest,
  AgentRunResult
} from "../models.js";
import type { AgentProvider } from "./provider.js";

interface ProcessOutput {
  stdout: string;
  stderr: string;
  code: number;
}

export class CliProvider implements AgentProvider {
  constructor(
    private readonly command: string,
    private readonly args: string[]
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

    const cwd = path.resolve(
      process.cwd(),
      request.plan.projectRoot
    );

    const output = await this.execute(
      commandArgs,
      cwd,
      180_000
    );

    if (output.code !== 0) {
      return {
        agentId: request.agent.id,
        taskId: request.task.id,
        provider: "copilot",
        model: "cli",
        summary: "Copilot CLI ha restituito un errore.",
        changedFiles: [],
        commandsExecuted: [
          `${this.command} -p <prompt>`
        ],
        errors: [
          output.stderr.trim() ||
          `Exit code ${output.code}`
        ],
        artifacts: {},
        rawOutput: output.stdout
      };
    }

    return this.parseResult(request, output);
  }

  private execute(
    args: string[],
    cwd: string,
    timeoutMs: number
  ): Promise<ProcessOutput> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.command, args, {
        cwd,
        shell: false,
        env: {
          ...process.env,
          NO_COLOR: "1"
        },
        windowsHide: true
      });

      let stdout = "";
      let stderr = "";
      let completed = false;

      const timeout = setTimeout(() => {
        if (completed) {
          return;
        }

        child.kill();

        resolve({
          stdout,
          stderr,
          code: 124
        });
      }, timeoutMs);

      child.stdout.on("data", chunk => {
        stdout += String(chunk);
      });

      child.stderr.on("data", chunk => {
        stderr += String(chunk);
      });

      child.on("error", error => {
        clearTimeout(timeout);
        reject(error);
      });

      child.on("close", code => {
        if (completed) {
          return;
        }

        completed = true;
        clearTimeout(timeout);

        resolve({
          stdout,
          stderr,
          code: code ?? 1
        });
      });
    });
  }

  private parseResult(
    request: AgentRunRequest,
    output: ProcessOutput
  ): AgentRunResult {
    const cleaned = this.extractJson(output.stdout);

    try {
      const parsed = JSON.parse(
        cleaned
      ) as Partial<AgentRunResult>;

      return {
        agentId: request.agent.id,
        taskId: request.task.id,
        provider: "copilot",
        model: "cli",
        summary:
          parsed.summary ??
          "Attività completata.",
        changedFiles:
          parsed.changedFiles ?? [],
        commandsExecuted:
          parsed.commandsExecuted ?? [],
        errors:
          parsed.errors ?? [],
        artifacts:
          parsed.artifacts ?? {},
        rawOutput: output.stdout
      };
    } catch {
      return {
        agentId: request.agent.id,
        taskId: request.task.id,
        provider: "copilot",
        model: "cli",
        summary:
          output.stdout.trim() ||
          "Copilot non ha restituito JSON valido.",
        changedFiles: [],
        commandsExecuted: [
          `${this.command} -p <prompt>`
        ],
        errors: [],
        artifacts: {
          responseFormat: "text",
          stderr: output.stderr.trim()
        },
        rawOutput: output.stdout
      };
    }
  }

  private extractJson(value: string): string {
    const trimmed = value.trim();

    const fenced = trimmed.match(
      /```(?:json)?\s*([\s\S]*?)\s*```/i
    );

    if (fenced?.[1]) {
      return fenced[1].trim();
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (
      firstBrace >= 0 &&
      lastBrace > firstBrace
    ) {
      return trimmed.slice(
        firstBrace,
        lastBrace + 1
      );
    }

    return trimmed;
  }
}