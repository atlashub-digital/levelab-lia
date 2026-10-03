import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LlmGenerateInput, LlmGenerateResult } from "./llm.types";
import { OpenAiProvider } from "./openai.provider";
import { OpenRouterProvider } from "./openrouter.provider";

type SafeProviderError = {
  name?: string;
  message: string;
  status?: number;
  code?: string;
  type?: string;
  requestId?: string;
};

function safeProviderError(error: unknown): SafeProviderError {
  const e = error as {
    name?: string;
    message?: string;
    status?: number;
    code?: string;
    type?: string;
    request_id?: string;
    requestId?: string;
  };

  return {
    name: e?.name,
    message: e?.message || String(error),
    status: e?.status,
    code: e?.code,
    type: e?.type,
    requestId: e?.request_id || e?.requestId,
  };
}

export class LlmProvidersUnavailableError extends Error {
  constructor(
    readonly correlationId: string,
    readonly attempts: Array<{
      provider: string;
      error: SafeProviderError;
    }>,
  ) {
    super("All configured LLM providers failed");
    this.name = "LlmProvidersUnavailableError";
  }
}

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

    const attempts: Array<{ provider: string; error: SafeProviderError }> = [];

    const attempt = async (
      provider: "openai" | "openrouter",
    ): Promise<LlmGenerateResult | undefined> => {
      try {
        if (provider === "openrouter") {
          return await this.openrouter.generate(input);
        }

        return await this.openai.generate(input);
      } catch (error) {
        const safe = safeProviderError(error);
        attempts.push({ provider, error: safe });

        this.logger.error(
          JSON.stringify({
            event: "llm.provider_failed",
            correlationId: input.correlationId,
            provider,
            ...safe,
          }),
        );

        return undefined;
      }
    };

    const primaryProvider: "openai" | "openrouter" =
      primary === "openrouter" ? "openrouter" : "openai";

    const primaryResult = await attempt(primaryProvider);

    if (primaryResult) {
      return primaryResult;
    }

    if (fallbackEnabled) {
      const fallbackProvider: "openai" | "openrouter" =
        primaryProvider === "openai" ? "openrouter" : "openai";

      const fallbackConfigured =
        fallbackProvider === "openai"
          ? this.openai.isConfigured()
          : this.openrouter.isConfigured();

      if (fallbackConfigured) {
        this.logger.warn(
          JSON.stringify({
            event: "llm.fallback_started",
            correlationId: input.correlationId,
            from: primaryProvider,
            to: fallbackProvider,
          }),
        );

        const fallbackResult = await attempt(fallbackProvider);

        if (fallbackResult) {
          this.logger.log(
            JSON.stringify({
              event: "llm.fallback_succeeded",
              correlationId: input.correlationId,
              provider: fallbackProvider,
            }),
          );

          return fallbackResult;
        }
      }
    }

    throw new LlmProvidersUnavailableError(input.correlationId, attempts);
  }
}
