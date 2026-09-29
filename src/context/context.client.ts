import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  LiaGroupSocialContext,
  LiaMemberContext,
  MemberContextResult,
} from "./context.types";

@Injectable()
export class LeveLabContextClient {
  private readonly logger = new Logger(LeveLabContextClient.name);

  constructor(private readonly config: ConfigService) {}

  async getMemberContext(input: {
    memberId?: string;
    groupId?: string;
    channel?: string;
    correlationId: string;
  }): Promise<MemberContextResult> {
    if (!input.memberId && input.channel !== "group") {
      return { status: "not_requested" };
    }

    const baseUrl = this.config
      .get<string>("LEVELAB_BACKEND_BASE_URL")
      ?.replace(/\/$/, "");
    const token = this.config.get<string>("LEVELAB_API_TOKEN");

    if (!baseUrl || !token) {
      return {
        status: "unavailable",
        reason:
          input.channel === "group"
            ? "GROUP_SOCIAL_CONTEXT_NOT_CONFIGURED"
            : "LEVELAB_CONTEXT_NOT_CONFIGURED",
      };
    }

    if (input.channel === "group") {
      if (!input.groupId) {
        return {
          status: "unavailable",
          reason: "GROUP_ID_REQUIRED",
        };
      }

      return this.getGroupSafeContext({
        baseUrl,
        token,
        groupId: input.groupId,
        memberId: input.memberId,
        correlationId: input.correlationId,
      });
    }

    if (!input.memberId) {
      return { status: "not_requested" };
    }

    return this.getPrivateMemberContext({
      baseUrl,
      token,
      memberId: input.memberId,
      correlationId: input.correlationId,
    });
  }

  private async getPrivateMemberContext(input: {
    baseUrl: string;
    token: string;
    memberId: string;
    correlationId: string;
  }): Promise<MemberContextResult> {
    try {
      const response = await fetch(
        `${input.baseUrl}/lia/context/${encodeURIComponent(input.memberId)}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${input.token}`,
            "X-Correlation-Id": input.correlationId,
          },
          signal: AbortSignal.timeout(3500),
        },
      );

      if (!response.ok) {
        this.logContextFailure(
          "levelab.private_context_failed",
          input.correlationId,
          response.status,
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
        status: "private_available",
        context,
      };
    } catch (error) {
      return this.contextUnavailable(
        "levelab.private_context_unavailable",
        input.correlationId,
        error,
        "LEVELAB_CONTEXT_UNAVAILABLE",
      );
    }
  }

  private async getGroupSafeContext(input: {
    baseUrl: string;
    token: string;
    groupId: string;
    memberId?: string;
    correlationId: string;
  }): Promise<MemberContextResult> {
    const memberSuffix = input.memberId
      ? `/members/${encodeURIComponent(input.memberId)}`
      : "";

    try {
      const response = await fetch(
        `${input.baseUrl}/lia/groups/${encodeURIComponent(input.groupId)}/social-context${memberSuffix}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${input.token}`,
            "X-Correlation-Id": input.correlationId,
          },
          signal: AbortSignal.timeout(3500),
        },
      );

      if (!response.ok) {
        this.logContextFailure(
          "levelab.group_context_failed",
          input.correlationId,
          response.status,
        );

        return {
          status: "unavailable",
          reason: `GROUP_CONTEXT_HTTP_${response.status}`,
        };
      }

      const context = (await response.json()) as LiaGroupSocialContext;

      if (!context?.groupId) {
        return {
          status: "unavailable",
          reason: "GROUP_CONTEXT_INVALID",
        };
      }

      return {
        status: "group_safe_available",
        context,
      };
    } catch (error) {
      return this.contextUnavailable(
        "levelab.group_context_unavailable",
        input.correlationId,
        error,
        "GROUP_CONTEXT_UNAVAILABLE",
      );
    }
  }

  private logContextFailure(
    event: string,
    correlationId: string,
    status: number,
  ) {
    this.logger.warn(
      JSON.stringify({
        event,
        correlationId,
        status,
      }),
    );
  }

  private contextUnavailable(
    event: string,
    correlationId: string,
    error: unknown,
    reason: string,
  ): MemberContextResult {
    this.logger.warn(
      JSON.stringify({
        event,
        correlationId,
        error: error instanceof Error ? error.message : String(error),
      }),
    );

    return {
      status: "unavailable",
      reason,
    };
  }
}
