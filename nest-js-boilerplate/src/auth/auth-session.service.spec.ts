import { UnauthorizedException } from '@nestjs/common';
import { AuthSessionService } from './auth-session.service';
import type { RequestContext } from '../devices/device.service';
import type { SessionUser } from './auth.types';

describe('AuthSessionService.refresh', () => {
  const fakeUser = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'User One',
    avatarUrl: null,
    role: 'USER',
    subscriptionTier: 'FREE',
  };

  const fakeSession: SessionUser = {
    userId: 'user-1',
    email: 'user@example.com',
    role: 'USER',
    tier: 'FREE',
    deviceId: 'device-1',
    ip: '10.0.0.1',
    userAgent: 'original-agent',
    issuedAt: new Date().toISOString(),
    sessionId: 'old-session-id',
    v: '2',
    name: 'User One',
    username: 'userone',
    avatarUrl: '',
    locale: 'en',
    timezone: 'UTC',
    friends: [],
    unread: 0,
    orgIds: [],
    teamIds: [],
  };

  function buildCtx(headers: Record<string, string> = {}): RequestContext {
    return {
      req: {
        ip: '10.0.0.2',
        headers: { 'user-agent': 'renewing-agent', ...headers },
      },
    } as unknown as RequestContext;
  }

  function buildService(overrides?: {
    extractDeviceToken?: jest.Mock;
    session?: SessionUser | null;
  }) {
    const session =
      'session' in (overrides ?? {}) ? overrides!.session : fakeSession;
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(fakeUser) },
    };
    const tokenStore = {
      findByRefreshSessionId: jest.fn().mockResolvedValue(session),
      buildKey: jest.fn().mockReturnValue('compound-key'),
      revoke: jest.fn().mockResolvedValue(undefined),
    };
    const authTokens = {
      extractRefreshToken: jest.fn().mockReturnValue('refresh-token-value'),
      extractAccessToken: jest.fn().mockReturnValue('old-access-token'),
      extractRbacToken: jest.fn().mockReturnValue('rbac-token-value'),
      extractUserToken: jest.fn().mockReturnValue('user-token-value'),
      extractDeviceToken:
        overrides?.extractDeviceToken ??
        jest.fn().mockReturnValue('real-device-token'),
      issueTokens: jest.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-session-id',
        rbacToken: 'rbac-token-value',
        userToken: 'user-token-value',
        user: fakeUser,
      }),
    };

    const service = new AuthSessionService(
      prisma as never,
      tokenStore as never,
      authTokens as never,
    );
    return { service, tokenStore, authTokens, prisma };
  }

  it('carries the renewing device identity into issueTokens', async () => {
    const { service, authTokens } = buildService();

    await service.refresh(buildCtx());

    expect(authTokens.issueTokens).toHaveBeenCalledWith(
      fakeUser,
      expect.anything(),
      {
        deviceId: 'device-1',
        deviceToken: 'real-device-token',
        changed: false,
        ip: '10.0.0.2',
        userAgent: 'renewing-agent',
      },
    );
  });

  it('falls back to no device when the request has no device token', async () => {
    const { service, authTokens } = buildService({
      extractDeviceToken: jest.fn().mockReturnValue(null),
    });

    await service.refresh(buildCtx());

    expect(authTokens.issueTokens).toHaveBeenCalledWith(
      fakeUser,
      expect.anything(),
      undefined,
    );
  });

  it('falls back to an empty deviceId if the prior session never had one', async () => {
    const { service, authTokens } = buildService({
      session: { ...fakeSession, deviceId: null },
    });

    await service.refresh(buildCtx());

    expect(authTokens.issueTokens).toHaveBeenCalledWith(
      fakeUser,
      expect.anything(),
      expect.objectContaining({ deviceId: '' }),
    );
  });

  it('throws when no refresh token is presented', async () => {
    const { service, authTokens } = buildService();
    authTokens.extractRefreshToken.mockReturnValue(null);

    await expect(service.refresh(buildCtx())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws when the refresh token matches no session', async () => {
    const { service } = buildService({ session: null });

    await expect(service.refresh(buildCtx())).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
