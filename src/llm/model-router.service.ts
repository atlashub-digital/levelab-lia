import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LlmGenerateInput, LlmGenerateResult } from "./llm.types";
import { OpenAiProvider } from "./openai.provider";
import { OpenRouterProvider } from "./openrouter.provider";

@Injectable()
export class ModelRouterService {
  private readonly logger = new Logger(ModelRouterService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly openai: OpenAiProvider,
    private readonly openrouter: OpenRouterProvider,
  ) {}

  async generate(input: LlmGenerateInput): Promise<LlmGenerateResult> {
    const primary =
      this.config.get<string>("LLM_PRIMARY_PROVIDER")?.toLowerCase() || "openai";

    const fallbackEnabled =
      (this.config.get<string>("LLM_FALLBACK_ENABLED") || "false").toLowerCase() ===
      "true";

    try {
      if (primary === "openrouter") {
        return await this.openrouter.generate(input);
      }

      return await this.openai.generate(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(
        JSON.stringify({
          event: "llm.primary_failed",
          correlationId: input.correlationId,
          primary,
          error: message,
        }),
      );

      if (!fallbackEnabled) {
        throw error;
      }

      if (primary === "openai" && this.openrouter.isConfigured()) {
        return this.openrouter.generate(input);
      }

      if (primary === "openrouter" && this.openai.isConfigured()) {
        return this.openai.generate(input);
      }

      throw error;
    }
  }
}
