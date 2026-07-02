import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisHealthIndicator } from './redis-health.indicator';
import { REDIS_CLIENT } from './redis.tokens';

export { REDIS_CLIENT } from './redis.tokens';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = Number(config.get('REDIS_PORT') ?? 6379);
        return new Redis({ host, port, lazyConnect: true });
      },
    },
    RedisHealthIndicator,
  ],
  exports: [REDIS_CLIENT, RedisHealthIndicator],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    await this.client.quit();
  }
}
