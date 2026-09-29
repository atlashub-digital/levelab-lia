import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { timingSafeEqual } from "node:crypto";

@Injectable()
export class ServiceTokenGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>("LIA_SERVICE_TOKEN");

    if (!expected || expected === "replace_me") {
      throw new UnauthorizedException("LIA service token is not configured");
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();

    const raw = request.headers["x-lia-service-token"];
    const provided = Array.isArray(raw) ? raw[0] : raw;

    if (!provided) {
      throw new UnauthorizedException("Missing x-lia-service-token");
    }

    const a = Buffer.from(provided);
    const b = Buffer.from(expected);

    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException("Invalid service token");
    }

    return true;
  }
}
