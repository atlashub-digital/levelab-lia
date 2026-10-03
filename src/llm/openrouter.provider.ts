import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { LlmGenerateInput, LlmGenerateResult } from "./llm.types";

/**
 * Replies that are not a conversation: safety-classifier verdicts (e.g.
 * "User Safety: safe") or leaked chain-of-thought. Such output must never
 * reach a member — the next model is tried instead.
 */
const NON_CONVERSATIONAL = [
  /^\s*(user|response|prompt)?\s*safety\s*:/i,
  /^\s*(safe|unsafe)\s*[.!]?\s*$/i,
  /here'?s a thinking process/i,
  /^\s*(thinking|reasoning)\s*:/i,
];

export function cleanReply(raw: string): string {
  return raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

export function isConversationalReply(text: string): boolean {
  return text.length >= 2 && !NON_CONVERSATIONAL.some((re) => re.test(text));
}

@Injectable()
export class OpenRouterProvider {
  private readonly logger = new Logger(OpenRouterProvider.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.config.get<string>("OPENROUTER_API_KEY"));
  }

  /** Ordered models: OPENROUTER_MODELS (comma list) or the single OPENROUTER_MODEL. */
  models(): string[] {
    const list = this.config.get<string>("OPENROUTER_MODELS");
    const models = (list || this.config.get<string>("OPENROUTER_MODEL") || "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    return models.length ? models : ["qwen/qwen3.8-27b:free"];
  }

  async generate(input: LlmGenerateInput): Promise<LlmGenerateResult> {
    const apiKey = this.config.get<string>("OPENROUTER_API_KEY");
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      timeout: 45_000,
      maxRetries: 0,
      defaultHeaders: {
        "HTTP-Referer": "https://lia.doctor",
        "X-Title": "LIA - LeveLab Intelligent Assistant",
      },
    });

    const failures: string[] = [];
    for (const model of this.models()) {
      try {
        const completion = await client.chat.completions.create({
          model,
          max_tokens: 900,
          messages: [
            { role: "system", content: input.instructions },
            ...(input.history ?? []).map((turn) => ({
              role: turn.role,
              content: turn.text,
            })),
            { role: "user", content: input.message },
          ],
        });

        const content = completion.choices[0]?.message?.content;
        const text = cleanReply(typeof content === "string" ? content : "");

        if (!isConversationalReply(text)) {
          throw new Error(`non-conversational reply (${text.slice(0, 40) || "empty"})`);
        }

        return { text, provider: "openrouter", model };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${model}: ${message}`);
        this.logger.warn(
          JSON.stringify({
            event: "llm.openrouter_model_failed",
            correlationId: input.correlationId,
            model,
            error: message.slice(0, 200),
          }),
        );
      }
    }

    throw new Error(`All OpenRouter models failed — ${failures.join(" | ").slice(0, 600)}`);
  }
}
