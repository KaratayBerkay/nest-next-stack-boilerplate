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
import { rbacCookieName } from '../auth/rbac-cookie';
import { userCookieName } from '../auth/user-cookie';
import { deviceCookieName } from '../devices/device-cookie';
import type { JwtPayload, JwtUser } from '../auth/auth.types';
import { TokenDerivationService } from '../auth/token-derivation.service';
import { TokenStoreService } from '../auth/token-store.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAuthGuard.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly tokenStore: TokenStoreService,
    private readonly derivation: TokenDerivationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const accessToken = this.extractAccessToken(req);
    if (!accessToken) return true;

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(accessToken);
    } catch {
      this.logger.debug('Optional auth: JWT invalid — proceeding anonymously');
      return true;
    }

    const rbacToken = this.extractRbacToken(req);
    const deviceToken = this.extractDeviceToken(req);
    const userToken = this.extractUserToken(req);

    let sessionUser: Awaited<ReturnType<typeof this.tokenStore.read>> | null = null;

    if (rbacToken && userToken) {
      const expectedUserToken = this.derivation.deriveUserToken(payload.sub);
      if (this.derivation.timingSafeEqual(userToken, expectedUserToken)) {
        const compoundKey = this.tokenStore.buildKey(
          accessToken,
          rbacToken,
          deviceToken ?? '',
          userToken,
        );
        try {
          sessionUser = await this.tokenStore.read(compoundKey);
        } catch {
          this.logger.debug('Optional auth: Redis read failed — proceeding with JWT user');
        }

        if (sessionUser && payload.sub === sessionUser.userId) {
          const expectedRbacToken = this.derivation.deriveRbacToken(
            payload.sub,
            sessionUser.tier,
          );
          if (this.derivation.timingSafeEqual(rbacToken, expectedRbacToken)) {
            (req as Request & { user?: JwtUser }).user = {
              userId: sessionUser.userId,
              email: sessionUser.email,
              role: sessionUser.role,
              tier: sessionUser.tier,
              name: sessionUser.name,
              username: sessionUser.username,
              avatarUrl: sessionUser.avatarUrl,
              locale: sessionUser.locale || 'en',
              timezone: sessionUser.timezone || 'UTC',
              friends: sessionUser.friends,
              unread: sessionUser.unread,
              orgIds: sessionUser.orgIds,
              teamIds: sessionUser.teamIds,
              sessionId: sessionUser.sessionId,
            };
            try {
              await this.tokenStore.extendTTL(compoundKey);
            } catch {
              this.logger.debug('Optional auth: TTL extend failed — non-fatal');
            }
            return true;
          }
        }
      }
    }

    (req as Request & { user?: JwtUser }).user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tier: 'FREE',
    };

    return true;
  }

  private extractAccessToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice(7);
    }
    const cookieName = accessCookieName(this.config);
    const cookies = (req as unknown as { cookies?: Record<string, string> }).cookies;
    return cookies?.[cookieName] ?? null;
  }

  private extractRbacToken(req: Request): string | null {
    const cookieName = rbacCookieName(this.config);
    const cookies = (req as unknown as { cookies?: Record<string, string> }).cookies;
    const fromCookie = cookies?.[cookieName] ?? null;
    if (fromCookie) return fromCookie;
    const header = req.headers['x-rbac-token'];
    return (Array.isArray(header) ? header[0] : header) ?? null;
  }

  private extractDeviceToken(req: Request): string | null {
    const name = deviceCookieName(this.config);
    const cookies = (req as unknown as { cookies?: Record<string, string> }).cookies;
    const fromCookie = cookies?.[name] ?? null;
    if (fromCookie) return fromCookie;
    const header = req.headers['x-device-token'];
    return (Array.isArray(header) ? header[0] : header) ?? null;
  }

  private extractUserToken(req: Request): string | null {
    const cookieName = userCookieName(this.config);
    const cookies = (req as unknown as { cookies?: Record<string, string> }).cookies;
    const fromCookie = cookies?.[cookieName] ?? null;
    if (fromCookie) return fromCookie;
    const header = req.headers['x-user-token'];
    return (Array.isArray(header) ? header[0] : header) ?? null;
  }
}
