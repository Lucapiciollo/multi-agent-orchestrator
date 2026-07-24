import path from "node:path";
import { glob } from "glob";
import type {
  AgentDefinition,
  AgentTask,
  AgentRunResult
} from "./models.js";
import { normalizeRelativePath } from "./fs-utils.js";

export class PathPolicy {
  async validateDeclaredScope(
    projectRoot: string,
    agent: AgentDefinition,
    task: AgentTask
  ): Promise<string[]> {
    const errors: string[] = [];
    const forbidden = [
      ...agent.forbiddenPaths,
      ...(task.forbiddenPaths ?? [])
    ].map(normalizeRelativePath);

    for (const output of task.outputPaths.map(normalizeRelativePath)) {
      if (this.matchesAny(output, forbidden)) {
        errors.push(`Output vietato dichiarato: ${output}`);
      }
      if (!this.matchesAny(output, agent.allowedPaths.map(normalizeRelativePath))) {
        errors.push(
          `Output ${output} non coperto dagli allowedPaths dell'agente ${agent.id}`
        );
      }
    }

    const absolute = path.resolve(projectRoot);
    if (absolute === path.parse(absolute).root) {
      errors.push("projectRoot non può essere la radice del filesystem.");
    }

    return errors;
  }

  validateResult(
    agent: AgentDefinition,
    task: AgentTask,
    result: AgentRunResult
  ): string[] {
    const forbidden = [
      ...agent.forbiddenPaths,
      ...(task.forbiddenPaths ?? [])
    ].map(normalizeRelativePath);
    const allowed = agent.allowedPaths.map(normalizeRelativePath);
    const errors: string[] = [];

    for (const changedFile of result.changedFiles.map(normalizeRelativePath)) {
      if (this.matchesAny(changedFile, forbidden)) {
        errors.push(`File modificato in percorso vietato: ${changedFile}`);
      }
      if (!this.matchesAny(changedFile, allowed)) {
        errors.push(`File modificato fuori dagli allowedPaths: ${changedFile}`);
      }
    }

    return errors;
  }

  hasOutputConflict(first: AgentTask, second: AgentTask): boolean {
    return first.outputPaths.some(a =>
      second.outputPaths.some(b => this.pathsOverlap(a, b))
    );
  }

  private pathsOverlap(a: string, b: string): boolean {
    const left = normalizeRelativePath(a).replace(/\*\*\/?\*?$/, "");
    const right = normalizeRelativePath(b).replace(/\*\*\/?\*?$/, "");
    return left.startsWith(right) || right.startsWith(left);
  }

  private matchesAny(value: string, patterns: string[]): boolean {
    if (patterns.length === 0) return false;
    return patterns.some(pattern => {
      if (pattern === "**/*") return true;
      const cleanPattern = pattern.replaceAll("\\", "/");
      const prefix = cleanPattern.replace(/\*\*\/?\*?$/, "");
      return value === prefix.replace(/\/$/, "") || value.startsWith(prefix);
    });
  }
}
