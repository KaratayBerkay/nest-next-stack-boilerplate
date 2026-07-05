import { HttpException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { CryptoService } from '../common/crypto/crypto.service';
import { TokenDerivationService } from './token-derivation.service';
import { SessionAuthGuard } from './session-auth.guard';
import type { TokenStoreService } from './token-store.service';

const cryptoConfig = {
  getOrThrow: () =>
    'ced15b2ae4e4ea91413c96ccffbf0b974f8a0c038c77a43eac6d0f053217deca',
  get: (key: string, def?: string) => {
    if (key === 'TOKEN_LENGTH') return '90';
    if (key === 'JWT_ACCESS_TTL') return '900s';
    return def ?? null;
  },
} as unknown as ConfigService;
const crypto = new CryptoService(cryptoConfig);
crypto.onModuleInit();

const derivationConfig = {
  get: (_key: string, _default?: string) => undefined,
  getOrThrow: () =>
    'ced15b2ae4e4ea91413c96ccffbf0b974f8a0c038c77a43eac6d0f053217deca',
} as unknown as ConfigService;
const derivation = new TokenDerivationService(crypto, derivationConfig);

interface MockTokenStore {
  buildKey: jest.Mock<string, [string, string, string, string]>;
  read: jest.Mock<Promise<Record<string, unknown> | null>, [string]>;
  write: jest.Mock<Promise<void>, [string, Record<string, unknown>]>;
  revoke: jest.Mock<Promise<void>, [string]>;
  extendTTL: jest.Mock<Promise<void>, [string]>;
  updateFields: jest.Mock<
    Promise<void>,
    [string, Partial<Record<string, unknown>>]
  >;
}

function mockTokenStore(): MockTokenStore {
  const store = new Map<string, Record<string, unknown>>();
  return {
    buildKey: jest.fn((at: string, rt: string, dt: string, ut: string) => {
      const parts = [at, rt, dt, ut].map((t: string) => crypto.sha256(t));
      return `sess:${parts.join(':')}`;
    }),
    read: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    write: jest.fn((key: string, data: Record<string, unknown>) => {
      store.set(key, { ...data, issuedAt: new Date().toISOString() });
      return Promise.resolve();
    }),
    revoke: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
    extendTTL: jest.fn((_key: string) => Promise.resolve()),
    updateFields: jest.fn(
      (_key: string, _fields: Partial<Record<string, unknown>>) =>
        Promise.resolve(),
    ),
  };
}

interface MockRequest {
  headers: Record<string, string | undefined>;
  cookies: Record<string, string>;
  ip: string | null;
  user: Record<string, unknown> | undefined;
}

function createRequest(overrides: {
  accessToken?: string;
  rbacToken?: string;
  deviceToken?: string;
  userToken?: string;
  ip?: string;
}): MockRequest {
  const { accessToken, rbacToken, deviceToken, userToken, ip } = overrides;
  const cookies: Record<string, string> = {};
  if (accessToken) cookies['access_token'] = accessToken;
  if (rbacToken) cookies['rbac_token'] = rbacToken;
  if (deviceToken) cookies['device_token'] = deviceToken;
  if (userToken) cookies['user_token'] = userToken;
  const headers: Record<string, string | undefined> = {};
  if (accessToken) headers['authorization'] = `Bearer ${accessToken}`;
  return { headers, cookies, ip: ip ?? null, user: undefined };
}

function gqlCtx(
  req: MockRequest,
): Pick<
  ExecutionContext,
  'getType' | 'getHandler' | 'getClass' | 'getArgs' | 'getArgByIndex'
> {
  const args: [null, Record<string, never>, { req: MockRequest }, null] = [
    null,
    {},
    { req },
    null,
  ];
  return {
    getType: () => 'graphql' as const,
    getHandler: () => ({}),
    getClass: () => Object,
    getArgs: () => args,
    getArgByIndex: (i: number) => args[i],
  };
}

const validPayload = { sub: 'u1', email: 'test@test.com', role: 'USER' };

describe('SessionAuthGuard', () => {
  let jwtService: JwtService;
  let config: ConfigService;
  let tokenStore: MockTokenStore;
  let guard: SessionAuthGuard;

  beforeAll(() => {
    jwtService = new JwtService({
      secret: 'test-secret',
      signOptions: { expiresIn: '900s' },
    });
    config = {
      get: (key: string, def?: string) => {
        if (key === 'AUTH_IP_STRICT') return 'false';
        if (key === 'JWT_ACCESS_TTL') return '900s';
        if (key === 'NODE_ENV') return 'development';
        return def ?? null;
      },
      getOrThrow: () => 'test-secret',
    } as unknown as ConfigService;
  });

  beforeEach(() => {
    tokenStore = mockTokenStore();
    guard = new SessionAuthGuard(
      jwtService,
      config,
      tokenStore as unknown as TokenStoreService,
      derivation,
    );
  });

  it('authenticates a valid session', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken('u1', 'FREE');
    const userToken = derivation.deriveUserToken('u1');
    const deviceToken = crypto.randomToken();
    const key = tokenStore.buildKey(
      accessToken,
      rbacToken,
      deviceToken,
      userToken,
    );
    await tokenStore.write(key, {
      userId: 'u1',
      email: 'test@test.com',
      role: 'USER',
      tier: 'FREE',
      deviceId: 'd1',
      ip: '',
      userAgent: '',
      sessionId: 's1',
      v: '2',
      name: '',
      username: '',
      avatarUrl: '',
      locale: 'en',
      timezone: 'UTC',
      friends: [],
      unread: 0,
      orgIds: [],
      teamIds: [],
    });
    const req = createRequest({
      accessToken,
      rbacToken,
      deviceToken,
      userToken,
    });
    const result = await guard.canActivate(
      gqlCtx(req) as unknown as ExecutionContext,
    );
    expect(result).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user!.userId).toBe('u1');
    expect(req.user!.tier).toBe('FREE');
  });

  it('throws 401 when access token is missing', async () => {
    const req = createRequest({
      rbacToken: 'rt',
      deviceToken: 'dt',
      userToken: 'ut',
    });
    req.headers.authorization = undefined;
    req.cookies = {};
    await expect(
      guard.canActivate(gqlCtx(req) as unknown as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when rbac token is missing', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    await expect(
      guard.canActivate(
        gqlCtx(
          createRequest({ accessToken, deviceToken: 'dt', userToken: 'ut' }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when user token is missing', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken('u1', 'FREE');
    await expect(
      guard.canActivate(
        gqlCtx(
          createRequest({ accessToken, rbacToken }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when user token is from yesterday (midnight cutoff)', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken('u1', 'FREE');
    const yesterday = new Date(Date.now() - 86400000);
    const oldUserToken = derivation.deriveUserToken('u1', yesterday);
    await expect(
      guard.canActivate(
        gqlCtx(
          createRequest({ accessToken, rbacToken, userToken: oldUserToken }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when the Redis key is missing (expired/revoked)', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken('u1', 'FREE');
    const userToken = derivation.deriveUserToken('u1');
    await expect(
      guard.canActivate(
        gqlCtx(
          createRequest({ accessToken, rbacToken, userToken }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when access token is tampered', async () => {
    const rbacToken = derivation.deriveRbacToken('u1', 'FREE');
    const userToken = derivation.deriveUserToken('u1');
    await expect(
      guard.canActivate(
        gqlCtx(
          createRequest({ accessToken: 'tampered-jwt', rbacToken, userToken }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when rbac derivation does not match (tier changed)', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const oldRbac = derivation.deriveRbacToken('u1', 'FREE');
    const userToken = derivation.deriveUserToken('u1');
    const deviceToken = crypto.randomToken();
    const key = tokenStore.buildKey(
      accessToken,
      oldRbac,
      deviceToken,
      userToken,
    );
    // Store with a different tier than the rbac token was derived with
    await tokenStore.write(key, {
      userId: 'u1',
      email: 'test@test.com',
      role: 'USER',
      tier: 'PREMIUM',
      deviceId: 'd1',
      ip: '',
      userAgent: '',
      sessionId: 's1',
      v: '2',
      name: '',
      username: '',
      avatarUrl: '',
      locale: 'en',
      timezone: 'UTC',
      friends: [],
      unread: 0,
      orgIds: [],
      teamIds: [],
    });
    await expect(
      guard.canActivate(
        gqlCtx(
          createRequest({
            accessToken,
            rbacToken: oldRbac,
            deviceToken,
            userToken,
          }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when JWT sub does not match the stored userId', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken('u1', 'FREE');
    const userToken = derivation.deriveUserToken('u1');
    const key = tokenStore.buildKey(accessToken, rbacToken, '', userToken);
    await tokenStore.write(key, {
      userId: 'u2',
      email: 'u2@t.com',
      role: 'USER',
      tier: 'FREE',
      ip: '',
      userAgent: '',
      sessionId: 's2',
      v: '2',
      name: '',
      username: '',
      avatarUrl: '',
      locale: 'en',
      timezone: 'UTC',
      friends: [],
      unread: 0,
      orgIds: [],
      teamIds: [],
    });
    await expect(
      guard.canActivate(
        gqlCtx(
          createRequest({ accessToken, rbacToken, userToken }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects IP mismatch when AUTH_IP_STRICT=true', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken('u1', 'FREE');
    const userToken = derivation.deriveUserToken('u1');
    const key = tokenStore.buildKey(accessToken, rbacToken, '', userToken);
    await tokenStore.write(key, {
      userId: 'u1',
      email: 'test@test.com',
      role: 'USER',
      tier: 'FREE',
      ip: '10.0.0.1',
      userAgent: '',
      sessionId: 's1',
      v: '2',
      name: '',
      username: '',
      avatarUrl: '',
      locale: 'en',
      timezone: 'UTC',
      friends: [],
      unread: 0,
      orgIds: [],
      teamIds: [],
    });
    const strictConfig = {
      ...config,
      get: (key: string, def?: string) => {
        if (key === 'AUTH_IP_STRICT') return 'true';
        if (key === 'JWT_ACCESS_TTL') return '900s';
        if (key === 'NODE_ENV') return 'development';
        return def ?? null;
      },
    } as unknown as ConfigService;
    const strictGuard = new SessionAuthGuard(
      jwtService,
      strictConfig,
      tokenStore as unknown as TokenStoreService,
      derivation,
    );
    await expect(
      strictGuard.canActivate(
        gqlCtx(
          createRequest({ accessToken, rbacToken, userToken, ip: '10.0.0.2' }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 503 when Redis is unreachable', async () => {
    const brokenStore = {
      buildKey: jest.fn(() => 'sess:key'),
      read: jest.fn(() => Promise.reject(new Error('ECONNREFUSED'))),
    };
    const brokenGuard = new SessionAuthGuard(
      jwtService,
      config,
      brokenStore as unknown as TokenStoreService,
      derivation,
    );
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken('u1', 'FREE');
    const userToken = derivation.deriveUserToken('u1');
    try {
      await brokenGuard.canActivate(
        gqlCtx(
          createRequest({ accessToken, rbacToken, userToken }),
        ) as unknown as ExecutionContext,
      );
      expect('should have thrown').toBe('');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect((e as HttpException).getStatus()).toBe(503);
    }
  });
});
