import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

function detectKeyMismatch(
  primary: string,
  openaiKey?: string,
  openrouterKey?: string,
): string | undefined {
  if (primary === "openai" && openaiKey?.startsWith("sk-or-")) {
    return "OPENAI_API_KEY_APPEARS_TO_BE_OPENROUTER";
  }

  if (
    primary === "openrouter" &&
    openrouterKey &&
    !openrouterKey.startsWith("sk-or-")
  ) {
    return "OPENROUTER_API_KEY_FORMAT_UNEXPECTED";
  }

  return undefined;
}

@Controller("api")
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  @Get("health")
  health() {
    return {
      service: "LIA Core",
      product: "LeveLab",
      version: "0.3.0",
      status: "ONLINE",
    };
  }

  @Get("ready")
  ready() {
    const primary =
      this.config.get<string>("LLM_PRIMARY_PROVIDER")?.toLowerCase() || "openai";

    const openaiKey = this.config.get<string>("OPENAI_API_KEY");
    const openrouterKey = this.config.get<string>("OPENROUTER_API_KEY");

    const primaryConfigured =
      primary === "openrouter" ? Boolean(openrouterKey) : Boolean(openaiKey);

    const keyMismatch = detectKeyMismatch(primary, openaiKey, openrouterKey);

    const memoryProvider =
      this.config.get<string>("MEMORY_PROVIDER")?.toLowerCase() || "internal";

    const levelabContextConfigured = Boolean(
      this.config.get<string>("LEVELAB_BACKEND_BASE_URL") &&
        this.config.get<string>("LEVELAB_API_TOKEN"),
    );

    return {
      service: "LIA Core",
      version: "0.3.0",
      status: "READY",
      dependencies: {
        levelabBackend: levelabContextConfigured
          ? "CONFIGURED"
          : "NOT_CONFIGURED",
        atendimentoCenter: "NOT_CHECKED",
        memory: memoryProvider === "internal" ? "CONFIGURED_INTERNAL" : "NOT_CHECKED",
        llm: keyMismatch
          ? "MISCONFIGURED"
          : primaryConfigured
            ? "CONFIGURED"
            : "NOT_CONFIGURED",
      },
      diagnostics: keyMismatch
        ? {
            llm: keyMismatch,
          }
        : undefined,
    };
  }
}
