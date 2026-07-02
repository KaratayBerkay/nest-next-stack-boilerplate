import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CryptoService } from '../common/crypto/crypto.service';
import { REDIS_CLIENT } from '../redis/redis.module';

export interface SessionUser {
  userId: string;
  email: string;
  role: string;
  tier: string;
  deviceId: string | null;
  ip: string | null;
  userAgent: string | null;
  issuedAt: string;
  sessionId: string;
}

export type SessionUserInput = Omit<SessionUser, 'issuedAt'> & {
  issuedAt?: Date;
};

const SESS_PREFIX = 'sess:';
const USER_SESS_PREFIX = 'user:';

@Injectable()
export class TokenStoreService {
  private readonly ttl: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly crypto: CryptoService,
    private readonly config: ConfigService,
  ) {
    const raw = this.config.get<string>('JWT_ACCESS_TTL', '900s');
    const match = raw.match(/^(\d+)([smhd])$/);
    if (!match) {
      this.ttl = 900;
    } else {
      const num = Number(match[1]);
      const unit = match[2];
      const multipliers: Record<string, number> = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
      };
      this.ttl = num * (multipliers[unit] ?? 1);
    }
  }

  buildKey(
    accessToken: string,
    rbacToken: string,
    deviceToken: string,
  ): string {
    const parts = [accessToken, rbacToken, deviceToken].map((t) =>
      this.crypto.sha256(t),
    );
    return `${SESS_PREFIX}${parts.join(':')}`;
  }

  private reverseIndexKey(userId: string): string {
    return `${USER_SESS_PREFIX}${userId}:sessions`;
  }

  async write(key: string, data: SessionUserInput): Promise<void> {
    const userId = data.userId;
    const pipe = this.redis.multi();
    pipe.hset(key, {
      userId: data.userId,
      email: data.email,
      role: data.role,
      tier: data.tier ?? 'FREE',
      deviceId: data.deviceId ?? '',
      ip: data.ip ?? '',
      userAgent: data.userAgent ?? '',
      issuedAt: (data.issuedAt ?? new Date()).toISOString(),
      sessionId: data.sessionId,
    });
    pipe.expire(key, this.ttl);
    pipe.sadd(this.reverseIndexKey(userId), key);
    await pipe.exec();
  }

  async read(key: string): Promise<SessionUser | null> {
    const data = await this.redis.hgetall(key);
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    return {
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
  }

  async revoke(key: string): Promise<void> {
    const data = await this.redis.hgetall(key);
    if (!data || Object.keys(data).length === 0) return;
    const userId = data.userId;
    const pipe = this.redis.multi();
    pipe.del(key);
    pipe.srem(this.reverseIndexKey(userId), key);
    await pipe.exec();
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

  async rewriteTierForUser(userId: string, tier: string): Promise<number> {
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

      // Check which keys still exist (TTL-expired keys are skipped)
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
          pipe.hset(key, 'tier', tier);
        }
        await pipe.exec();
        updated += alive.length;
      }
    } while (cursor !== '0');

    return updated;
  }
}
