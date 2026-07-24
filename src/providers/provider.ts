import type { AgentRunRequest, AgentRunResult } from "../models.js";

export interface AgentProvider {
  run(request: AgentRunRequest, prompt: string): Promise<AgentRunResult>;
}
