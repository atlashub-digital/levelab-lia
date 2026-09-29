import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LiaMemberContext, MemberContextResult } from "./context.types";

@Injectable()
export class LeveLabContextClient {
  private readonly logger = new Logger(LeveLabContextClient.name);

  constructor(private readonly config: ConfigService) {}

  async getMemberContext(input: {
    memberId?: string;
    channel?: string;
    correlationId: string;
  }): Promise<MemberContextResult> {
    if (!input.memberId) {
      return { status: "not_requested" };
    }

    if (input.channel === "group") {
      return { status: "blocked_for_group" };
    }

    const baseUrl = this.config
      .get<string>("LEVELAB_BACKEND_BASE_URL")
      ?.replace(/\/$/, "");
    const token = this.config.get<string>("LEVELAB_API_TOKEN");

    if (!baseUrl || !token) {
      return {
        status: "unavailable",
        reason: "LEVELAB_CONTEXT_NOT_CONFIGURED",
      };
    }

    try {
      const response = await fetch(
        `${baseUrl}/lia/context/${encodeURIComponent(input.memberId)}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "X-Correlation-Id": input.correlationId,
          },
          signal: AbortSignal.timeout(3500),
        },
      );

      if (!response.ok) {
        this.logger.warn(
          JSON.stringify({
            event: "levelab.context_failed",
            correlationId: input.correlationId,
            status: response.status,
          }),
        );

        return {
          status: "unavailable",
          reason: `LEVELAB_CONTEXT_HTTP_${response.status}`,
        };
      }

      const context = (await response.json()) as LiaMemberContext;

      if (!context?.memberId) {
        return {
          status: "unavailable",
          reason: "LEVELAB_CONTEXT_INVALID",
        };
      }

      return {
        status: "available",
        context,
      };
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: "levelab.context_unavailable",
          correlationId: input.correlationId,
          error: error instanceof Error ? error.message : String(error),
        }),
      );

      return {
        status: "unavailable",
        reason: "LEVELAB_CONTEXT_UNAVAILABLE",
      };
    }
  }
}
