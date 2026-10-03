import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { LlmGenerateInput, LlmGenerateResult } from "./llm.types";

@Injectable()
export class OpenRouterProvider {
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.config.get<string>("OPENROUTER_API_KEY"));
  }

  async generate(input: LlmGenerateInput): Promise<LlmGenerateResult> {
    const apiKey = this.config.get<string>("OPENROUTER_API_KEY");
    const model = this.config.get<string>("OPENROUTER_MODEL") || "openrouter/free";

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://lia.doctor",
        "X-Title": "LIA - LeveLab Intelligent Assistant",
      },
    });

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: input.instructions,
        },
        {
          role: "user",
          content: input.message,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    const text = typeof content === "string" ? content.trim() : "";

    if (!text) {
      throw new Error("OpenRouter returned an empty response");
    }

    return {
      text,
      provider: "openrouter",
      model,
    };
  }
}
