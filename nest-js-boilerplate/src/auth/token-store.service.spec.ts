/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../common/crypto/crypto.service';
import { TokenStoreService } from './token-store.service';

function createRedisMock() {
  const store = new Map<string, Record<string, string>>();
  const reverse = new Map<string, Set<string>>();

  return {
    multi: jest.fn(() => {
      const ops: Array<() => void> = [];
      return {
        hset: (
          key: string,
          fieldOrData: string | Record<string, string>,
          value?: string,
        ) => {
          ops.push(() => {
            const existing = store.get(key) ?? {};
            if (typeof fieldOrData === 'string' && value !== undefined) {
              store.set(key, { ...existing, [fieldOrData]: value });
            } else {
              store.set(key, {
                ...existing,
                ...(fieldOrData as Record<string, string>),
              });
            }
          });
        },
        expire: () => ops.push(() => {}),
        sadd: (key: string, member: string) => {
          ops.push(() => {
            if (!reverse.has(key)) reverse.set(key, new Set());
            reverse.get(key)!.add(member);
          });
        },
        del: (key: string) => ops.push(() => store.delete(key)),
        srem: (key: string, member: string) =>
          ops.push(() => reverse.get(key)?.delete(member)),
        hincrby: (key: string, field: string, delta: number) =>
          ops.push(() => {
            const existing = store.get(key) ?? {};
            const current = Number(existing[field]) || 0;
            store.set(key, { ...existing, [field]: String(current + delta) });
          }),
        exec: () => {
          ops.forEach((fn) => fn());
          return Promise.resolve([]);
        },
      };
    }),
    hgetall: jest.fn((key: string) => Promise.resolve(store.get(key) ?? {})),
    smembers: jest.fn((key: string) =>
      Promise.resolve(Array.from(reverse.get(key) ?? [])),
    ),
    sscan: jest.fn(
      (key: string, _cursor: string, _countArg: string, _count: number) => {
        const members = Array.from(reverse.get(key) ?? []);
        return Promise.resolve(['0', members]);
      },
    ),
    exists: jest.fn((key: string) => Promise.resolve(store.has(key) ? 1 : 0)),
    del: jest.fn((key: string) => {
      const ok = store.has(key);
      store.delete(key);
      return Promise.resolve(ok ? 1 : 0);
    }),
    _store: store,
    _reverse: reverse,
  };
}

const stubConfig = (overrides: Record<string, string> = {}): ConfigService =>
  ({
    get: (key: string, defaultValue?: string) =>
      overrides[key] ?? defaultValue ?? null,
  }) as unknown as ConfigService;

describe('TokenStoreService', () => {
  let service: TokenStoreService;
  let redis: ReturnType<typeof createRedisMock>;
  let crypto: CryptoService;

  beforeAll(() => {
    const config = {
      getOrThrow: () =>
        'ced15b2ae4e4ea91413c96ccffbf0b974f8a0c038c77a43eac6d0f053217deca',
      get: (key: string, def?: string) => {
        if (key === 'TOKEN_LENGTH') return '90';
        if (key === 'JWT_ACCESS_TTL') return '900s';
        return def ?? null;
      },
    } as unknown as ConfigService;
    crypto = new CryptoService(config);
    crypto.onModuleInit();
  });

  beforeEach(() => {
    redis = createRedisMock();
    service = new TokenStoreService(
      redis as unknown as any,
      crypto,
      stubConfig({ JWT_ACCESS_TTL: '900s' }),
    );
  });

  it('builds a compound key from sha256 hashes', () => {
    const key = service.buildKey('at1', 'rt1', 'dt1');
    expect(key).toMatch(/^sess:[a-f0-9]{64}:[a-f0-9]{64}:[a-f0-9]{64}$/);
    expect(service.buildKey('at1', 'rt1', 'dt1')).toBe(key);
    expect(service.buildKey('at1', 'rt1', 'dt2')).not.toBe(key);
  });

  it('builds a 4-segment key when userToken is provided', () => {
    const key = service.buildKey('at1', 'rt1', 'dt1', 'ut1');
    expect(key).toMatch(
      /^sess:[a-f0-9]{64}:[a-f0-9]{64}:[a-f0-9]{64}:[a-f0-9]{64}$/,
    );
    expect(service.buildKey('at1', 'rt1', 'dt1', 'ut1')).toBe(key);
    expect(service.buildKey('at1', 'rt1', 'dt1', 'ut2')).not.toBe(key);
  });

  it('writes and reads a session entry with v2 schema', async () => {
    const key = service.buildKey('a', 'b', 'c');
    await service.write(key, {
      userId: 'u1',
      email: 'test@example.com',
      role: 'USER',
      tier: 'FREE',
      deviceId: 'd1',
      ip: '127.0.0.1',
      userAgent: 'jest',
      sessionId: 's1',
      name: 'Test User',
      username: 'testuser',
      avatarUrl: '',
      locale: 'en',
      timezone: 'UTC',
      friends: ['f1', 'f2'],
      unread: 3,
      orgIds: ['org1'],
      teamIds: [],
    });
    const read = await service.read(key);
    expect(read).not.toBeNull();
    expect(read!.userId).toBe('u1');
    expect(read!.tier).toBe('FREE');
    expect(read!.v).toBe('2');
    expect(read!.name).toBe('Test User');
    expect(read!.friends).toEqual(['f1', 'f2']);
    expect(read!.unread).toBe(3);
    expect(read!.orgIds).toEqual(['org1']);
    expect(read!.teamIds).toEqual([]);
  });

  it('returns null for a missing key', async () => {
    expect(await service.read('sess:nonexistent')).toBeNull();
  });

  it('revokes a compound key', async () => {
    const key = service.buildKey('a', 'b', 'c');
    await service.write(key, {
      userId: 'u2',
      email: 'u2@test.com',
      role: 'USER',
      tier: 'BASIC',
      sessionId: 's2',
    });
    expect(await service.read(key)).not.toBeNull();
    await service.revoke(key);
    expect(await service.read(key)).toBeNull();
  });

  it('revokes all sessions for a user', async () => {
    const k1 = service.buildKey('a1', 'b1', 'c1');
    const k2 = service.buildKey('a2', 'b2', 'c2');
    await service.write(k1, {
      userId: 'u3',
      email: 'u3@t.com',
      role: 'USER',
      sessionId: 's3',
    });
    await service.write(k2, {
      userId: 'u3',
      email: 'u3@t.com',
      role: 'USER',
      sessionId: 's4',
    });
    expect(await service.read(k1)).not.toBeNull();
    expect(await service.read(k2)).not.toBeNull();
    expect(await service.revokeAllForUser('u3')).toBe(2);
    expect(await service.read(k1)).toBeNull();
    expect(await service.read(k2)).toBeNull();
  });

  it('rewrites fields for all live sessions of a user', async () => {
    const key = service.buildKey('a', 'b', 'c');
    await service.write(key, {
      userId: 'u4',
      email: 'u4@t.com',
      role: 'USER',
      tier: 'FREE',
      sessionId: 's5',
    });

    const count = await service.rewriteFieldsForUser('u4', {
      tier: 'PREMIUM',
      unread: '0',
    });
    expect(count).toBe(1);

    const session = await service.read(key);
    expect(session).not.toBeNull();
    expect(session!.tier).toBe('PREMIUM');
  });

  it('skips expired keys during fields rewrite', async () => {
    const key = service.buildKey('a', 'b', 'c');
    await service.write(key, {
      userId: 'u5',
      email: 'u5@t.com',
      role: 'USER',
      tier: 'FREE',
      sessionId: 's6',
    });
    redis._store.delete(key);
    expect(await service.rewriteFieldsForUser('u5', { tier: 'BASIC' })).toBe(0);
  });

  it('incrUnreadForUser increments unread for all sessions', async () => {
    const k1 = service.buildKey('a', 'b', 'c');
    const k2 = service.buildKey('d', 'e', 'f');
    await service.write(k1, {
      userId: 'u6',
      email: 'u6@t.com',
      role: 'USER',
      sessionId: 's7',
    });
    await service.write(k2, {
      userId: 'u6',
      email: 'u6@t.com',
      role: 'USER',
      sessionId: 's8',
    });

    await service.incrUnreadForUser('u6', 1);
    expect(Number(redis._store.get(k1)!.unread)).toBe(1);
    expect(Number(redis._store.get(k2)!.unread)).toBe(1);

    await service.incrUnreadForUser('u6', 2);
    expect(Number(redis._store.get(k1)!.unread)).toBe(3);
    expect(Number(redis._store.get(k2)!.unread)).toBe(3);
  });

  it('reads v1 keys with defaults for v2 fields', async () => {
    const store = redis._store;
    const key = 'sess:v1key';
    store.set(key, {
      v: '1',
      userId: 'u7',
      email: 'v1@t.com',
      role: 'USER',
      tier: 'FREE',
      deviceId: '',
      ip: '',
      userAgent: '',
      issuedAt: new Date().toISOString(),
      sessionId: 's9',
    });

    const session = await service.read(key);
    expect(session).not.toBeNull();
    expect(session!.v).toBe('1');
    expect(session!.name).toBe('');
    expect(session!.friends).toEqual([]);
    expect(session!.unread).toBe(0);
  });

  it('handles malformed JSON fields gracefully', async () => {
    const store = redis._store;
    const key = 'sess:badjson';
    store.set(key, {
      v: '2',
      userId: 'u8',
      email: 'bad@t.com',
      role: 'USER',
      tier: 'FREE',
      deviceId: '',
      ip: '',
      userAgent: '',
      issuedAt: new Date().toISOString(),
      sessionId: 's10',
      name: '',
      username: '',
      avatarUrl: '',
      locale: 'en',
      timezone: 'UTC',
      friends: 'not-json',
      unread: '5',
      orgIds: '{bad',
      teamIds: '',
    });

    const session = await service.read(key);
    expect(session!.friends).toEqual([]);
    expect(session!.orgIds).toEqual([]);
    expect(session!.unread).toBe(5);
  });
});
