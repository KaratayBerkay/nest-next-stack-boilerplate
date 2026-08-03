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
    chatNickname: '',
    useNickname: false,
    hideAvatar: false,
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
      device: {
        findUnique: jest.fn().mockResolvedValue({ trusted: false }),
      },
    };
    const tokenStore = {
      findByRefreshSessionId: jest.fn().mockResolvedValue(session),
      buildKey: jest.fn().mockReturnValue('compound-key'),
      revoke: jest.fn().mockResolvedValue(undefined),
      read: jest.fn().mockResolvedValue(session),
    };
    const realtime = {
      closeSocketsForSession: jest.fn().mockReturnValue(0),
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
      realtime as never,
    );
    return { service, tokenStore, authTokens, prisma, realtime };
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
        trusted: false,
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

  it('returns the rotated rbacToken/userToken so stale cookies can be replaced (F32 regression)', async () => {
    const { service } = buildService();

    const result = await service.refresh(buildCtx());

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-session-id');
    expect(result.rbacToken).toBe('rbac-token-value');
    expect(result.userToken).toBe('user-token-value');
  });

  it('returns a rbac token recomputed for the current tier after a tier change (F32/F23a regression)', async () => {
    const { service, authTokens } = buildService();
    authTokens.issueTokens.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-session-id',
      // The user's tier changed since login — issueTokens derives a fresh
      // rbac token from the current DB tier; refresh must surface it.
      rbacToken: 'rbac-recomputed-for-MEDIUM',
      userToken: 'user-token-value',
      deviceId: 'device-1',
      deviceToken: 'fresh-device-token',
      user: fakeUser,
    });

    const result = await service.refresh(buildCtx());

    expect(result.rbacToken).toBe('rbac-recomputed-for-MEDIUM');
    expect(result.deviceId).toBe('device-1');
    expect(result.deviceToken).toBe('fresh-device-token');
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

describe('AuthSessionService.logout', () => {
  const fakeSession: SessionUser = {
    userId: 'user-1',
    email: 'user@example.com',
    role: 'USER',
    tier: 'FREE',
    deviceId: 'device-1',
    ip: '10.0.0.1',
    userAgent: 'original-agent',
    issuedAt: new Date().toISOString(),
    sessionId: 'session-1',
    v: '2',
    name: 'User One',
    username: 'userone',
    avatarUrl: '',
    locale: 'en',
    timezone: 'UTC',
    chatNickname: '',
    useNickname: false,
    hideAvatar: false,
    friends: [],
    unread: 0,
    orgIds: [],
    teamIds: [],
  };

  function buildService(overrides?: {
    accessToken?: string | null;
    rbacToken?: string | null;
    session?: SessionUser | null;
  }) {
    const accessToken =
      'accessToken' in (overrides ?? {})
        ? overrides!.accessToken
        : 'access-token-value';
    const rbacToken =
      'rbacToken' in (overrides ?? {})
        ? overrides!.rbacToken
        : 'rbac-token-value';
    const session =
      'session' in (overrides ?? {}) ? overrides!.session : fakeSession;

    const tokenStore = {
      buildKey: jest.fn().mockReturnValue('compound-key'),
      read: jest.fn().mockResolvedValue(session),
      revoke: jest.fn().mockResolvedValue(undefined),
    };
    const authTokens = {
      extractAccessToken: jest.fn().mockReturnValue(accessToken),
      extractRbacToken: jest.fn().mockReturnValue(rbacToken),
      extractDeviceToken: jest.fn().mockReturnValue('device-token-value'),
      extractUserToken: jest.fn().mockReturnValue('user-token-value'),
      clearRbacCookie: jest.fn(),
      clearUserCookie: jest.fn(),
      clearRefreshCookie: jest.fn(),
    };
    const realtime = {
      closeSocketsForSession: jest.fn().mockReturnValue(0),
    };

    const service = new AuthSessionService(
      {} as never,
      tokenStore as never,
      authTokens as never,
      realtime as never,
    );
    return { service, tokenStore, authTokens, realtime };
  }

  const ctx = {} as RequestContext;

  it('closes any live sockets for the session being logged out', async () => {
    const { service, tokenStore, realtime } = buildService();

    await service.logout(ctx);

    expect(tokenStore.revoke).toHaveBeenCalledWith('compound-key');
    expect(realtime.closeSocketsForSession).toHaveBeenCalledWith(
      'user-1',
      'session-1',
    );
  });

  it('does not attempt to close sockets when no session is found', async () => {
    const { service, tokenStore, realtime } = buildService({
      session: null,
    });

    await service.logout(ctx);

    expect(tokenStore.revoke).toHaveBeenCalledWith('compound-key');
    expect(realtime.closeSocketsForSession).not.toHaveBeenCalled();
  });

  it('does not attempt to close sockets when the access/rbac tokens are missing', async () => {
    const { service, tokenStore, realtime } = buildService({
      accessToken: null,
    });

    await service.logout(ctx);

    expect(tokenStore.revoke).not.toHaveBeenCalled();
    expect(realtime.closeSocketsForSession).not.toHaveBeenCalled();
  });

  it('still clears cookies regardless of whether a session was found', async () => {
    const { service, authTokens } = buildService({ session: null });

    await service.logout(ctx);

    expect(authTokens.clearRbacCookie).toHaveBeenCalled();
    expect(authTokens.clearUserCookie).toHaveBeenCalled();
    expect(authTokens.clearRefreshCookie).toHaveBeenCalled();
  });
});
