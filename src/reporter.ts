import path from "node:path";
import { writeFile } from "node:fs/promises";
import type { ExecutionPlan, WorkflowReport } from "./models.js";
import { ensureDir, writeJson } from "./fs-utils.js";

export class Reporter {
  constructor(private readonly rootDir: string) {}

  async save(plan: ExecutionPlan, report: WorkflowReport): Promise<void> {
    const reportsDir = path.join(this.rootDir, "workspace", "reports");
    await ensureDir(reportsDir);

    await writeJson(
      path.join(reportsDir, `${plan.id}.report.json`),
      report
    );

    const markdown = [
      `# Workflow report: ${plan.id}`,
      ``,
      `**Obiettivo:** ${plan.objective}`,
      `**Esito:** ${report.success ? "SUCCESSO" : "FALLITO"}`,
      `**Durata:** ${report.durationMs} ms`,
      ``,
      `## Task`,
      ``,
      ...report.tasks.flatMap(task => [
        `### ${task.title}`,
        ``,
        `- ID: \`${task.id}\``,
        `- Agente: \`${task.agentId}\``,
        `- Provider: \`${task.provider}\` / Modello: \`${task.model}\``,
        `- Skill: ${task.skills.length > 0 ? task.skills.join(", ") : "nessuna"}`,
        `- Stato: **${task.status}**`,
        `- Tentativi: ${task.attempts}`,
        `- Riepilogo: ${task.summary ?? "N/D"}`,
        `- Errori: ${task.errors.length ? task.errors.join("; ") : "Nessuno"}`,
        ``
      ])
    ].join("\n");

    await writeFile(
      path.join(reportsDir, `${plan.id}.report.md`),
      markdown,
      "utf8"
    );
  }
}
