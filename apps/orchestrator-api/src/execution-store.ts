import { EventEmitter } from "node:events";
import { CancellationRegistry } from "../../../src/cancellation.js";

export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
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
  changedFiles?: string[];
  commandsExecuted?: string[];
}

export interface ExecutionDetail {
  id: string;
  workflowId: string;
  workflowObjective: string;
  projectId?: string;
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

  create(req: StartExecutionRequest, workflowObjective: string, taskCount: number): ExecutionDetail {
    const id = `exec-${Date.now()}-${this.nextId++}`;
    const execution: ExecutionDetail = {
      id,
      workflowId: req.workflowId,
      workflowObjective,
      projectId: req.projectId,
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
  }

  setStatus(execId: string, status: ExecutionStatus): void {
    this.update(execId, { status });
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
}

export const executionStore = new ExecutionStore();
