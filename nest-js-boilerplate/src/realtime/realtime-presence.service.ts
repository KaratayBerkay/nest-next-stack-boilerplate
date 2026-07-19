import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import type { AuthWs } from './realtime.types';

@Injectable()
export class RealtimePresenceService {
  private static readonly PRESENCE_TTL = 120;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private presenceKey(userId: string): string {
    return `presence:${userId}`;
  }

  async syncPresenceToRedis(ws: AuthWs): Promise<void> {
    if (!ws.userId || !ws.deviceTokenHash || !ws.page) return;
    const field = ws.deviceTokenHash;
    const value = JSON.stringify({
      page: ws.page,
      params: ws.pageParams ?? {},
      at: Date.now(),
    });
    try {
      const key = this.presenceKey(ws.userId);
      const pipe = this.redis.pipeline();
      pipe.hset(key, field, value);
      pipe.expire(key, RealtimePresenceService.PRESENCE_TTL);
      await pipe.exec();
    } catch {
      /* non-critical */
    }
  }

  async removePresenceFromRedis(ws: AuthWs): Promise<void> {
    if (!ws.userId || !ws.deviceTokenHash) return;
    try {
      await this.redis.hdel(this.presenceKey(ws.userId), ws.deviceTokenHash);
    } catch {
      /* non-critical */
    }
  }

  async refreshPresenceTTL(
    pageClaims: Map<string, Set<AuthWs>>,
  ): Promise<void> {
    const now = Date.now();
    for (const [, sockets] of pageClaims) {
      for (const ws of sockets) {
        if (ws.readyState !== 1 || !ws.userId || !ws.deviceTokenHash) continue;
        try {
          const key = this.presenceKey(ws.userId);
          const field = ws.deviceTokenHash;
          const value = JSON.stringify({
            page: ws.page,
            params: ws.pageParams ?? {},
            at: now,
          });
          const pipe = this.redis.pipeline();
          pipe.hset(key, field, value);
          pipe.expire(key, RealtimePresenceService.PRESENCE_TTL);
          await pipe.exec();
        } catch {
          /* non-critical */
        }
      }
    }
  }
}
