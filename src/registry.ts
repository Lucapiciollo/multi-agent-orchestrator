import path from "node:path";
import { readFile, access } from "node:fs/promises";
import {
  agentDefinitionSchema,
  skillDefinitionSchema
} from "./schema.js";
import type {
  AgentDefinition,
  LoadedSkill,
  SkillDefinition
} from "./models.js";
import { readJson } from "./fs-utils.js";

export class Registry {
  private agents = new Map<string, AgentDefinition>();
  private skills = new Map<string, SkillDefinition>();

  constructor(private readonly rootDir: string) {}

  async load(): Promise<void> {
    const agentRecords = await readJson<unknown[]>(
      path.join(this.rootDir, "agents", "registry.json")
    );
    const skillRecords = await readJson<unknown[]>(
      path.join(this.rootDir, "skills", "registry.json")
    );

    // Carica le skill rilevando duplicati
    const seenSkillIds = new Set<string>();
    for (const record of skillRecords) {
      const skill = skillDefinitionSchema.parse(record);
      if (seenSkillIds.has(skill.id)) {
        throw new Error(`Skill duplicata nel registry: '${skill.id}'`);
      }
      seenSkillIds.add(skill.id);
      this.skills.set(skill.id, skill);
    }

    for (const record of agentRecords) {
      const agent = agentDefinitionSchema.parse(record);
      this.agents.set(agent.id, agent);
    }

    // Validazione sincrona: ogni agente referenzia skill esistenti
    this.validateReferences();

    // Validazione asincrona: ogni file SKILL.md è leggibile
    await this.validateSkillFiles();
  }

  listAgents(): AgentDefinition[] {
    return [...this.agents.values()].sort((a, b) => b.priority - a.priority);
  }

  listSkills(): SkillDefinition[] {
    return [...this.skills.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  getAgent(id: string): AgentDefinition {
    const agent = this.agents.get(id);
    if (!agent) throw new Error(`Agente non registrato: ${id}`);
    return agent;
  }

  async loadSkills(ids: string[]): Promise<LoadedSkill[]> {
    return Promise.all(
      ids.map(async id => {
        const skill = this.skills.get(id);
        if (!skill) throw new Error(`Skill non registrata: ${id}`);

        let content: string;
        try {
          content = await readFile(
            path.join(this.rootDir, skill.file),
            "utf8"
          );
        } catch {
          throw new Error(
            `File SKILL.md non leggibile per skill '${id}': ${skill.file}`
          );
        }

        return { ...skill, content };
      })
    );
  }

  private validateReferences(): void {
    for (const agent of this.agents.values()) {
      for (const skillId of agent.skills) {
        if (!this.skills.has(skillId)) {
          throw new Error(
            `L'agente '${agent.id}' fa riferimento alla skill inesistente '${skillId}'`
          );
        }
      }
    }
  }

  private async validateSkillFiles(): Promise<void> {
    for (const skill of this.skills.values()) {
      const filePath = path.join(this.rootDir, skill.file);
      try {
        await access(filePath);
      } catch {
        throw new Error(
          `File SKILL.md non accessibile per skill '${skill.id}': ${filePath}`
        );
      }
    }
  }
}

