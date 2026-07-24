import type { AppConfig } from "./config.js";
import type { AgentDefinition, ProviderType } from "./models.js";
import type { AgentProvider } from "./providers/provider.js";
import { MockProvider } from "./providers/mock-provider.js";
import { CopilotProvider } from "./providers/copilot-provider.js";
import { OllamaProvider } from "./providers/ollama-provider.js";
import { FallbackProvider } from "./providers/fallback-provider.js";

export class ProviderFactory {
  constructor(private readonly config: AppConfig) {}

  createForAgent(agent: AgentDefinition): AgentProvider {
    const cfg = agent.provider;

    if (cfg === undefined) {
      return this.build(this.config.defaultProvider, undefined, undefined);
    }

    const primary = this.build(cfg.type, cfg.model, cfg.timeoutMs);

    if (cfg.fallbackProvider !== undefined) {
      const fallback = this.build(cfg.fallbackProvider, cfg.fallbackModel, undefined);
      return new FallbackProvider(primary, fallback);
    }

    return primary;
  }

  private build(
    type: ProviderType,
    model: string | undefined,
    timeoutMs: number | undefined
  ): AgentProvider {
    switch (type) {
      case "copilot": {
        if (!this.config.copilotCommand) {
          throw new Error(
            "Provider 'copilot' richiede COPILOT_COMMAND nel file .env"
          );
        }
        return new CopilotProvider(
          this.config.copilotCommand,
          model ?? this.config.copilotModel,
          this.config.copilotArgs,
          timeoutMs ?? this.config.copilotTimeoutMs
        );
      }
      case "ollama": {
        return new OllamaProvider(
          this.config.ollamaHost,
          model ?? this.config.ollamaModel,
          timeoutMs ?? this.config.ollamaTimeoutMs
        );
      }
      case "mock":
      default: {
        return new MockProvider();
      }
    }
  }
}
