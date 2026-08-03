import { Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from './token-store.service';
import { AuthTokenService } from './auth-token.service';
import { E2EE_LIFECYCLE_HOOK } from '../e2ee/e2ee-lifecycle.tokens';
import type { E2eeLifecycleHook } from '../e2ee/e2ee-lifecycle.tokens';
import type { SessionUser } from './auth.types';
import type { DeviceContext, RequestContext } from '../devices/device.service';

function unauthorized(exc: string, msg: string, key: string) {
  return new UnauthorizedException({ exc, msg, key });
}

interface RefreshUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

type PrismaUser = NonNullable<
  Awaited<ReturnType<PrismaService['user']['findUnique']>>
>;

interface RefreshContext {
  refreshToken: string;
  session: SessionUser;
  user: PrismaUser;
}

async function resolveRefreshContext(
  prisma: PrismaService,
  tokenStore: TokenStoreService,
  authTokens: AuthTokenService,
  ctx: RequestContext,
): Promise<RefreshContext> {
  const refreshToken = authTokens.extractRefreshToken(ctx);
  if (!refreshToken) {
    throw unauthorized(
      'EX_AUTH_INVALID_TOKEN',
      'Missing refresh token',
      'auth.errors.sessionExpired',
    );
  }

  const session = await tokenStore.findByRefreshSessionId(refreshToken);
  if (!session) {
    throw unauthorized(
      'EX_AUTH_INVALID_TOKEN',
      'Invalid or expired refresh token',
      'auth.errors.sessionExpired',
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    throw unauthorized(
      'EX_AUTH_ACCOUNT_INACTIVE',
      'User not found',
      'auth.errors.accountInactive',
    );
  }

  return { refreshToken, session, user };
}

async function resolveTrustedDevice(
  prisma: PrismaService,
  deviceId: string | null,
): Promise<boolean> {
  if (!deviceId) return false;
  const record = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { trusted: true },
  });
  return record?.trusted ?? false;
}

function buildDeviceContext(
  deviceToken: string | null,
  session: SessionUser,
  ctx: RequestContext,
  trusted: boolean,
): DeviceContext | undefined {
  if (!deviceToken) return undefined;
  return {
    deviceId: session.deviceId ?? '',
    deviceToken,
    changed: false,
    ip: ctx.req.ip ?? null,
    userAgent: ctx.req.headers['user-agent'] ?? null,
    trusted,
  };
}

export class AuthSessionService {
  private readonly logger = new Logger(AuthSessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
    private readonly authTokens: AuthTokenService,
    private readonly e2ee?: E2eeLifecycleHook,
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

      // Wipe E2EE keys for this session's device so the bundle is
      // immediately unclaimable (§2.1 of the plan).
      if (session?.userId) {
        await this.e2ee?.deleteForSession(
          session.userId,
          session.deviceId,
        );
      }
    }

    this.authTokens.clearRbacCookie(ctx);
    this.authTokens.clearUserCookie(ctx);
    this.authTokens.clearRefreshCookie(ctx);
    return true;
  }

  async refresh(ctx: RequestContext): Promise<{
    accessToken: string;
    rbacToken?: string;
    userToken?: string;
    deviceId?: string;
    deviceToken?: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      avatarUrl: string | null;
    };
  }> {
    const { refreshToken, session, user } = await resolveRefreshContext(
      this.prisma,
      this.tokenStore,
      this.authTokens,
      ctx,
    );

    const rbacToken = this.authTokens.extractRbacToken(ctx) ?? '';
    const deviceToken = this.authTokens.extractDeviceToken(ctx);
    const userToken = this.authTokens.extractUserToken(ctx) ?? '';

    const compoundKey = this.tokenStore.buildKey(
      this.authTokens.extractAccessToken(ctx) ?? '',
      rbacToken,
      deviceToken ?? '',
      userToken,
    );
    await this.tokenStore.revoke(compoundKey);

    // Carry the renewing device's identity into the new session. Without
    // this, issueTokens() keys the new session on an empty device-token
    // slot that the next real request — which always presents the actual
    // one — can never match, making every refresh unusable the instant
    // it's issued.
    const trusted = await resolveTrustedDevice(this.prisma, session.deviceId);
    const device = buildDeviceContext(deviceToken, session, ctx, trusted);

    const payload = await this.authTokens.issueTokens(user, ctx, device);

    // The rotated rbacToken/userToken/deviceId must reach the client — the
    // whole point of a refresh is replacing the stale cookies that 401'd.
    // The web BFF (app/api/auth/refresh/route.ts) sets them from these fields.
    return {
      accessToken: payload.accessToken ?? '',
      rbacToken: payload.rbacToken,
      userToken: payload.userToken,
      deviceId: payload.deviceId,
      deviceToken: payload.deviceToken,
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
