export type LlmProviderName = "openai" | "openrouter";

export interface LlmTurn {
  role: "user" | "assistant";
  text: string;
}

export interface LlmGenerateInput {
  message: string;
  /** Prior turns of the current session, oldest first. */
  history?: LlmTurn[];
  instructions: string;
  correlationId: string;
}

export interface LlmGenerateResult {
  text: string;
  provider: LlmProviderName;
  model: string;
}
