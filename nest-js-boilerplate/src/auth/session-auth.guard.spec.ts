import { HttpException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { CryptoService } from '../common/crypto/crypto.service';
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

interface MockTokenStore {
  buildKey: jest.Mock<string, [string, string, string]>;
  read: jest.Mock<Promise<Record<string, string> | null>, [string]>;
  write: jest.Mock<Promise<void>, [string, Record<string, string>]>;
  revoke: jest.Mock<Promise<void>, [string]>;
}

function mockTokenStore(): MockTokenStore {
  const store = new Map<string, Record<string, string>>();
  return {
    buildKey: jest.fn((at: string, rt: string, dt: string) => {
      const parts = [at, rt, dt].map((t: string) => crypto.sha256(t));
      return `sess:${parts.join(':')}`;
    }),
    read: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    write: jest.fn((key: string, data: Record<string, string>) => {
      store.set(key, { ...data, issuedAt: new Date().toISOString() });
      return Promise.resolve();
    }),
    revoke: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
}

interface MockRequest {
  headers: Record<string, string | undefined>;
  cookies: Record<string, string>;
  ip: string | null;
  user: Record<string, string> | undefined;
}

function createRequest(overrides: {
  accessToken?: string;
  rbacToken?: string;
  deviceToken?: string;
  ip?: string;
}): MockRequest {
  const { accessToken, rbacToken, deviceToken, ip } = overrides;
  const cookies: Record<string, string> = {};
  if (accessToken) cookies['access_token'] = accessToken;
  if (rbacToken) cookies['rbac_token'] = rbacToken;
  if (deviceToken) cookies['device_token'] = deviceToken;
  const headers: Record<string, string | undefined> = {};
  if (accessToken) headers['authorization'] = `Bearer ${accessToken}`;
  return { headers, cookies, ip: ip ?? null, user: undefined };
}

// GqlExecutionContext args layout (after normalizeResolverArgs):
//   [0] = root, [1] = resolver args, [2] = context { req }, [3] = info
// getContext() calls getArgByIndex(2).
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
    );
  });

  it('authenticates a valid session', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = crypto.randomToken();
    const deviceToken = crypto.randomToken();
    const key = tokenStore.buildKey(accessToken, rbacToken, deviceToken);
    await tokenStore.write(key, {
      userId: 'u1',
      email: 'test@test.com',
      role: 'USER',
      tier: 'FREE',
      deviceId: 'd1',
      ip: '',
      userAgent: '',
      sessionId: 's1',
    });
    const req = createRequest({ accessToken, rbacToken, deviceToken });
    const result = await guard.canActivate(
      gqlCtx(req) as unknown as ExecutionContext,
    );
    expect(result).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user!.userId).toBe('u1');
    expect(req.user!.tier).toBe('FREE');
  });

  it('throws 401 when access token is missing', async () => {
    const req = createRequest({ rbacToken: 'rt', deviceToken: 'dt' });
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
          createRequest({ accessToken, deviceToken: 'dt' }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when the Redis key is missing (expired/revoked)', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = crypto.randomToken();
    await expect(
      guard.canActivate(
        gqlCtx(
          createRequest({ accessToken, rbacToken }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when access token is tampered', async () => {
    await expect(
      guard.canActivate(
        gqlCtx(
          createRequest({ accessToken: 'tampered-jwt', rbacToken: 'rt' }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws 401 when JWT sub does not match the stored userId', async () => {
    const accessToken = await jwtService.signAsync({
      ...validPayload,
      sub: 'u1',
    });
    const rbacToken = crypto.randomToken();
    const key = tokenStore.buildKey(accessToken, rbacToken, '');
    await tokenStore.write(key, {
      userId: 'u2',
      email: 'u2@t.com',
      role: 'USER',
      tier: 'FREE',
      ip: '',
      userAgent: '',
      sessionId: 's2',
    });
    await expect(
      guard.canActivate(
        gqlCtx(
          createRequest({ accessToken, rbacToken }),
        ) as unknown as ExecutionContext,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects IP mismatch when AUTH_IP_STRICT=true', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = crypto.randomToken();
    const key = tokenStore.buildKey(accessToken, rbacToken, '');
    await tokenStore.write(key, {
      userId: 'u1',
      email: 'test@test.com',
      role: 'USER',
      tier: 'FREE',
      ip: '10.0.0.1',
      userAgent: '',
      sessionId: 's1',
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
    );
    await expect(
      strictGuard.canActivate(
        gqlCtx(
          createRequest({ accessToken, rbacToken, ip: '10.0.0.2' }),
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
    );
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = crypto.randomToken();
    try {
      await brokenGuard.canActivate(
        gqlCtx(
          createRequest({ accessToken, rbacToken }),
        ) as unknown as ExecutionContext,
      );
      expect('should have thrown').toBe('');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect((e as HttpException).getStatus()).toBe(503);
    }
  });
});
