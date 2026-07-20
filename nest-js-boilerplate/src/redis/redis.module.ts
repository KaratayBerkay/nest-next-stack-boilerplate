import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheAsideService } from '../caching/cache-aside.service';
import { RedisHealthIndicator } from './redis-health.indicator';
import { REDIS_CLIENT, REDIS_SUBSCRIBER } from './redis.tokens';

export { REDIS_CLIENT, REDIS_SUBSCRIBER } from './redis.tokens';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = Number(config.get('REDIS_PORT') ?? 6379);
        const password = config.get<string>('REDIS_PASSWORD') || undefined;
        const tls = config.get<string>('REDIS_TLS') === 'true' ? {} : undefined;
        return new Redis({ host, port, password, tls, lazyConnect: true });
      },
    },
    {
      provide: REDIS_SUBSCRIBER,
      inject: [ConfigService, REDIS_CLIENT],
      useFactory: (config: ConfigService, _client: Redis) => {
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = Number(config.get('REDIS_PORT') ?? 6379);
        const password = config.get<string>('REDIS_PASSWORD') || undefined;
        const tls = config.get<string>('REDIS_TLS') === 'true' ? {} : undefined;
        const sub = new Redis({ host, port, password, tls, lazyConnect: true });
        return sub;
      },
    },
    RedisHealthIndicator,
    CacheAsideService,
  ],
  exports: [
    REDIS_CLIENT,
    REDIS_SUBSCRIBER,
    RedisHealthIndicator,
    CacheAsideService,
  ],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(
    @Inject(REDIS_CLIENT) private readonly client: Redis,
    @Inject(REDIS_SUBSCRIBER) private readonly subscriber: Redis,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await Promise.all([this.client.quit(), this.subscriber.quit()]);
  }
}
