import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Controller("api")
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  @Get("health")
  health() {
    return {
      service: "LIA Core",
      product: "LeveLab",
      version: "0.2.0",
      status: "ONLINE",
    };
  }

  @Get("ready")
  ready() {
    const primary =
      this.config.get<string>("LLM_PRIMARY_PROVIDER")?.toLowerCase() || "openai";

    const primaryConfigured =
      primary === "openrouter"
        ? Boolean(this.config.get<string>("OPENROUTER_API_KEY"))
        : Boolean(this.config.get<string>("OPENAI_API_KEY"));

    const memoryProvider =
      this.config.get<string>("MEMORY_PROVIDER")?.toLowerCase() || "internal";

    return {
      service: "LIA Core",
      version: "0.2.0",
      status: "READY",
      dependencies: {
        levelabBackend: "NOT_CHECKED",
        atendimentoCenter: "NOT_CHECKED",
        memory: memoryProvider === "internal" ? "CONFIGURED_INTERNAL" : "NOT_CHECKED",
        llm: primaryConfigured ? "CONFIGURED" : "NOT_CONFIGURED",
      },
    };
  }
}
