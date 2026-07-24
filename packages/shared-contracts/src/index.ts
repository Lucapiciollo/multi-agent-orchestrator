// ─── Provider types ────────────────────────────────────────────────────────

export type ProviderType = 'mock' | 'copilot' | 'ollama';

export interface AgentProviderConfig {
  type: ProviderType;
  model?: string;
  fallbackProvider?: ProviderType;
  fallbackModel?: string;
  timeoutMs?: number;
}

// ─── Agent ─────────────────────────────────────────────────────────────────

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  skills: string[];
  tags: string[];
  capabilities: string[];
  allowedPaths: string[];
  forbiddenPaths: string[];
  priority: number;
  provider?: AgentProviderConfig;
}

// ─── Skill ─────────────────────────────────────────────────────────────────

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  file: string;
  content?: string;
  usedByAgents?: string[];
}

// ─── Task ──────────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'blocked' | 'skipped';

export interface TaskDefinition {
  id: string;
  title: string;
  description: string;
  agentId: string;
  skillIds: string[];
  dependencies: string[];
  inputPaths: string[];
  outputPaths: string[];
  validationCriteria: string[];
  status: TaskStatus;
  attempts: number;
  maxAttempts?: number;
  continueOnError?: boolean;
  metadata?: Record<string, unknown>;
  effectiveSkills?: string[];
}

// ─── Workflow ──────────────────────────────────────────────────────────────

export interface WorkflowDefinition {
  id: string;
  objective: string;
  projectRoot: string;
  contextFiles: string[];
  createGitCheckpoints: boolean;
  tasks: TaskDefinition[];
}

// ─── Project ───────────────────────────────────────────────────────────────

export type ProjectType = 'angular' | 'react' | 'node' | 'generic';

export interface ProjectDefinition {
  id: string;
  name: string;
  rootPath: string;
  type: ProjectType;
  enabled: boolean;
  description?: string;
}

// ─── Execution ─────────────────────────────────────────────────────────────

export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionSummary {
  id: string;
  workflowId: string;
  workflowObjective: string;
  projectId?: string;
  status: ExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  success?: boolean;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
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
  changedFiles?: string[];
  commandsExecuted?: string[];
  artifacts?: Record<string, unknown>;
}

export interface ExecutionDetail extends ExecutionSummary {
  tasks: TaskResult[];
  logs: ExecutionEvent[];
  report?: string;
}

// ─── SSE Events ────────────────────────────────────────────────────────────

export type ExecutionEventType =
  | 'execution.queued'
  | 'execution.started'
  | 'task.started'
  | 'task.output'
  | 'task.completed'
  | 'task.failed'
  | 'execution.completed'
  | 'execution.failed'
  | 'execution.cancelled';

export interface ExecutionEvent {
  type: ExecutionEventType;
  executionId: string;
  timestamp: string;
  taskId?: string;
  taskTitle?: string;
  agentId?: string;
  provider?: string;
  model?: string;
  message?: string;
  data?: Record<string, unknown>;
}

// ─── Provider Status ────────────────────────────────────────────────────────

export type ProviderHealth = 'healthy' | 'degraded' | 'unavailable' | 'unknown';

export interface ProviderStatus {
  id: ProviderType;
  name: string;
  model: string;
  health: ProviderHealth;
  latencyMs?: number;
  lastCheckedAt: string;
  details?: string;
}

// ─── API Response wrappers ─────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// ─── Execution start request ───────────────────────────────────────────────

export interface StartExecutionRequest {
  workflowId: string;
  projectId?: string;
  overrides?: {
    maxConcurrency?: number;
    maxAttempts?: number;
    failFast?: boolean;
  };
}
