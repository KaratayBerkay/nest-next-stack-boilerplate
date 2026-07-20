import { Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from './token-store.service';
import { AuthTokenService } from './auth-token.service';
import { refreshCookieName } from './refresh-cookie';
import type { RequestContext } from '../devices/device.service';

export class AuthSessionService {
  private readonly logger = new Logger(AuthSessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
    private readonly authTokens: AuthTokenService,
  ) {}

  async logout(ctx: RequestContext): Promise<boolean> {
    const accessToken = this.authTokens.extractAccessToken(ctx);
    const rbacToken = this.authTokens.extractRbacToken(ctx);
    const deviceToken = this.authTokens.extractDeviceToken(ctx);
    const userToken = this.authTokens.extractUserToken(ctx);

    if (accessToken && rbacToken) {
      const key = this.tokenStore.buildKey(
        accessToken,
        rbacToken,
        deviceToken ?? '',
        userToken ?? '',
      );
      const session = await this.tokenStore.read(key);
      if (session?.sessionId) {
        const durationMs = session.issuedAt
          ? Date.now() - new Date(session.issuedAt).getTime()
          : 0;
        this.logger.log({
          category: 'session',
          event: 'session.end',
          token: session.sessionId,
          userId: session.userId,
          sessionDurationMs: durationMs,
          reason: 'logout',
        });
      }
      await this.tokenStore.revoke(key);
    }

    this.authTokens.clearRbacCookie(ctx);
    this.authTokens.clearUserCookie(ctx);
    this.authTokens.clearRefreshCookie(ctx);
    return true;
  }

  async refresh(ctx: RequestContext): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      avatarUrl: string | null;
    };
  }> {
    const refreshToken = this.authTokens.extractRefreshToken(ctx);
    if (!refreshToken) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_INVALID_TOKEN',
        msg: 'Missing refresh token',
        key: 'auth.errors.sessionExpired',
      });
    }

    const session = await this.tokenStore.findByRefreshSessionId(
      refreshToken,
    );
    if (!session) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_INVALID_TOKEN',
        msg: 'Invalid or expired refresh token',
        key: 'auth.errors.sessionExpired',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_ACCOUNT_INACTIVE',
        msg: 'User not found',
        key: 'auth.errors.accountInactive',
      });
    }

    const compoundKey = this.tokenStore.buildKey(
      this.authTokens.extractAccessToken(ctx) ?? '',
      this.authTokens.extractRbacToken(ctx) ?? '',
      this.authTokens.extractDeviceToken(ctx) ?? '',
      this.authTokens.extractUserToken(ctx) ?? '',
    );
    await this.tokenStore.revoke(compoundKey);

    const payload = await this.authTokens.issueTokens(user, ctx);

    return {
      accessToken: payload.accessToken ?? '',
      refreshToken: payload.refreshToken ?? '',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async revokePresentedKey(ctx: RequestContext): Promise<void> {
    const accessToken = this.authTokens.extractAccessToken(ctx);
    const rbacToken = this.authTokens.extractRbacToken(ctx);
    const deviceToken = this.authTokens.extractDeviceToken(ctx);
    const userToken = this.authTokens.extractUserToken(ctx);
    if (accessToken && rbacToken) {
      const key = this.tokenStore.buildKey(
        accessToken,
        rbacToken,
        deviceToken ?? '',
        userToken ?? '',
      );
      await this.tokenStore.revoke(key);
    }
  }
}
