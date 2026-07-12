import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.tokens';

const DEFAULT_TTL = 60; // seconds

@Injectable()
export class CacheAsideService {
  private readonly logger = new Logger(CacheAsideService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
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

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
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
