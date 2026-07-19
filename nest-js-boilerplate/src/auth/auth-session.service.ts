import { Logger } from '@nestjs/common';
import { TokenStoreService } from './token-store.service';
import { AuthTokenService } from './auth-token.service';
import type { RequestContext } from '../devices/device.service';

export class AuthSessionService {
  private readonly logger = new Logger(AuthSessionService.name);

  constructor(
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
    return true;
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
