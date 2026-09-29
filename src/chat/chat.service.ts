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

function contextInstruction(result: MemberContextResult): string {
  if (result.status === "private_available") {
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

  if (result.status === "group_safe_available") {
    const c = result.context;
    const style = c.interactionStyle;

    return [
      "Contexto social seguro deste grupo. Foi construído apenas com informação pública/visível neste mesmo grupo.",
      c.preferredGroupName
        ? `Pode chamar a pessoa de ${c.preferredGroupName} neste grupo.`
        : c.displayName
          ? `Nome público no grupo: ${c.displayName}.`
          : "",
      c.role ? `Papel no grupo: ${c.role}.` : "",
      c.familiarity
        ? `Familiaridade conversacional neste grupo: ${c.familiarity}.`
        : "",
      style?.tone ? `Tom de interação observado no grupo: ${style.tone}.` : "",
      style?.verbosity
        ? `Preferência observada de detalhe no grupo: ${style.verbosity}.`
        : "",
      c.publicHistory?.summary
        ? `Resumo apenas das interações públicas recentes neste grupo: ${c.publicHistory.summary}`
        : "",
      c.publicHistory?.recentTopics?.length
        ? `Tópicos públicos recentes neste grupo: ${c.publicHistory.recentTopics.join(", ")}.`
        : "",
      c.groupProgramContext?.currentTheme
        ? `Tema atual do grupo: ${c.groupProgramContext.currentTheme}.`
        : "",
      "Use isso apenas para continuidade social e naturalidade. Não faça inferências sobre saúde, diagnóstico, medicação, vida privada, estado emocional oculto ou qualquer dado sensível.",
      "Nunca sugira que conhece informações privadas da pessoa. Se algo não foi dito publicamente neste grupo, trate como desconhecido.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function contextStatus(result: MemberContextResult): string {
  if (result.status === "private_available") {
    return "PRIVATE_USED";
  }

  if (result.status === "group_safe_available") {
    return "GROUP_SAFE_USED";
  }

  if (result.status === "unavailable") {
    return `UNAVAILABLE:${result.reason}`;
  }

  return "NOT_REQUESTED";
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
      groupId: input.groupId,
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
      input.groupId ? `Grupo atual: ${input.groupId}.` : "",
      input.programId ? `Programa: ${input.programId}.` : "",
      input.moduleId ? `Módulo solicitado: ${input.moduleId}.` : "",
      corpoForteModule
        ? [
            `Tema Corpo Forte: ${corpoForteModule.title}.`,
            `Objetivo conversacional desta unidade: ${corpoForteModule.conversationalGoal}.`,
            "Não transforme este objetivo conversacional em prescrição clínica.",
          ].join("\n")
        : "",
      contextInstruction(memberContext),
      input.channel === "group"
        ? "Modo grupo: use somente o contexto social seguro do próprio grupo. Contexto privado e memória privada não estão autorizados."
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
          memberContext: contextStatus(memberContext),
          channel: input.channel || "web",
          groupId: input.groupId,
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
