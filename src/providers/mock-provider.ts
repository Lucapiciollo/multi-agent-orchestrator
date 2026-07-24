import type {
  AgentRunRequest,
  AgentRunResult
} from "../models.js";
import type { AgentProvider } from "./provider.js";

export class MockProvider implements AgentProvider {
  async run(
    request: AgentRunRequest,
    _prompt: string
  ): Promise<AgentRunResult> {
    await new Promise(resolve => setTimeout(resolve, 150));

    return {
      agentId: request.agent.id,
      taskId: request.task.id,
      provider: "mock",
      model: "mock",
      summary: `Simulazione completata per "${request.task.title}"`,
      changedFiles: [],
      commandsExecuted: [],
      errors: [],
      artifacts: {
        mode: "mock",
        validationCriteriaReceived: request.task.validationCriteria.length
      }
    };
  }
}
