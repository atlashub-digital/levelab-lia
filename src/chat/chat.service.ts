import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { ModelRouterService } from "../llm/model-router.service";
import { SafetyService } from "../safety/safety.service";
import { ChatRequestDto } from "./chat.dto";
import { LIA_BASE_INSTRUCTIONS } from "./persona";

@Injectable()
export class ChatService {
  constructor(
    private readonly safety: SafetyService,
    private readonly router: ModelRouterService,
  ) {}

  async chat(input: ChatRequestDto) {
    const correlationId = randomUUID();
    const safety = this.safety.assess(input.message);

    if (safety.disposition === "urgent") {
      return {
        correlationId,
        action: "handoff",
        safety: {
          disposition: safety.disposition,
          reasonCode: safety.reasonCode,
        },
        reply:
          "Isso pode precisar de ajuda imediata e eu não quero tratar como uma conversa comum. Procure agora um serviço de emergência da sua região ou uma pessoa de confiança que possa ficar com você. Se você estiver em risco imediato, não fique sozinha.",
      };
    }

    const contextInstructions = [
      LIA_BASE_INSTRUCTIONS,
      `Canal atual: ${input.channel || "web"}.`,
      input.programId ? `Programa: ${input.programId}.` : "",
      input.moduleId ? `Módulo: ${input.moduleId}.` : "",
      safety.publicInstruction
        ? `Regra específica desta mensagem: ${safety.publicInstruction}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await this.router.generate({
      message: input.message,
      instructions: contextInstructions,
      correlationId,
    });

    return {
      correlationId,
      action: "reply",
      provider: result.provider,
      model: result.model,
      safety: {
        disposition: safety.disposition,
        reasonCode: safety.reasonCode,
      },
      reply: result.text,
    };
  }
}
