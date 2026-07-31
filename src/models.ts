export type TaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "blocked"
  | "skipped";

export type ProviderType = "mock" | "copilot" | "ollama";

export interface AgentProviderConfig {
  type: ProviderType;
  model?: string | undefined;
  fallbackProvider?: ProviderType | undefined;
  fallbackModel?: string | undefined;
  timeoutMs?: number | undefined;
}

export interface ResultError {
  severity: string;
  message: string;
}

export function normalizeError(e: string | ResultError): string {
  return typeof e === "string" ? e : `[${e.severity}] ${e.message}`;
}

export function normalizeErrors(errors: ReadonlyArray<string | ResultError>): string[] {
  return errors.map(normalizeError);
}

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
  provider?: AgentProviderConfig | undefined;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  file: string;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  agentId: string;
  skillIds: string[];
  dependencies: string[];
  inputPaths: string[];
  outputPaths: string[];
  forbiddenPaths?: string[] | undefined;
  validationCriteria: string[];
  commands?: string[] | undefined;
  status: TaskStatus;
  attempts: number;
  maxAttempts?: number | undefined;
  continueOnError?: boolean | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface ExecutionPlan {
  id: string;
  objective: string;
  projectRoot: string;
  contextFiles: string[];
  createGitCheckpoints: boolean;
  tasks: AgentTask[];
  /** Run isolation metadata — iniettati da createAndRunExecution */
  runDir?: string;
  runInputFile?: string;
}

export interface AgentRunRequest {
  agent: AgentDefinition;
  task: AgentTask;
  plan: ExecutionPlan;
  /** Skill sempre caricate dall'agente (agent.skills) */
  agentSkills: LoadedSkill[];
  /** Skill aggiuntive del task non già presenti in agentSkills */
  taskSkills: LoadedSkill[];
  feedback?: string[] | undefined;
  /** Callback per lo streaming dell'output LLM chunk-by-chunk */
  onChunk?: (chunk: string) => void;
  /** Run isolation: cartella base del run corrente (es. workspace/runs/my-file) */
  runDir?: string;
  /** Run isolation: file di input scelto dall'utente (es. my-file.html) */
  runInputFile?: string;
}
export interface AgentRunResult {
  agentId: string;
  taskId: string;
  provider: ProviderType;
  model: string;
  summary: string;
  changedFiles: string[];
  commandsExecuted: string[];
  errors: Array<string | ResultError>;
  artifacts: Record<string, unknown>;
  rawOutput?: string | undefined;
}

export interface LoadedSkill extends SkillDefinition {
  content: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WorkflowReport {
  planId: string;
  objective: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  success: boolean;
  tasks: Array<{
    id: string;
    title: string;
    agentId: string;
    provider: string;
    model: string;
    skills: string[];
    status: TaskStatus;
    attempts: number;
    summary?: string | undefined;
    errors: string[];
  }>;
}
