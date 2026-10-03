import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { LlmGenerateInput, LlmGenerateResult } from "./llm.types";

@Injectable()
export class OpenAiProvider {
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.config.get<string>("OPENAI_API_KEY"));
  }

  async generate(input: LlmGenerateInput): Promise<LlmGenerateResult> {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");
    const model = this.config.get<string>("OPENAI_MODEL") || "gpt-5.6-luna";

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      model,
      instructions: input.instructions,
      input: input.message,
      store: false,
      reasoning: {
        effort: "low",
      },
      metadata: {
        service: "levelab-lia",
        correlation_id: input.correlationId,
      },
    });

    const text = response.output_text?.trim();

    if (!text) {
      throw new Error("OpenAI returned an empty response");
    }

    return {
      text,
      provider: "openai",
      model,
    };
  }
}
