import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import type { ThrottlerStorage } from '@nestjs/throttler';
import { REDIS_CLIENT } from '../redis/redis.tokens';

interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

const THROTTLER_PREFIX = 'throttler';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `${THROTTLER_PREFIX}:${throttlerName}:${key}`;
    const now = Date.now();
    const windowStart = now - ttl;

    const multi = this.redis.multi();

    multi.zremrangebyscore(redisKey, 0, windowStart);
    multi.zadd(redisKey, now, `${now}:${Math.random()}`);
    multi.expire(redisKey, Math.ceil(ttl / 1000));
    multi.zcard(redisKey);

    const results = await multi.exec();
    const totalHits = (results?.[3]?.[1] ?? 0) as number;
    const timeToExpire = await this.redis.pttl(redisKey);

    const isBlocked = totalHits > limit;
    const timeToBlockExpire = isBlocked ? timeToExpire : 0;

    return { totalHits, timeToExpire: timeToExpire > 0 ? timeToExpire : ttl, isBlocked, timeToBlockExpire };
  }
}
