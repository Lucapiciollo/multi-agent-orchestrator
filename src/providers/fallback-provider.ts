import type { AgentRunRequest, AgentRunResult } from "../models.js";
import type { AgentProvider } from "./provider.js";

/**
 * Wraps a primary provider with a fallback.
 * Falls back only when the primary throws (technical failure or timeout).
 * If the primary returns a result (even with errors), no fallback is applied.
 */
export class FallbackProvider implements AgentProvider {
  constructor(
    private readonly primary: AgentProvider,
    private readonly fallback: AgentProvider
  ) {}

  async run(
    request: AgentRunRequest,
    prompt: string
  ): Promise<AgentRunResult> {
    try {
      return await this.primary.run(request, prompt);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(
        `[fallback] Provider primario ha generato un errore: ${reason}. Attivazione fallback.`
      );
      return this.fallback.run(request, prompt);
    }
  }
}
