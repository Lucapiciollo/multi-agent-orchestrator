import { EventEmitter } from "node:events";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { CancellationRegistry } from "../../../src/cancellation.js";
import { ROOT_DIR } from "./config.js";

export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'awaiting_input';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'blocked' | 'skipped';

export interface ExecutionEvent {
  type: string;
  executionId: string;
  timestamp: string;
  taskId?: string;
  message?: string;
  [key: string]: unknown;
}

export interface TaskResult {
  id: string;
  title: string;
  agentId: string;
  provider: string;
  model: string;
  skills: string[];
  status: TaskStatus;
  attempts: number;
  summary?: string;
  errors: string[];
  inputPaths?: string[];
  outputPaths?: string[];
  changedFiles?: string[];
  commandsExecuted?: string[];
}

export interface ExecutionDetail {
  id: string;
  workflowId: string;
  workflowObjective: string;
  projectId?: string;
  runDir?: string;          // es. "workspace/runs/timevision-report"
  runSlug?: string;         // es. "timevision-report"
  inputFile?: string;       // es. "timevision-report-v128.html"
  status: ExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  success?: boolean;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  tasks: TaskResult[];
  logs: ExecutionEvent[];
}

class ExecutionStore extends EventEmitter {
  private readonly executions = new Map<string, ExecutionDetail>();
  private readonly abortControllers = new Map<string, AbortController>();
  private nextId = 1;
  private readonly persistPath: string;

  constructor() {
    super();
    this.persistPath = join(ROOT_DIR, "workspace", "logs", "executions.json");
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (!existsSync(this.persistPath)) return;
      const raw = readFileSync(this.persistPath, "utf-8");
      const data: ExecutionDetail[] = JSON.parse(raw);
      for (const ex of data) {
        // Mark any in-flight executions as failed (they were interrupted by restart)
        if (ex.status === "running" || ex.status === "queued") ex.status = "failed";
        this.executions.set(ex.id, ex);
        // Update nextId to avoid collisions
        const numPart = parseInt(ex.id.split("-").pop() ?? "0", 10);
        if (numPart >= this.nextId) this.nextId = numPart + 1;
      }
    } catch { /* first run or corrupt file — start fresh */ }
  }

  private async persistAsync(): Promise<void> {
    try {
      const dir = dirname(this.persistPath);
      await mkdir(dir, { recursive: true });
      const data = [...this.executions.values()];
      await writeFile(this.persistPath, JSON.stringify(data, null, 2), "utf-8");
    } catch { /* non-critical — ignore disk errors */ }
  }

  create(
    req: StartExecutionRequest,
    workflowObjective: string,
    taskCount: number,
    runMeta?: { runDir?: string; runSlug?: string; inputFile?: string }
  ): ExecutionDetail {
    const id = `exec-${Date.now()}-${this.nextId++}`;
    const execution: ExecutionDetail = {
      id,
      workflowId: req.workflowId,
      workflowObjective,
      projectId: req.projectId,
      runDir: runMeta?.runDir,
      runSlug: runMeta?.runSlug,
      inputFile: runMeta?.inputFile,
      status: "queued",
      totalTasks: taskCount,
      completedTasks: 0,
      failedTasks: 0,
      tasks: [],
      logs: []
    };
    this.executions.set(id, execution);
    this.emit("event", { type: "execution.queued", executionId: id, timestamp: new Date().toISOString() } as ExecutionEvent);
    return execution;
  }

  get(id: string): ExecutionDetail | undefined {
    return this.executions.get(id);
  }

  list(): ExecutionDetail[] {
    return [...this.executions.values()].sort(
      (a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? "")
    );
  }

  update(id: string, patch: Partial<ExecutionDetail>): void {
    const ex = this.executions.get(id);
    if (!ex) return;
    Object.assign(ex, patch);
    this.executions.set(id, ex);
  }

  addTask(execId: string, task: TaskResult): void {
    const ex = this.executions.get(execId);
    if (!ex) return;
    ex.tasks.push(task);
    this.executions.set(execId, ex);
  }

  updateTask(execId: string, taskId: string, patch: Partial<TaskResult>): void {
    const ex = this.executions.get(execId);
    if (!ex) return;
    const idx = ex.tasks.findIndex(t => t.id === taskId);
    if (idx >= 0) Object.assign(ex.tasks[idx] as TaskResult, patch);
    this.executions.set(execId, ex);
  }

  addLog(execId: string, event: ExecutionEvent): void {
    const ex = this.executions.get(execId);
    if (!ex) return;
    ex.logs.push(event);
    this.executions.set(execId, ex);
    this.emit("event", event);
    // Persist on task completion/failure events (not on every log line)
    if (event.type === "task.completed" || event.type === "task.failed" ||
        event.type === "execution.completed" || event.type === "execution.failed") {
      void this.persistAsync();
    }
  }

  setStatus(execId: string, status: ExecutionStatus): void {
    this.update(execId, { status });
    // Persist on terminal states or awaiting_input
    if (status === "completed" || status === "failed" || status === "cancelled" || status === "awaiting_input") {
      void this.persistAsync();
    }
  }

  cancel(execId: string): boolean {
    const ex = this.executions.get(execId);
    if (!ex) return false;
    if (ex.status === "completed" || ex.status === "failed" || ex.status === "cancelled") return false;
    this.update(execId, { status: "cancelled", completedAt: new Date().toISOString() });
    this.addLog(execId, {
      type: "execution.cancelled",
      executionId: execId,
      timestamp: new Date().toISOString(),
      message: "Esecuzione annullata dall'utente"
    });
    // Abort the running orchestrator process
    const ctrl = this.abortControllers.get(execId);
    if (ctrl) { ctrl.abort(); this.abortControllers.delete(execId); }
    // Abort Ollama/Copilot provider requests
    CancellationRegistry.abort(execId);
    return true;
  }

  registerAbort(execId: string, ctrl: AbortController): void {
    this.abortControllers.set(execId, ctrl);
  }

  deregisterAbort(execId: string): void {
    this.abortControllers.delete(execId);
  }

  isRunning(execId: string): boolean {
    return this.abortControllers.has(execId);
  }
}

export const executionStore = new ExecutionStore();
