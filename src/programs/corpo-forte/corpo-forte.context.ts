export type CorpoForteModuleId =
  | "M00"
  | "S01"
  | "S02"
  | "S03"
  | "S04"
  | "S05"
  | "S06"
  | "S07"
  | "S08";

type CorpoForteModuleContext = {
  title: string;
  conversationalGoal: string;
};

const MODULES: Record<CorpoForteModuleId, CorpoForteModuleContext> = {
  M00: {
    title: "Começar sem precisar estar pronta",
    conversationalGoal:
      "ajudar a participante a definir por que entrou, sua capacidade-alvo, maior barreira e mínimo viável",
  },
  S01: {
    title: "Mais do que um número",
    conversationalGoal:
      "ajudar a participante a separar peso isolado de trajetória e escolher sinais úteis de progresso",
  },
  S02: {
    title: "O músculo que leva a sua vida",
    conversationalGoal:
      "ajudar a participante a pensar em força como capacidade e escolher um marcador funcional",
  },
  S03: {
    title: "Aprender a ficar forte",
    conversationalGoal:
      "ajudar a organizar uma rotina de treino possível e um Plano B, sem prescrever treino individual",
  },
  S04: {
    title: "Alimentar um Corpo Forte",
    conversationalGoal:
      "ajudar a organizar refeições e suficiência de forma geral, sem dieta terapêutica individual",
  },
  S05: {
    title: "Movimento que soma",
    conversationalGoal:
      "ajudar a identificar oportunidades reais de movimento e um mínimo viável",
  },
  S06: {
    title: "Recuperar também faz parte",
    conversationalGoal:
      "ajudar a observar sono, carga física e carga de vida e escolher uma proteção de recuperação",
  },
  S07: {
    title: "A mulher dentro da transformação",
    conversationalGoal:
      "ajudar a refletir sobre imagem corporal, comparação, linguagem e estrutura sem rigidez",
  },
  S08: {
    title: "O corpo que continua",
    conversationalGoal:
      "ajudar a consolidar o protocolo de retorno e preparar o próximo ciclo de 90 dias",
  },
};

export function getCorpoForteModuleContext(moduleId?: string) {
  if (!moduleId || !(moduleId in MODULES)) {
    return undefined;
  }

  return MODULES[moduleId as CorpoForteModuleId];
}
