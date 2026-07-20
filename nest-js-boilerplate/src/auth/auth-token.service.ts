import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import type { DeviceContext, RequestContext } from '../devices/device.service';
import { parseDeviceType } from '../common/utils/device-type';
import { accessCookieName } from './access-cookie';
import { rbacCookieName, rbacCookieOptions } from './rbac-cookie';
import { userCookieName, userCookieOptions } from './user-cookie';
import { refreshCookieName, refreshCookieOptions } from './refresh-cookie';
import { deviceCookieName } from '../devices/device-cookie';
import { SessionHydrationService } from './session-hydration.service';
import { TokenDerivationService } from './token-derivation.service';
import { TokenStoreService } from './token-store.service';
import { CryptoService } from '../common/crypto/crypto.service';
import type { AuthPayload, SessionUserInput } from './auth.types';

export class AuthTokenService {
  private readonly logger = new Logger(AuthTokenService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly derivation: TokenDerivationService,
    private readonly hydration: SessionHydrationService,
    private readonly tokenStore: TokenStoreService,
    private readonly crypto: CryptoService,
  ) {}

  async issueTokens(
    user: User,
    ctx?: RequestContext,
    device?: DeviceContext,
  ): Promise<AuthPayload> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const rbacToken = this.derivation.deriveRbacToken(
      user.id,
      user.subscriptionTier ?? 'FREE',
    );
    const userToken = this.derivation.deriveUserToken(user.id);
    const snapshot = await this.hydration.hydrate(user);
    const sessionId = this.crypto.randomToken();
    const compoundKey = this.tokenStore.buildKey(
      accessToken,
      rbacToken,
      device?.deviceToken ?? '',
      userToken,
    );

    await this.tokenStore.write(compoundKey, {
      userId: user.id,
      email: user.email,
      role: user.role,
      tier: user.subscriptionTier ?? 'FREE',
      deviceId: device?.deviceId ?? null,
      ip: device?.ip ?? null,
      userAgent: device?.userAgent ?? null,
      sessionId,
      ...snapshot,
    } as SessionUserInput);

    this.logger.log({
      category: 'session',
      event: 'session.start',
      token: sessionId,
      userId: user.id,
      ip: device?.ip,
      deviceId: device?.deviceId,
      deviceType: parseDeviceType(device?.userAgent),
      userAgent: device?.userAgent,
      issuedAt: new Date().toISOString(),
    });

    this.setRbacCookie(ctx, rbacToken);
    this.setUserCookie(ctx, userToken);
    this.setRefreshCookie(ctx, sessionId);

    return {
      accessToken,
      rbacToken,
      userToken,
      deviceId: device?.deviceId,
      deviceToken: device?.deviceToken,
      user,
      refreshToken: sessionId,
    };
  }

  // --- Token extraction ---

  extractAccessToken(ctx: RequestContext): string | null {
    const header = ctx.req.headers.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);
    return this.extractCookie(ctx, accessCookieName(this.config));
  }

  extractRbacToken(ctx: RequestContext): string | null {
    return this.extractCookieOrHeader(
      ctx,
      rbacCookieName(this.config),
      'x-rbac-token',
    );
  }

  extractDeviceToken(ctx: RequestContext): string | null {
    return this.extractCookieOrHeader(
      ctx,
      deviceCookieName(this.config),
      'x-device-token',
    );
  }

  extractUserToken(ctx: RequestContext): string | null {
    return this.extractCookieOrHeader(
      ctx,
      userCookieName(this.config),
      'x-user-token',
    );
  }

  extractRefreshToken(ctx: RequestContext): string | null {
    return this.extractCookie(ctx, refreshCookieName(this.config));
  }

  private extractCookie(ctx: RequestContext, name: string): string | null {
    const bag = (ctx.req as unknown as { cookies?: Record<string, string> })
      .cookies;
    return bag?.[name] ?? null;
  }

  private extractCookieOrHeader(
    ctx: RequestContext,
    cookieName: string,
    headerName: string,
  ): string | null {
    const fromCookie = this.extractCookie(ctx, cookieName);
    if (fromCookie) return fromCookie;
    const header = ctx.req.headers[headerName];
    return (Array.isArray(header) ? header[0] : header) ?? null;
  }

  // --- Cookie setters ---

  setRbacCookie(ctx: RequestContext | undefined, token: string): void {
    ctx?.req.res?.cookie(
      rbacCookieName(this.config),
      token,
      rbacCookieOptions(this.config),
    );
  }

  clearRbacCookie(ctx: RequestContext): void {
    const { maxAge: _maxAge, ...clearOpts } = rbacCookieOptions(this.config);
    ctx.req.res?.clearCookie(rbacCookieName(this.config), clearOpts);
  }

  setUserCookie(ctx: RequestContext | undefined, token: string): void {
    ctx?.req.res?.cookie(
      userCookieName(this.config),
      token,
      userCookieOptions(this.config),
    );
  }

  clearUserCookie(ctx: RequestContext): void {
    const { maxAge: _maxAge, ...clearOpts } = userCookieOptions(this.config);
    ctx.req.res?.clearCookie(userCookieName(this.config), clearOpts);
  }

  setRefreshCookie(
    ctx: RequestContext | undefined,
    sessionId: string,
  ): void {
    ctx?.req.res?.cookie(
      refreshCookieName(this.config),
      sessionId,
      refreshCookieOptions(this.config),
    );
  }

  clearRefreshCookie(ctx: RequestContext): void {
    const { maxAge: _maxAge, ...clearOpts } = refreshCookieOptions(
      this.config,
    );
    ctx.req.res?.clearCookie(refreshCookieName(this.config), clearOpts);
  }
}
