import { BadGatewayException, Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { LeveLabContextClient } from "../context/context.client";
import { MemberContextResult } from "../context/context.types";
import {
  LlmProvidersUnavailableError,
  ModelRouterService,
} from "../llm/model-router.service";
import { getCorpoForteModuleContext } from "../programs/corpo-forte/corpo-forte.context";
import { SafetyService } from "../safety/safety.service";
import { ChatRequestDto } from "./chat.dto";
import { LIA_BASE_INSTRUCTIONS } from "./persona";

function memberContextInstruction(result: MemberContextResult): string {
  if (result.status !== "available") {
    return "";
  }

  const c = result.context;
  const cf = c.corpoForte;

  return [
    "Contexto privado consentido da participante. Use apenas nesta conversa privada e apenas quando for útil.",
    c.displayName ? `Nome preferido: ${c.displayName}.` : "",
    cf?.week ? `Corpo Forte: semana ${cf.week}.` : "",
    cf?.moduleId ? `Módulo atual: ${cf.moduleId}.` : "",
    cf?.goal ? `Objetivo declarado: ${cf.goal}.` : "",
    cf?.targetCapability ? `Capacidade-alvo: ${cf.targetCapability}.` : "",
    cf?.mainBarrier ? `Maior barreira declarada: ${cf.mainBarrier}.` : "",
    cf?.minimumViableAction
      ? `Mínimo viável escolhido: ${cf.minimumViableAction}.`
      : "",
    cf?.currentCommitment
      ? `Compromisso atual: ${cf.currentCommitment}.`
      : "",
    cf?.selectedProgressSignals?.length
      ? `Sinais de progresso escolhidos: ${cf.selectedProgressSignals.join(", ")}.`
      : "",
    "Não revele que possui dados internos. Integre o contexto naturalmente e não trate memória como verdade clínica.",
  ]
    .filter(Boolean)
    .join("\n");
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly safety: SafetyService,
    private readonly router: ModelRouterService,
    private readonly contextClient: LeveLabContextClient,
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

    const memberContext = await this.contextClient.getMemberContext({
      memberId: input.memberId,
      channel: input.channel,
      correlationId,
    });

    const corpoForteModule =
      input.programId === "corpo-forte"
        ? getCorpoForteModuleContext(input.moduleId)
        : undefined;

    const contextInstructions = [
      LIA_BASE_INSTRUCTIONS,
      `Canal atual: ${input.channel || "web"}.`,
      input.programId ? `Programa: ${input.programId}.` : "",
      input.moduleId ? `Módulo solicitado: ${input.moduleId}.` : "",
      corpoForteModule
        ? [
            `Tema Corpo Forte: ${corpoForteModule.title}.`,
            `Objetivo conversacional desta unidade: ${corpoForteModule.conversationalGoal}.`,
            "Não transforme este objetivo conversacional em prescrição clínica.",
          ].join("\n")
        : "",
      memberContextInstruction(memberContext),
      memberContext.status === "blocked_for_group"
        ? "Modo grupo ativo: contexto privado da participante foi bloqueado por código. Não personalize usando memória privada."
        : "",
      safety.publicInstruction
        ? `Regra específica desta mensagem: ${safety.publicInstruction}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
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
        context: {
          memberContext:
            memberContext.status === "available"
              ? "USED"
              : memberContext.status.toUpperCase(),
          program: input.programId,
          module: input.moduleId,
        },
        safety: {
          disposition: safety.disposition,
          reasonCode: safety.reasonCode,
        },
        reply: result.text,
      };
    } catch (error) {
      if (error instanceof LlmProvidersUnavailableError) {
        this.logger.error(
          JSON.stringify({
            event: "chat.llm_unavailable",
            correlationId,
            attempts: error.attempts.map((attempt) => ({
              provider: attempt.provider,
              status: attempt.error.status,
              code: attempt.error.code,
              type: attempt.error.type,
              requestId: attempt.error.requestId,
            })),
          }),
        );

        throw new BadGatewayException({
          code: "LLM_PROVIDER_UNAVAILABLE",
          correlationId,
          message: "No configured LLM provider could complete the request.",
        });
      }

      throw error;
    }
  }
}
