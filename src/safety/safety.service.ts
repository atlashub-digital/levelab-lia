import { Injectable } from "@nestjs/common";
import { SafetyAssessment } from "./safety.types";

@Injectable()
export class SafetyService {
  assess(message: string): SafetyAssessment {
    const normalized = message.toLocaleLowerCase("pt-BR");

    const urgentPatterns = [
      /quero me matar/,
      /vou me matar/,
      /quero morrer/,
      /suic[ií]dio/,
      /n[aã]o quero mais viver/,
      /overdose/,
      /desmaiei/,
      /dor no peito.*falta de ar/,
    ];

    if (urgentPatterns.some((pattern) => pattern.test(normalized))) {
      return {
        disposition: "urgent",
        reasonCode: "URGENT_SAFETY",
        publicInstruction:
          "Priorize segurança imediata. Oriente a pessoa a procurar o serviço de emergência/local adequado ou uma pessoa de confiança presente. Não tente gerir clinicamente a situação.",
      };
    }

    const medicationPatterns = [
      /aument(ar|o) .*dose/,
      /diminuir .*dose/,
      /parar .*medicamento/,
      /suspender .*medicamento/,
      /trocar .*medicamento/,
      /qual dose/,
      /mounjaro/,
      /ozempic/,
      /wegovy/,
      /semaglutida/,
      /tirzepatida/,
    ];

    if (medicationPatterns.some((pattern) => pattern.test(normalized))) {
      return {
        disposition: "allow_with_boundary",
        reasonCode: "MEDICATION_BOUNDARY",
        publicInstruction:
          "Pode oferecer informação geral e ajudar a organizar perguntas, mas não recomendar início, interrupção, troca ou ajuste de dose. Quando a pergunta for individual sobre tratamento, encaminhe ao prescritor.",
      };
    }

    const diagnosisPatterns = [
      /o que eu tenho/,
      /isso [ée] .*doen[cç]a/,
      /me diagnostica/,
      /qual meu diagn[oó]stico/,
    ];

    if (diagnosisPatterns.some((pattern) => pattern.test(normalized))) {
      return {
        disposition: "allow_with_boundary",
        reasonCode: "DIAGNOSIS_BOUNDARY",
        publicInstruction:
          "Não diagnostique. Explique possibilidades de forma geral apenas quando seguro e oriente avaliação profissional se a questão for individual.",
      };
    }

    return {
      disposition: "allow",
    };
  }
}
