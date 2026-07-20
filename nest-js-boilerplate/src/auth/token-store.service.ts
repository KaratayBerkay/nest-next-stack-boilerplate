import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CryptoService } from '../common/crypto/crypto.service';
import { parseDurationToSeconds } from '../common/utils/parse-duration';
import { REDIS_CLIENT } from '../redis/redis.module';
import type { SessionUser, SessionUserInput } from './auth.types';

const SESS_PREFIX = 'sess:';
const USER_SESS_PREFIX = 'user:';
const REFRESH_INDEX_PREFIX = 'refresh_sess:';
const MFA_CHALLENGE_PREFIX = 'mfa:challenge:';
const MFA_CHALLENGE_TTL = 300; // 5 minutes

function parseJsonField(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

@Injectable()
export class TokenStoreService {
  private readonly ttl: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly crypto: CryptoService,
    private readonly config: ConfigService,
  ) {
    const raw = this.config.get<string>('SESSION_TTL', '900s');
    this.ttl = parseDurationToSeconds(raw);
  }

  buildKey(
    accessToken: string,
    rbacToken: string,
    deviceToken: string,
    userToken?: string,
  ): string {
    const tokens = userToken
      ? [accessToken, rbacToken, deviceToken, userToken]
      : [accessToken, rbacToken, deviceToken];
    const parts = tokens.map((t) => this.crypto.sha256(t));
    return `${SESS_PREFIX}${parts.join(':')}`;
  }

  private reverseIndexKey(userId: string): string {
    return `${USER_SESS_PREFIX}${userId}:sessions`;
  }

  async write(key: string, data: SessionUserInput): Promise<void> {
    const userId = data.userId;
    const pipe = this.redis.multi();
    pipe.hset(key, {
      v: '2',
      userId: data.userId,
      email: data.email,
      role: data.role,
      tier: data.tier ?? 'FREE',
      deviceId: data.deviceId ?? '',
      ip: data.ip ?? '',
      userAgent: data.userAgent ?? '',
      issuedAt: (data.issuedAt ?? new Date()).toISOString(),
      sessionId: data.sessionId,
      name: data.name ?? '',
      username: data.username ?? '',
      avatarUrl: data.avatarUrl ?? '',
      locale: data.locale ?? 'en',
      timezone: data.timezone ?? 'UTC',
      friends: JSON.stringify(data.friends ?? []),
      unread: String(data.unread ?? 0),
      orgIds: JSON.stringify(data.orgIds ?? []),
      teamIds: JSON.stringify(data.teamIds ?? []),
    });
    pipe.expire(key, this.ttl);
    pipe.sadd(this.reverseIndexKey(userId), key);
    if (data.sessionId) {
      const refreshKey = `${REFRESH_INDEX_PREFIX}${data.sessionId}`;
      pipe.set(refreshKey, key, 'EX', this.ttl);
    }
    await pipe.exec();
  }

  async read(key: string): Promise<SessionUser | null> {
    const data = await this.redis.hgetall(key);
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    const v = data.v ?? '1';
    const common = {
      userId: data.userId,
      email: data.email,
      role: data.role,
      tier: data.tier ?? 'FREE',
      deviceId: data.deviceId || null,
      ip: data.ip || null,
      userAgent: data.userAgent || null,
      issuedAt: data.issuedAt,
      sessionId: data.sessionId,
    };

    if (v === '2') {
      return {
        ...common,
        v,
        name: data.name ?? '',
        username: data.username ?? '',
        avatarUrl: data.avatarUrl ?? '',
        locale: data.locale ?? 'en',
        timezone: data.timezone ?? 'UTC',
        friends: parseJsonField(data.friends),
        unread: Number(data.unread) || 0,
        orgIds: parseJsonField(data.orgIds),
        teamIds: parseJsonField(data.teamIds),
      };
    }

    // v1 backward compat
    return {
      ...common,
      v: '1',
      name: '',
      username: '',
      avatarUrl: '',
      locale: 'en',
      timezone: 'UTC',
      friends: [],
      unread: 0,
      orgIds: [],
      teamIds: [],
    };
  }

  /** Narrow HSET onto a single known compound key. */
  async updateFields(
    key: string,
    fields: Record<string, string>,
  ): Promise<void> {
    await this.redis.hset(key, fields);
  }

  /** Extend TTL on the session key (sliding expiration — called on each authenticated request). */
  async extendTTL(key: string): Promise<void> {
    await this.redis.expire(key, this.ttl);
  }

  async revoke(key: string): Promise<void> {
    const data = await this.redis.hgetall(key);
    if (!data || Object.keys(data).length === 0) return;
    const userId = data.userId;
    const pipe = this.redis.multi();
    pipe.del(key);
    pipe.srem(this.reverseIndexKey(userId), key);
    if (data.sessionId) {
      pipe.del(`${REFRESH_INDEX_PREFIX}${data.sessionId}`);
    }
    await pipe.exec();
  }

  async findByRefreshSessionId(sessionId: string): Promise<SessionUser | null> {
    const refreshKey = `${REFRESH_INDEX_PREFIX}${sessionId}`;
    const key = await this.redis.get(refreshKey);
    if (!key) return null;
    return this.read(key);
  }

  async listSessionsForUser(userId: string): Promise<SessionUser[]> {
    const reverseKey = this.reverseIndexKey(userId);
    const keys = await this.redis.smembers(reverseKey);
    if (keys.length === 0) return [];
    const results = await Promise.all(keys.map((k) => this.read(k)));
    return results.filter((s): s is SessionUser => s !== null);
  }

  async listSessionsWithKeys(
    userId: string,
  ): Promise<{ session: SessionUser; key: string }[]> {
    const reverseKey = this.reverseIndexKey(userId);
    const keys = await this.redis.smembers(reverseKey);
    if (keys.length === 0) return [];
    const results = await Promise.all(
      keys.map((k) => this.read(k).then((session) => ({ session, key: k }))),
    );
    return results.filter(
      (r): r is { session: SessionUser; key: string } => r.session !== null,
    );
  }

  async revokeSessionBySessionId(
    userId: string,
    sessionId: string,
  ): Promise<boolean> {
    const reverseKey = this.reverseIndexKey(userId);
    const keys = await this.redis.smembers(reverseKey);
    for (const key of keys) {
      const session = await this.read(key);
      if (session?.sessionId === sessionId) {
        await this.revoke(key);
        return true;
      }
    }
    return false;
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const reverseKey = this.reverseIndexKey(userId);
    const keys = await this.redis.smembers(reverseKey);
    if (keys.length === 0) return 0;
    const pipe = this.redis.multi();
    for (const key of keys) {
      pipe.del(key);
    }
    pipe.del(reverseKey);
    await pipe.exec();
    return keys.length;
  }

  async rewriteFieldsForUser(
    userId: string,
    fields: Record<string, string>,
  ): Promise<number> {
    const reverseKey = this.reverseIndexKey(userId);
    let cursor = '0';
    let updated = 0;

    do {
      const [nextCursor, members] = await this.redis.sscan(
        reverseKey,
        cursor,
        'COUNT',
        50,
      );
      cursor = nextCursor;

      const alive: string[] = [];
      const existsResults = await Promise.all(
        members.map((k) => this.redis.exists(k)),
      );
      for (let i = 0; i < members.length; i++) {
        if (existsResults[i]) {
          alive.push(members[i]);
        }
      }

      if (alive.length > 0) {
        const pipe = this.redis.multi();
        for (const key of alive) {
          pipe.hset(key, fields);
        }
        await pipe.exec();
        updated += alive.length;
      }
    } while (cursor !== '0');

    return updated;
  }

  async incrUnreadForUser(userId: string, delta: number): Promise<void> {
    const reverseKey = this.reverseIndexKey(userId);
    const keys = await this.redis.smembers(reverseKey);
    if (keys.length === 0) return;
    const pipe = this.redis.multi();
    for (const key of keys) {
      pipe.hincrby(key, 'unread', delta);
    }
    await pipe.exec();
  }

  /** Store a short-lived MFA challenge keyed by the hashed mfaToken. */
  async writeMfaChallenge(
    tokenHash: string,
    data: { userId: string; email: string; role: string; tier: string },
  ): Promise<void> {
    const key = `${MFA_CHALLENGE_PREFIX}${tokenHash}`;
    await this.redis.set(key, JSON.stringify(data), 'EX', MFA_CHALLENGE_TTL);
  }

  /** Read and consume (delete) an MFA challenge. Returns null if expired or missing. */
  async consumeMfaChallenge(tokenHash: string): Promise<{
    userId: string;
    email: string;
    role: string;
    tier: string;
  } | null> {
    const key = `${MFA_CHALLENGE_PREFIX}${tokenHash}`;
    const raw = await this.redis.getdel(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        userId: string;
        email: string;
        role: string;
        tier: string;
      };
    } catch {
      return null;
    }
  }
}
