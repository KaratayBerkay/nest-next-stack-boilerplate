import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.tokens';

const DEFAULT_TTL = 60; // seconds

// Matches JSON.stringify's Date output (Date.prototype.toJSON -> toISOString).
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

@Injectable()
export class CacheAsideService {
  private readonly logger = new Logger(CacheAsideService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (!raw) return null;
      // Revive ISO date strings back into Date instances: JSON.stringify
      // collapses Date -> string on write, but our GraphQL DateTime scalar's
      // serialize() is `value instanceof Date ? ... : null`, so a cache hit
      // that still holds plain strings crashes every Date field as non-null
      // violations. Without this, cached objects diverge in type from a
      // fresh Prisma read even though the data is identical.
      return JSON.parse(raw, (_key: string, value: unknown) =>
        typeof value === 'string' && ISO_DATE_RE.test(value)
          ? new Date(value)
          : value,
      ) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (err) {
      this.logger.warn(
        `Cache write failed for ${key}: ${(err as Error).message}`,
      );
    }
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const result = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');
    return keys;
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.warn(
        `Cache delete failed for ${key}: ${(err as Error).message}`,
      );
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.scanKeys(pattern);
      if (keys.length > 0) await this.redis.del(...keys);
    } catch (err) {
      this.logger.warn(
        `Cache invalidation failed for ${pattern}: ${(err as Error).message}`,
      );
    }
  }

  async getOrFetch<T>(
    key: string,
    fetch: () => Promise<T>,
    ttl = DEFAULT_TTL,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fetch();
    await this.set(key, value, ttl);
    return value;
  }
}
