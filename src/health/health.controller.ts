import { Controller, Get } from "@nestjs/common";

@Controller("api")
export class HealthController {
  @Get("health")
  health() {
    return {
      service: "LIA Core",
      product: "LeveLab",
      version: "0.1.0",
      status: "ONLINE",
    };
  }

  @Get("ready")
  ready() {
    return {
      service: "LIA Core",
      version: "0.1.0",
      status: "READY",
      dependencies: {
        levelabBackend: "NOT_CHECKED",
        atendimentoCenter: "NOT_CHECKED",
        memory: "NOT_CHECKED",
        llm: "NOT_CHECKED",
      },
    };
  }
}
