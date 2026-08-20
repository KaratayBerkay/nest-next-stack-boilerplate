import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../common/crypto/crypto.service';
import { encryptId } from '../common/id-codec/id-codec';
import { SessionValidatorService } from './session-validator.service';
import { TokenDerivationService } from './token-derivation.service';
import type { TokenStoreService } from './token-store.service';

// Real uuid shapes, not short placeholder strings — the JWT payload's
// sub is now encrypted (AuthTokenService.issueTokens) and decrypted right
// back in SessionValidatorService.validate(), so it has to be something
// encryptId() actually accepts.
const USER_ID = '01890a5d-ac96-774b-bcce-b302099a8057';
const OTHER_USER_ID = '01890a5d-ac96-774b-bcce-b302099a8058';

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
  };
}

const validPayload = {
  sub: encryptId(USER_ID),
  email: 'test@test.com',
  role: 'USER',
};

const baseSession = {
  email: 'test@test.com',
  role: 'USER',
  deviceId: 'd1',
  ip: '',
  userAgent: '',
  v: '2',
  name: '',
  username: '',
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

describe('SessionValidatorService', () => {
  let jwtService: JwtService;
  let tokenStore: MockTokenStore;
  let validator: SessionValidatorService;

  beforeAll(() => {
    jwtService = new JwtService({
      secret: 'test-secret',
      signOptions: { expiresIn: '900s' },
    });
  });

  beforeEach(() => {
    tokenStore = mockTokenStore();
    validator = new SessionValidatorService(
      jwtService,
      tokenStore as unknown as TokenStoreService,
      derivation,
    );
  });

  it('validates a genuine session', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken(USER_ID, 'FREE');
    const userToken = derivation.deriveUserToken(USER_ID);
    const deviceToken = crypto.randomToken();
    const key = tokenStore.buildKey(
      accessToken,
      rbacToken,
      deviceToken,
      userToken,
    );
    await tokenStore.write(key, {
      ...baseSession,
      userId: USER_ID,
      tier: 'FREE',
      sessionId: 's1',
      chatNickname: 'ducky',
    });

    const result = await validator.validate({
      accessToken,
      rbacToken,
      deviceToken,
      userToken,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok result');
    expect(result.session.userId).toBe(USER_ID);
    expect(result.session.tier).toBe('FREE');
    expect(result.session.chatNickname).toBe('ducky');
    expect(result.compoundKey).toBe(key);
  });

  it('reports missing_access_token when access token is absent', async () => {
    const result = await validator.validate({
      accessToken: null,
      rbacToken: 'rt',
      deviceToken: 'dt',
      userToken: 'ut',
    });
    expect(result).toEqual({ ok: false, reason: 'missing_access_token' });
  });

  it('reports invalid_jwt when the access token is tampered', async () => {
    const rbacToken = derivation.deriveRbacToken(USER_ID, 'FREE');
    const userToken = derivation.deriveUserToken(USER_ID);
    const result = await validator.validate({
      accessToken: 'tampered-jwt',
      rbacToken,
      deviceToken: null,
      userToken,
    });
    expect(result).toEqual({ ok: false, reason: 'invalid_jwt' });
  });

  it('reports missing_rbac_token when rbac token is absent', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const result = await validator.validate({
      accessToken,
      rbacToken: null,
      deviceToken: 'dt',
      userToken: 'ut',
    });
    expect(result).toEqual({ ok: false, reason: 'missing_rbac_token' });
  });

  it('reports missing_user_token when user token is absent', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken(USER_ID, 'FREE');
    const result = await validator.validate({
      accessToken,
      rbacToken,
      deviceToken: null,
      userToken: null,
    });
    expect(result).toEqual({ ok: false, reason: 'missing_user_token' });
  });

  it('reports user_token_expired for a user token from yesterday (midnight cutoff)', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken(USER_ID, 'FREE');
    const yesterday = new Date(Date.now() - 86400000);
    const oldUserToken = derivation.deriveUserToken(USER_ID, yesterday);
    const result = await validator.validate({
      accessToken,
      rbacToken,
      deviceToken: null,
      userToken: oldUserToken,
    });
    expect(result).toEqual({ ok: false, reason: 'user_token_expired' });
  });

  it('reports session_miss when the Redis key is missing (expired/revoked)', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken(USER_ID, 'FREE');
    const userToken = derivation.deriveUserToken(USER_ID);
    const result = await validator.validate({
      accessToken,
      rbacToken,
      deviceToken: null,
      userToken,
    });
    expect(result).toEqual({ ok: false, reason: 'session_miss' });
  });

  it('reports rbac_mismatch when rbac derivation does not match (tier changed)', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const oldRbac = derivation.deriveRbacToken(USER_ID, 'FREE');
    const userToken = derivation.deriveUserToken(USER_ID);
    const deviceToken = crypto.randomToken();
    const key = tokenStore.buildKey(
      accessToken,
      oldRbac,
      deviceToken,
      userToken,
    );
    // Stored tier differs from the tier the presented rbac token was derived with.
    await tokenStore.write(key, {
      ...baseSession,
      userId: USER_ID,
      tier: 'PREMIUM',
      sessionId: 's1',
    });
    const result = await validator.validate({
      accessToken,
      rbacToken: oldRbac,
      deviceToken,
      userToken,
    });
    expect(result).toEqual({ ok: false, reason: 'rbac_mismatch' });
  });

  it('reports user_mismatch when the JWT sub does not match the stored userId', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken(USER_ID, 'FREE');
    const userToken = derivation.deriveUserToken(USER_ID);
    const key = tokenStore.buildKey(accessToken, rbacToken, '', userToken);
    await tokenStore.write(key, {
      ...baseSession,
      userId: OTHER_USER_ID,
      tier: 'FREE',
      sessionId: 's2',
    });
    const result = await validator.validate({
      accessToken,
      rbacToken,
      deviceToken: null,
      userToken,
    });
    expect(result).toEqual({ ok: false, reason: 'user_mismatch' });
  });

  it('reports redis_unavailable when Redis is unreachable', async () => {
    const brokenStore = {
      buildKey: jest.fn(() => 'sess:key'),
      read: jest.fn(() => Promise.reject(new Error('ECONNREFUSED'))),
    };
    const brokenValidator = new SessionValidatorService(
      jwtService,
      brokenStore as unknown as TokenStoreService,
      derivation,
    );
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken(USER_ID, 'FREE');
    const userToken = derivation.deriveUserToken(USER_ID);
    const result = await brokenValidator.validate({
      accessToken,
      rbacToken,
      deviceToken: null,
      userToken,
    });
    expect(result).toEqual({ ok: false, reason: 'redis_unavailable' });
  });

  it('treats a missing device token as an empty compound-key segment, not a rejection', async () => {
    const accessToken = await jwtService.signAsync(validPayload);
    const rbacToken = derivation.deriveRbacToken(USER_ID, 'FREE');
    const userToken = derivation.deriveUserToken(USER_ID);
    const key = tokenStore.buildKey(accessToken, rbacToken, '', userToken);
    await tokenStore.write(key, {
      ...baseSession,
      userId: USER_ID,
      tier: 'FREE',
      sessionId: 's1',
    });
    const result = await validator.validate({
      accessToken,
      rbacToken,
      deviceToken: null,
      userToken,
    });
    expect(result.ok).toBe(true);
  });
});
