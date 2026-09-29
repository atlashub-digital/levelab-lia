export type LlmProviderName = "openai" | "openrouter";

export interface LlmGenerateInput {
  message: string;
  instructions: string;
  correlationId: string;
}

export interface LlmGenerateResult {
  text: string;
  provider: LlmProviderName;
  model: string;
}
