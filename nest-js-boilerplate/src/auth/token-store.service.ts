import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CryptoService } from '../common/crypto/crypto.service';
import { parseDurationToSeconds } from '../common/utils/parse-duration';
import { REDIS_CLIENT } from '../redis/redis.module';
import { WireCryptoService } from '../wire-crypto/wire-crypto.service';
import type { SessionUser, SessionUserInput } from './auth.types';

const SESS_PREFIX = 'sess:';
const USER_SESS_PREFIX = 'user:';
const REFRESH_INDEX_PREFIX = 'refresh_sess:';
const MFA_CHALLENGE_PREFIX = 'mfa:challenge:';
const MFA_CHALLENGE_TTL = 300; // 5 minutes
const EMAIL_OTP_PREFIX = 'email_otp:';
const EMAIL_OTP_TTL = 600; // 10 minutes

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
    @Optional()
    @Inject(WireCryptoService)
    private readonly wireCrypto?: WireCryptoService,
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
      chatNickname: data.chatNickname ?? '',
      useNickname: data.useNickname ? '1' : '0',
      hideAvatar: data.hideAvatar ? '1' : '0',
      friends: JSON.stringify(data.friends ?? []),
      unread: String(data.unread ?? 0),
      orgIds: JSON.stringify(data.orgIds ?? []),
      teamIds: JSON.stringify(data.teamIds ?? []),
    });
    pipe.expire(key, this.ttl);
    pipe.sadd(this.reverseIndexKey(userId), key);
    // Bound the reverse-index set's growth — without an expiry, revoked
    // members' keys accumulate forever (dead members are filtered at read
    // time, but the set never shrinks).
    pipe.expire(this.reverseIndexKey(userId), this.ttl);
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
        chatNickname: data.chatNickname ?? '',
        useNickname: data.useNickname === '1',
        hideAvatar: data.hideAvatar === '1',
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
      chatNickname: '',
      useNickname: false,
      hideAvatar: false,
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
    const [sessionId, userId, deviceId] = await this.redis.hmget(
      key,
      'sessionId',
      'userId',
      'deviceId',
    );
    const pipe = this.redis.multi();
    pipe.expire(key, this.ttl);
    if (sessionId) {
      // Slide the refresh reverse-index TTL together with the session hash —
      // otherwise a continuously active session's refresh capability silently
      // dies SESSION_TTL after login even though the session itself stays alive.
      pipe.expire(`${REFRESH_INDEX_PREFIX}${sessionId}`, this.ttl);
    }
    await pipe.exec();

    // Mirror the TTL slide onto E2EE key material for this device too —
    // still on its own longer-lived TTL (E2eeKeysService), this just keeps
    // Slide the per-session wire-crypto key TTL in lockstep (same SESSION_TTL).
    if (sessionId) {
      await this.wireCrypto?.touchTTL(sessionId);
    }
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
    // Drop the per-session wire-crypto keypair with the session itself.
    if (data.sessionId) {
      await this.wireCrypto?.deleteForSession(data.sessionId);
    }
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
        // Wire-crypto cleanup happens inside revoke() (sessionId-scoped).
        return true;
      }
    }
    return false;
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const reverseKey = this.reverseIndexKey(userId);
    const sessions = await this.listSessionsWithKeys(userId);
    const pipe = this.redis.multi();
    for (const { key, session } of sessions) {
      pipe.del(key);
      if (session.sessionId) {
        pipe.del(`${REFRESH_INDEX_PREFIX}${session.sessionId}`);
      }
    }
    pipe.del(reverseKey);
    await pipe.exec();
    // Drop per-session wire-crypto keypairs together with their sessions.
    for (const { session } of sessions) {
      if (session.sessionId) {
        await this.wireCrypto?.deleteForSession(session.sessionId);
      }
    }
    return sessions.length;
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
    data: {
      userId: string;
      email: string;
      role: string;
      tier: string;
      mfaMethod?: 'TOTP' | 'EMAIL';
    },
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
    mfaMethod?: 'TOTP' | 'EMAIL';
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
        mfaMethod?: 'TOTP' | 'EMAIL';
      };
    } catch {
      return null;
    }
  }

  /**
   * Read an MFA challenge without consuming it, so a wrong code doesn't burn
   * the client's only attempt. Returns null if expired or missing.
   */
  async peekMfaChallenge(tokenHash: string): Promise<{
    userId: string;
    email: string;
    role: string;
    tier: string;
    mfaMethod?: 'TOTP' | 'EMAIL';
  } | null> {
    const key = `${MFA_CHALLENGE_PREFIX}${tokenHash}`;
    const raw = await this.redis.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        userId: string;
        email: string;
        role: string;
        tier: string;
        mfaMethod?: 'TOTP' | 'EMAIL';
      };
    } catch {
      return null;
    }
  }

  /** Delete an MFA challenge — call once it has actually been used successfully. */
  async deleteMfaChallenge(tokenHash: string): Promise<void> {
    const key = `${MFA_CHALLENGE_PREFIX}${tokenHash}`;
    await this.redis.del(key);
  }

  /** Store a 6-digit email OTP hash with purpose-scoped key. */
  async writeEmailOtp(
    purpose: 'REGISTRATION' | 'LOGIN',
    subjectId: string,
    codeHash: string,
    email: string,
  ): Promise<void> {
    const key = `${EMAIL_OTP_PREFIX}${purpose}:${subjectId}`;
    await this.redis.set(
      key,
      JSON.stringify({ codeHash, email, attempts: 0 }),
      'EX',
      EMAIL_OTP_TTL,
    );
  }

  /** Read and consume (delete) an email OTP. Returns null if expired or missing. */
  async consumeEmailOtp(
    purpose: 'REGISTRATION' | 'LOGIN',
    subjectId: string,
  ): Promise<{ codeHash: string; email: string; attempts: number } | null> {
    const key = `${EMAIL_OTP_PREFIX}${purpose}:${subjectId}`;
    const raw = await this.redis.getdel(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        codeHash: string;
        email: string;
        attempts: number;
      };
    } catch {
      return null;
    }
  }

  /** Peek at an email OTP without consuming it (for rate-limit check). */
  async peekEmailOtp(
    purpose: 'REGISTRATION' | 'LOGIN',
    subjectId: string,
  ): Promise<{ codeHash: string; email: string; attempts: number } | null> {
    const key = `${EMAIL_OTP_PREFIX}${purpose}:${subjectId}`;
    const raw = await this.redis.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        codeHash: string;
        email: string;
        attempts: number;
      };
    } catch {
      return null;
    }
  }

  /** Increment the attempt counter on an existing email OTP. */
  async incrementOtpAttempts(
    purpose: 'REGISTRATION' | 'LOGIN',
    subjectId: string,
  ): Promise<void> {
    const key = `${EMAIL_OTP_PREFIX}${purpose}:${subjectId}`;
    const raw = await this.redis.get(key);
    if (!raw) return;
    const data = JSON.parse(raw) as {
      codeHash: string;
      email: string;
      attempts: number;
    };
    data.attempts += 1;
    await this.redis.set(key, JSON.stringify(data), 'EX', EMAIL_OTP_TTL, 'XX');
  }

  /** Invalidate an email OTP (used after max attempts reached). */
  async deleteEmailOtp(
    purpose: 'REGISTRATION' | 'LOGIN',
    subjectId: string,
  ): Promise<void> {
    const key = `${EMAIL_OTP_PREFIX}${purpose}:${subjectId}`;
    await this.redis.del(key);
  }

  /** Get the remaining resend cooldown in seconds (0 if no cooldown active). */
  async getOtpResendCooldown(cooldownKey: string): Promise<number> {
    const remaining = await this.redis.ttl(cooldownKey);
    return remaining > 0 ? remaining : 0;
  }

  /** Set a resend cooldown marker key. */
  async setOtpResendCooldown(
    cooldownKey: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redis.set(cooldownKey, '1', 'EX', ttlSeconds);
  }
}
