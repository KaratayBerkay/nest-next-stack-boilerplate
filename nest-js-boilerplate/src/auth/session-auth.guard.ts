import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import { accessCookieName } from './access-cookie';
import { JwtUser, SessionUser } from './auth.types';
import { hashSessionId } from '../common/crypto/crypto.service';
import { rbacCookieName } from './rbac-cookie';
import { userCookieName } from './user-cookie';
import {
  SessionValidationFailureReason,
  SessionValidatorService,
} from './session-validator.service';
import { TokenStoreService } from './token-store.service';
import { deviceCookieName } from '../devices/device-cookie';
import { parseDeviceType } from '../common/utils/device-type';
import { validateRequest } from '../csrf/csrf.middleware';

interface AuthedRequest extends Request {
  user?: JwtUser;
  /** Set by ApiKeyGuard when the request authenticates via API key. */
  _authenticatedByApiKey?: boolean;
}

const FAILURE_MESSAGES: Record<SessionValidationFailureReason, string> = {
  missing_access_token: 'Missing access token',
  invalid_jwt: 'Invalid or expired access token',
  missing_rbac_token: 'Missing RBAC token',
  missing_user_token: 'Missing user token',
  user_token_expired: 'Daily token expired',
  redis_unavailable: 'Service unavailable',
  session_miss: 'Session expired or revoked',
  user_mismatch: 'Token mismatch',
  rbac_mismatch: 'RBAC token expired or tier changed',
};

/**
 * Session-based auth guard — Phase 3 design.
 *
 * Steps 1-6 (JWT verify, token extraction, midnight cutoff, Redis compound-key
 * lookup, sub/userId sanity, rbac derivation) live in SessionValidatorService,
 * shared with the WS handshake check so the two paths can't drift apart again.
 *
 * Ordered checks here (fastest first):
 * 7. IP policy unchanged (WARN / AUTH_IP_STRICT)
 * 8. Attach widened req.user = { userId, email, role, tier, name, friends, unread, orgIds, teamIds }
 * 9. Slide Redis TTL
 * 10. CSRF check for mutations
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  private readonly logger = new Logger(SessionAuthGuard.name);

  constructor(
    private readonly config: ConfigService,
    private readonly tokenStore: TokenStoreService,
    private readonly validator: SessionValidatorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = GqlExecutionContext.create(context).getContext<{
      req: AuthedRequest;
    }>().req;

    // If ApiKeyGuard already authenticated this request, skip session validation.
    if (req._authenticatedByApiKey) {
      return true;
    }

    const result = await this.validator.validate({
      accessToken: this.extractAccessToken(req),
      rbacToken: this.extractRbacToken(req),
      deviceToken: this.extractDeviceToken(req),
      userToken: this.extractUserToken(req),
    });

    if (!result.ok) {
      if (result.reason === 'redis_unavailable') {
        throw new HttpException(
          FAILURE_MESSAGES[result.reason],
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new UnauthorizedException(FAILURE_MESSAGES[result.reason]);
    }

    const sessionUser: SessionUser = result.session;
    const compoundKey = result.compoundKey;

    // Step 7: IP / device change detection
    const reqIp = req.ip ?? null;
    const reqUa = req.headers['user-agent'] ?? null;
    if (reqIp && sessionUser.ip && reqIp !== sessionUser.ip) {
      this.logger.log({
        category: 'session',
        event: 'session.ip_change',
        sessionIdHash: hashSessionId(sessionUser.sessionId),
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
        sessionIdHash: hashSessionId(sessionUser.sessionId),
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
      username: sessionUser.username,
      avatarUrl: sessionUser.avatarUrl,
      locale: sessionUser.locale || 'en',
      timezone: sessionUser.timezone || 'UTC',
      chatNickname: sessionUser.chatNickname,
      useNickname: sessionUser.useNickname,
      friends: sessionUser.friends,
      unread: sessionUser.unread,
      orgIds: sessionUser.orgIds,
      teamIds: sessionUser.teamIds,
      sessionId: sessionUser.sessionId,
      deviceId: sessionUser.deviceId,
    };

    // Step 9: Slide Redis TTL so active sessions survive JWT lifetime.
    await this.tokenStore.extendTTL(compoundKey);

    // Step 10: CSRF check for mutations — cookie-based auth is vulnerable to
    // cross-site request forgery because the browser auto-attaches httpOnly cookies.
    // Bearer token auth (Authorization header) is immune since the browser never
    // auto-attaches it, so skip the check when a bearer token was used.
    // Queries are read-only and don't need protection; only state-changing mutations do.
    const usesBearerAuth = req.headers.authorization?.startsWith('Bearer ');
    if (
      this.isGraphQLMutation(context) &&
      !usesBearerAuth &&
      !validateRequest(req)
    ) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }

    return true;
  }

  private isGraphQLMutation(context: ExecutionContext): boolean {
    if (context.getType<'graphql'>() !== 'graphql') return false;
    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo<{
      parentType?: { name: string };
    }>();
    return info?.parentType?.name === 'Mutation';
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
