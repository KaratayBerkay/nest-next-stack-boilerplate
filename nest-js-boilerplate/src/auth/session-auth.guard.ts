import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { accessCookieName } from './access-cookie';
import { JwtPayload, JwtUser } from './auth.types';
import { rbacCookieName } from './rbac-cookie';
import { TokenStoreService } from './token-store.service';
import { deviceCookieName } from '../devices/device-cookie';

interface AuthedRequest extends Request {
  user?: JwtUser;
}

/**
 * Session-based auth guard that replaces `JwtAuthGuard` on routes that model sessions.
 *
 * Order:
 * 1. JWT signature/expiry check (zero I/O)
 * 2. Build compound key from the three presented tokens (access + rbac + device)
 * 3. HGETALL from Redis
 * 4. Sanity: `payload.sub === hash.userId`
 * 5. IP policy: WARN-log by default, reject if AUTH_IP_STRICT=true
 * 6. Attach `req.user = { userId, email, role, tier }`
 *
 * Fail closed: Redis errors → 503.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly tokenStore: TokenStoreService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = GqlExecutionContext.create(context).getContext<{
      req: AuthedRequest;
    }>().req;

    const accessToken = this.extractAccessToken(req);
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token');
    }

    // Step 1: JWT signature/expiry check (zero I/O).
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(accessToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    // Step 2: Build compound key from the three tokens.
    const rbacToken = this.extractRbacToken(req);
    const deviceToken = this.extractDeviceToken(req);
    if (!rbacToken) {
      throw new UnauthorizedException('Missing RBAC token');
    }

    const compoundKey = this.tokenStore.buildKey(
      accessToken,
      rbacToken,
      deviceToken ?? '',
    );

    // Step 3: HGETALL from Redis. Fail closed on Redis errors.
    let sessionUser: Awaited<ReturnType<typeof this.tokenStore.read>>;
    try {
      sessionUser = await this.tokenStore.read(compoundKey);
    } catch {
      throw new HttpException(
        'Service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (!sessionUser) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    // Step 4: Sanity — payload.sub === hash.userId
    if (payload.sub !== sessionUser.userId) {
      throw new UnauthorizedException('Token mismatch');
    }

    // Step 5: IP policy
    const reqIp = req.ip ?? null;
    if (reqIp && sessionUser.ip && reqIp !== sessionUser.ip) {
      const strict = this.config.get<string>('AUTH_IP_STRICT') === 'true';
      if (strict) {
        throw new UnauthorizedException('IP address mismatch');
      }
      // Non-strict: WARN only (logging level depends on the logger).
    }

    // Step 6: Attach user to request.
    req.user = {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role: sessionUser.role,
      tier: sessionUser.tier,
    };

    return true;
  }

  private extractToken(req: AuthedRequest): string | null {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice(7);
    }
    const cookieName = accessCookieName(this.config);
    const cookies = (req as unknown as { cookies?: Record<string, string> })
      .cookies;
    return cookies?.[cookieName] ?? null;
  }

  private extractAccessToken(req: AuthedRequest): string | null {
    return this.extractToken(req);
  }

  private extractRbacToken(req: AuthedRequest): string | null {
    const cookieName = rbacCookieName(this.config);
    const cookies = (req as unknown as { cookies?: Record<string, string> })
      .cookies;
    const fromCookie = cookies?.[cookieName] ?? null;
    if (fromCookie) return fromCookie;
    const header = req.headers['x-rbac-token'];
    return (Array.isArray(header) ? header[0] : header) ?? null;
  }

  private extractDeviceToken(req: AuthedRequest): string | null {
    const name = deviceCookieName(this.config);
    const cookies = (req as unknown as { cookies?: Record<string, string> })
      .cookies;
    const fromCookie = cookies?.[name] ?? null;
    if (fromCookie) return fromCookie;
    const header = req.headers['x-device-token'];
    return (Array.isArray(header) ? header[0] : header) ?? null;
  }
}
