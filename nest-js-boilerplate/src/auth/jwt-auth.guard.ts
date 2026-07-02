import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { accessCookieName } from './access-cookie';
import { JwtPayload, JwtUser } from './auth.types';

interface AuthedRequest extends Request {
  user?: JwtUser;
}

/**
 *  JWT guard that supports two authentication methods:
 *  1. `Authorization: Bearer <token>` header (primary — used by direct GraphQL clients)
 *  2. `access_token` cookie (fallback — used by the Next.js BFF proxy which forwards
 *     httpOnly cookies via the `Cookie` header)
 *
 *  The guard tries the header first, then falls back to the cookie so the same resolver
 *  works for both bearer-token and cookie-forwarded requests.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = GqlExecutionContext.create(context).getContext<{
      req: AuthedRequest;
    }>().req;

    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      req.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        tier: 'FREE',
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(req: AuthedRequest): string | null {
    // 1. Authorization header
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice(7);
    }

    // 2. Cookie fallback — cookie-parser is registered app-wide in main.ts
    const cookieName = accessCookieName(this.config);
    const cookies = (req as unknown as { cookies?: Record<string, string> })
      .cookies;
    return cookies?.[cookieName] ?? null;
  }
}
