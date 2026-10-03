import { Module } from "@nestjs/common";
import { ModelRouterService } from "./model-router.service";
import { OpenAiProvider } from "./openai.provider";
import { OpenRouterProvider } from "./openrouter.provider";

@Module({
  providers: [OpenAiProvider, OpenRouterProvider, ModelRouterService],
  exports: [ModelRouterService],
})
export class LlmModule {}
