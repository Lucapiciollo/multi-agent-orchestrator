import path from "node:path";
import type {
  AgentRunResult,
  AgentTask,
  ExecutionPlan,
  WorkflowReport
} from "./models.js";
import { normalizeErrors } from "./models.js";
import { Registry } from "./registry.js";
import { PromptBuilder } from "./prompt-builder.js";
import { PathPolicy } from "./path-policy.js";
import { ResultValidator } from "./validator.js";
import { GitCheckpointService } from "./checkpoint.js";
import { Reporter } from "./reporter.js";
import type { AppConfig } from "./config.js";
import type { ProviderFactory } from "./provider-factory.js";

export class Orchestrator {
  private readonly results = new Map<string, AgentRunResult>();
  private readonly skillsUsed = new Map<string, string[]>();

  constructor(
    private readonly rootDir: string,
    private readonly config: AppConfig,
    private readonly registry: Registry,
    private readonly providerFactory: ProviderFactory,
    private readonly promptBuilder: PromptBuilder,
    private readonly pathPolicy: PathPolicy,
    private readonly validator: ResultValidator,
    private readonly checkpoint: GitCheckpointService,
    private readonly reporter: Reporter
  ) { }

  async execute(
    plan: ExecutionPlan,
    onTaskOutput?: (taskId: string, chunk: string) => void,
    onTaskStart?: (taskId: string) => void,
    onTaskEnd?: (taskId: string, status: 'completed' | 'failed') => void
  ): Promise<WorkflowReport> {
    const startedAt = new Date();
    await this.validatePlan(plan);

    while (plan.tasks.some(task => task.status === "pending")) {
      const ready = this.getReadyTasks(plan);

      if (ready.length === 0) {
        this.blockUnreachableTasks(plan);
        break;
      }

      const batch = this.selectNonConflictingBatch(ready).slice(
        0,
        this.config.maxConcurrency
      );

      const settled = await Promise.allSettled(
        batch.map(task => this.executeTask(plan, task, onTaskOutput, onTaskStart, onTaskEnd))
      );

      const failed = settled.some(result => result.status === "rejected");
      if (failed && this.config.failFast) {
        this.blockPendingTasks(plan);
        break;
      }
    }

    const completedAt = new Date();
    const report = this.createReport(plan, startedAt, completedAt);
    await this.reporter.save(plan, report);
    return report;
  }

  private async executeTask(
    plan: ExecutionPlan,
    task: AgentTask,
    onTaskOutput?: (taskId: string, chunk: string) => void,
    onTaskStart?: (taskId: string) => void,
    onTaskEnd?: (taskId: string, status: 'completed' | 'failed') => void
  ): Promise<void> {
    const agent = this.registry.getAgent(task.agentId);
    const provider = this.providerFactory.createForAgent(agent);

    // Skill agente (sempre caricate) — deduplicate
    const agentSkillIds = [...new Set(agent.skills)];
    // Skill task aggiuntive (solo quelle non già nell'agente)
    const agentSkillSet = new Set(agentSkillIds);
    const taskOnlySkillIds = [...new Set(task.skillIds.filter(id => !agentSkillSet.has(id)))];
    // Unione per il report
    const allSkillIds = [...agentSkillIds, ...taskOnlySkillIds];
    this.skillsUsed.set(task.id, allSkillIds);

    const agentSkills = await this.registry.loadSkills(agentSkillIds);
    const taskSkills = await this.registry.loadSkills(taskOnlySkillIds);

    const maxAttempts = task.maxAttempts ?? this.config.maxAttempts;
    let feedback: string[] = [];

    task.status = "running";
    onTaskStart?.(task.id);

    try {
    while (task.attempts < maxAttempts) {
      task.attempts += 1;

      if (plan.createGitCheckpoints) {
        await this.checkpoint.create(
          path.resolve(this.rootDir, plan.projectRoot),
          `chore(agent): checkpoint before ${task.id} attempt ${task.attempts}`
        );
      }

      const request = { agent, task, plan, agentSkills, taskSkills, feedback,
        onChunk: onTaskOutput ? (chunk: string) => onTaskOutput(task.id, chunk) : undefined,
        runDir: plan.runDir,
        runInputFile: plan.runInputFile,
      };
      const prompt = await this.promptBuilder.build(request);

      process.stdout.write(`\n[${task.id}] provider=${agent.provider?.type ?? this.config.defaultProvider} model=${agent.provider?.model ?? ""} — avvio Copilot...\n`);

      const result = await provider.run(request, prompt);

      const skillSummary = allSkillIds.length > 0 ? ` skills=[${allSkillIds.join(",")}]` : "";
      console.log(`\n[${task.id}] provider=${result.provider} model=${result.model}${skillSummary}`);

      this.results.set(task.id, result);
      const validation = this.validator.validate(agent, task, result);

      if (validation.valid) {
        task.status = "completed";
        onTaskEnd?.(task.id, 'completed');
        return;
      }

      feedback = validation.errors;

      if (task.attempts >= maxAttempts) {
        task.status = "failed";
        onTaskEnd?.(task.id, 'failed');
        if (!task.continueOnError) {
          throw new Error(
            `Task ${task.id} fallito: ${validation.errors.join("; ")}`
          );
        }
        return;
      }
    }
    } catch (err) {
      // Guarantee status is never left as "running" on unexpected errors
      if (task.status === "running") {
        if (task.continueOnError) {
          // Don't block downstream tasks when continueOnError=true (e.g. timeout)
          task.status = "completed";
          onTaskEnd?.(task.id, 'completed');
          return;
        }
        task.status = "failed";
        onTaskEnd?.(task.id, 'failed');
      }
      throw err;
    }
  }

  private async validatePlan(plan: ExecutionPlan): Promise<void> {
    const ids = new Set<string>();

    for (const task of plan.tasks) {
      if (ids.has(task.id)) {
        throw new Error(`ID task duplicato: ${task.id}`);
      }
      ids.add(task.id);
      this.registry.getAgent(task.agentId);
      await this.registry.loadSkills(task.skillIds);

      const policyErrors = await this.pathPolicy.validateDeclaredScope(
        path.resolve(this.rootDir, plan.projectRoot),
        this.registry.getAgent(task.agentId),
        task
      );

      if (policyErrors.length) {
        throw new Error(
          `Task ${task.id} non valido: ${policyErrors.join("; ")}`
        );
      }
    }

    for (const task of plan.tasks) {
      for (const dependency of task.dependencies) {
        if (!ids.has(dependency)) {
          throw new Error(
            `Task ${task.id}: dipendenza inesistente ${dependency}`
          );
        }
      }
    }

    this.detectCycles(plan);
  }

  private detectCycles(plan: ExecutionPlan): void {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const byId = new Map(plan.tasks.map(task => [task.id, task]));

    const visit = (id: string): void => {
      if (visiting.has(id)) throw new Error(`Ciclo rilevato nel task ${id}`);
      if (visited.has(id)) return;

      visiting.add(id);
      const task = byId.get(id);
      for (const dependency of task?.dependencies ?? []) {
        visit(dependency);
      }
      visiting.delete(id);
      visited.add(id);
    };

    for (const task of plan.tasks) visit(task.id);
  }

  private getReadyTasks(plan: ExecutionPlan): AgentTask[] {
    return plan.tasks
      .filter(task => task.status === "pending")
      .filter(task =>
        task.dependencies.every(dependencyId => {
          const dependency = plan.tasks.find(item => item.id === dependencyId);
          return dependency?.status === "completed";
        })
      )
      .sort((a, b) => {
        const left = this.registry.getAgent(a.agentId).priority;
        const right = this.registry.getAgent(b.agentId).priority;
        return right - left;
      });
  }

  private selectNonConflictingBatch(tasks: AgentTask[]): AgentTask[] {
    const selected: AgentTask[] = [];

    for (const task of tasks) {
      const conflict = selected.some(existing =>
        this.pathPolicy.hasOutputConflict(existing, task)
      );
      if (!conflict) selected.push(task);
    }

    return selected;
  }

  private blockUnreachableTasks(plan: ExecutionPlan): void {
    for (const task of plan.tasks) {
      if (task.status === "pending") task.status = "blocked";
    }
  }

  private blockPendingTasks(plan: ExecutionPlan): void {
    for (const task of plan.tasks) {
      if (task.status === "pending") task.status = "blocked";
    }
  }

  private createReport(
    plan: ExecutionPlan,
    startedAt: Date,
    completedAt: Date
  ): WorkflowReport {
    return {
      planId: plan.id,
      objective: plan.objective,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      success: plan.tasks.every(task =>
        ["completed", "skipped"].includes(task.status)
      ),
      tasks: plan.tasks.map(task => {
        const result = this.results.get(task.id);
        const agent = this.registry.getAgent(task.agentId);
        const providerType = result?.provider ?? agent.provider?.type ?? this.config.defaultProvider;
        const model = result?.model ?? agent.provider?.model ?? "";

        const entry: WorkflowReport["tasks"][number] = {
          id: task.id,
          title: task.title,
          agentId: task.agentId,
          provider: providerType,
          model,
          skills: this.skillsUsed.get(task.id) ?? [],
          status: task.status,
          attempts: task.attempts,
          errors: normalizeErrors(result?.errors ?? [])
        };

        if (result?.summary) {
          entry.summary = result.summary;
        }

        return entry;
      })
    };
  }
}
