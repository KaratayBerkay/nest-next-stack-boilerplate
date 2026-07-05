import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { accessCookieName } from './access-cookie';
import { JwtPayload, JwtUser } from './auth.types';
import { rbacCookieName } from './rbac-cookie';
import { userCookieName } from './user-cookie';
import { TokenDerivationService } from './token-derivation.service';
import { TokenStoreService } from './token-store.service';
import { deviceCookieName } from '../devices/device-cookie';
import { parseDeviceType } from '../common/utils/device-type';

interface AuthedRequest extends Request {
  user?: JwtUser;
}

/**
 * Session-based auth guard — Phase 3 design.
 *
 * Ordered checks (fastest first):
 * 1. JWT signature/expiry check (zero I/O)
 * 2. Extract rbac + device + user tokens; missing rbac or user -> 401
 * 3. Midnight cutoff, pre-Redis: recompute userToken(payload.sub), timing-safe compare -> 401
 * 4. Build 4-segment key -> HGETALL (Redis error -> 503, miss -> 401)
 * 5. payload.sub === hash.userId sanity
 * 6. rbac derivation check, post-read: deriveRbacToken(userId, hash.tier) vs presented -> 401
 * 7. IP policy unchanged (WARN / AUTH_IP_STRICT)
 * 8. Attach widened req.user = { userId, email, role, tier, name, friends, unread, orgIds, teamIds }
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  private readonly logger = new Logger(SessionAuthGuard.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly tokenStore: TokenStoreService,
    private readonly derivation: TokenDerivationService,
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

    // Step 2: Extract rbac + device + user tokens.
    const rbacToken = this.extractRbacToken(req);
    const deviceToken = this.extractDeviceToken(req);
    const userToken = this.extractUserToken(req);
    if (!rbacToken) {
      throw new UnauthorizedException('Missing RBAC token');
    }
    if (!userToken) {
      throw new UnauthorizedException('Missing user token');
    }

    // Step 3: Midnight cutoff — recompute today's userToken, pre-Redis.
    const expectedUserToken = this.derivation.deriveUserToken(payload.sub);
    if (!this.derivation.timingSafeEqual(userToken, expectedUserToken)) {
      throw new UnauthorizedException('Daily token expired');
    }

    // Step 4: Build 4-segment key -> HGETALL from Redis. Fail closed.
    const compoundKey = this.tokenStore.buildKey(
      accessToken,
      rbacToken,
      deviceToken ?? '',
      userToken,
    );
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

    // Step 5: Sanity — payload.sub === hash.userId
    if (payload.sub !== sessionUser.userId) {
      throw new UnauthorizedException('Token mismatch');
    }

    // Step 6: rbac derivation check — derive from hash.tier, compare vs presented.
    const expectedRbacToken = this.derivation.deriveRbacToken(
      payload.sub,
      sessionUser.tier,
    );
    if (!this.derivation.timingSafeEqual(rbacToken, expectedRbacToken)) {
      throw new UnauthorizedException('RBAC token expired or tier changed');
    }

    // Step 7: IP / device change detection
    const reqIp = req.ip ?? null;
    const reqUa = req.headers['user-agent'] ?? null;
    if (reqIp && sessionUser.ip && reqIp !== sessionUser.ip) {
      this.logger.log({
        category: 'session',
        event: 'session.ip_change',
        token: sessionUser.sessionId,
        userId: sessionUser.userId,
        oldIp: sessionUser.ip,
        newIp: reqIp,
        userAgent: reqUa,
        deviceType: parseDeviceType(reqUa),
      });
      await this.tokenStore.updateFields(compoundKey, { ip: reqIp });
      const strict = this.config.get<string>('AUTH_IP_STRICT') === 'true';
      if (strict) {
        throw new UnauthorizedException('IP address mismatch');
      }
    }
    if (reqUa && sessionUser.userAgent && reqUa !== sessionUser.userAgent) {
      this.logger.log({
        category: 'session',
        event: 'session.ua_change',
        token: sessionUser.sessionId,
        userId: sessionUser.userId,
        userAgent: reqUa,
        deviceType: parseDeviceType(reqUa),
      });
      await this.tokenStore.updateFields(compoundKey, { userAgent: reqUa });
    }

    // Step 8: Attach widened user to request.
    req.user = {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role: sessionUser.role,
      tier: sessionUser.tier,
      name: sessionUser.name,
      friends: sessionUser.friends,
      unread: sessionUser.unread,
      orgIds: sessionUser.orgIds,
      teamIds: sessionUser.teamIds,
      sessionId: sessionUser.sessionId,
    };

    // Step 9: Slide Redis TTL so active sessions survive JWT lifetime.
    await this.tokenStore.extendTTL(compoundKey);

    return true;
  }

  private extractAccessToken(req: AuthedRequest): string | null {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice(7);
    }
    const cookieName = accessCookieName(this.config);
    const cookies = (req as unknown as { cookies?: Record<string, string> })
      .cookies;
    return cookies?.[cookieName] ?? null;
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

  private extractUserToken(req: AuthedRequest): string | null {
    const cookieName = userCookieName(this.config);
    const cookies = (req as unknown as { cookies?: Record<string, string> })
      .cookies;
    const fromCookie = cookies?.[cookieName] ?? null;
    if (fromCookie) return fromCookie;
    const header = req.headers['x-user-token'];
    return (Array.isArray(header) ? header[0] : header) ?? null;
  }
}
