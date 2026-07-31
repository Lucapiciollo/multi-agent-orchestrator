import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import type { AgentRunRequest, LoadedSkill } from "./models.js";
import { pathExists } from "./fs-utils.js";

/** Dimensione massima per includere un file nel prompt (50 KB) */
const MAX_INLINE_BYTES = 50_000;

export class PromptBuilder {
  constructor(private readonly rootDir: string) {}

  async build(request: AgentRunRequest): Promise<string> {
    const context     = await this.loadContext(request.plan.contextFiles ?? []);
    const inputFiles  = await this.loadInputContent(request.task.inputPaths ?? []);

    // ── Run isolation override ─────────────────────────────────────────────
    // Se il run è isolato, inietta una sezione obbligatoria che sovrascrive
    // qualsiasi riferimento a workspace/ nelle istruzioni della skill.
    const runOverride: string[] = [];
    if (request.runDir) {
      runOverride.push(
        ``,
        `# ⚠️ OVERRIDE OBBLIGATORIO — PERCORSI WORKSPACE`,
        `Questo run è isolato. DEVI usare ESCLUSIVAMENTE questi percorsi base:`,
        ``,
        `  BASE RUN DIR : ${request.runDir}/`,
        `  INPUT FILE   : workspace/input/${request.runInputFile ?? ""}`,
        ``,
        `Regole ferree — NESSUNA eccezione:`,
        `- workspace/context/...  → ${request.runDir}/context/...`,
        `- workspace/output/...   → ${request.runDir}/output/...`,
        `- workspace/reports/...  → ${request.runDir}/reports/...`,
        `- workspace/logs/...     → ${request.runDir}/logs/...`,
        `- File di input da leggere: workspace/input/${request.runInputFile ?? ""}`,
        ``,
        `NON leggere né scrivere MAI in:`,
        `- workspace/output/ (senza il prefisso runs/)`,
        `- workspace/context/ (senza il prefisso runs/)`,
        `- workspace/reports/ (senza il prefisso runs/)`,
        `- Qualsiasi file HTML in workspace/output/scss/ o workspace/output/angular/`,
        ``,
        `Se una skill o istruzione cita "workspace/output/test-app/src/libs/...", leggi`,
        `"${request.runDir}/output/test-app/src/libs/..." e scrivi lì.`
      );
    }

    return [
      `# Identità`,
      `Sei ${request.agent.name} (${request.agent.id}).`,
      request.agent.description,
      ``,
      `# Obiettivo generale`,
      request.plan.objective,
      ...runOverride,
      ``,
      `# Attività assegnata`,
      `ID: ${request.task.id}`,
      `Titolo: ${request.task.title}`,
      request.task.description,
      ``,
      `# Root del progetto`,
      request.plan.projectRoot,
      ``,
      `# Input`,
      this.list(request.task.inputPaths),
      ``,
      `# Output autorizzati`,
      this.list(request.task.outputPaths),
      ``,
      `# Percorsi vietati`,
      this.list([
        ...request.agent.forbiddenPaths,
        ...(request.task.forbiddenPaths ?? [])
      ]),
      ``,
      `# Capacità disponibili`,
      this.list(request.agent.capabilities),
      ``,
      `# Criteri di validazione`,
      this.list(request.task.validationCriteria),
      ``,
      ...this.buildSkillsSections(request.agentSkills, request.taskSkills),
      ``,
      `# Contesto condiviso`,
      context || "Nessun contesto aggiuntivo.",
      ``,
      `# Contenuto file di input`,
      inputFiles || "Nessun file di input leggibile.",
      ``,
      `# Feedback del validatore`,
      this.list(request.feedback ?? []),
      ``,
      `# Regole di risposta`,
      `Restituisci esclusivamente JSON valido con:`,
      `{"summary":"", "changedFiles":[], "commandsExecuted":[], "errors":[], "artifacts":{}}`,
      `Non includere markdown fuori dal JSON.`,
      `Non modificare file fuori scope.`,
      `Non dichiarare test riusciti se non li hai realmente eseguiti.`,
      `Segnala ogni blocco in errors.`
    ].join("\n");
  }

  private async loadContext(files: string[]): Promise<string> {
    const sections: string[] = [];
    for (const relative of files) {
      const absolute = path.join(this.rootDir, relative);
      if (!(await pathExists(absolute))) continue;
      const content = await readFile(absolute, "utf8");
      sections.push(`## ${relative}\n\n${content}`);
    }
    return sections.join("\n\n");
  }

  /**
   * Carica il contenuto dei file di input e lo include nel prompt.
   * - File concreti (< 50KB): contenuto completo
   * - Pattern glob: lista dei file trovati (max 50)
   * I file > 50KB o binari vengono saltati.
   */
  private async loadInputContent(inputPaths: string[]): Promise<string> {
    const sections: string[] = [];

    for (const p of inputPaths) {
      const isGlob = p.includes("*") || p.includes("?");

      if (isGlob) {
        try {
          const matches = await glob(p, {
            cwd: this.rootDir,
            nodir: true,
            ignore: ["**/node_modules/**", "**/.git/**"]
          });
          if (matches.length === 0) continue;
          const listed = matches.slice(0, 50).join("\n");
          const extra = matches.length > 50 ? `\n... e altri ${matches.length - 50} file` : "";
          sections.push(`## ${p} (${matches.length} file)\n\n${listed}${extra}`);
        } catch { /* glob fallita, salta */ }
      } else {
        const absolute = path.join(this.rootDir, p);
        if (!(await pathExists(absolute))) continue;
        try {
          const info = await stat(absolute);
          if (info.size > MAX_INLINE_BYTES) {
            sections.push(`## ${p}\n\n(file troppo grande: ${Math.round(info.size / 1024)} KB — non incluso)`);
            continue;
          }
          const content = await readFile(absolute, "utf8");
          const ext = path.extname(p).slice(1) || "text";
          sections.push(`## ${p}\n\n\`\`\`${ext}\n${content}\n\`\`\``);
        } catch { /* file non leggibile, salta */ }
      }
    }

    return sections.join("\n\n");
  }

  private list(values: string[]): string {
    return values.length > 0
      ? values.map(value => `- ${value}`).join("\n")
      : "- Nessuno";
  }

  private buildSkillsSections(
    agentSkills: LoadedSkill[],
    taskSkills: LoadedSkill[]
  ): string[] {
    const lines: string[] = [];

    if (agentSkills.length > 0) {
      lines.push(`# Skill obbligatorie dell'agente`);
      lines.push(
        agentSkills
          .map(skill => `## ${skill.name}\n\n${skill.content}`)
          .join("\n\n---\n\n")
      );
    }

    if (taskSkills.length > 0) {
      if (agentSkills.length > 0) {
        lines.push(`---`);
      }
      lines.push(`# Skill aggiuntive del task`);
      lines.push(
        taskSkills
          .map(skill => `## ${skill.name}\n\n${skill.content}`)
          .join("\n\n---\n\n")
      );
    }

    if (agentSkills.length === 0 && taskSkills.length === 0) {
      lines.push(`# Skill`);
      lines.push(`Nessuna skill configurata per questo task.`);
    }

    return lines;
  }
}
