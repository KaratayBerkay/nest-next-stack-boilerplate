import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { accessCookieName } from '../auth/access-cookie';
import type { JwtPayload, JwtUser } from '../auth/auth.types';

/**
 * Soft auth guard — validates the JWT if present but never rejects the request.
 *
 * Mirrors `SessionAuthGuard`'s token extraction but without requiring a valid
 * session. If a valid Bearer token or `access_token` cookie is found, populates
 * `req.user` with the JWT payload (userId/email/role). Otherwise the request
 * proceeds anonymously — the controller can check `req.user` for optional
 * per-user enrichment.
 *
 * This is the NestJS equivalent of the web BFF's `resolveMe()` try/catch
 * pattern in `route.ts:90-157`.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAuthGuard.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    try {
      const token = this.extractToken(req);
      if (!token) return true;

      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      (req as Request & { user?: JwtUser }).user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        tier: 'FREE',
      };
    } catch {
      this.logger.debug('Optional auth: token invalid or expired — proceeding anonymously');
    }

    return true;
  }

  private extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice(7);
    }
    const cookieName = accessCookieName(this.config);
    const cookies = (req as unknown as { cookies?: Record<string, string> }).cookies;
    return cookies?.[cookieName] ?? null;
  }
}
