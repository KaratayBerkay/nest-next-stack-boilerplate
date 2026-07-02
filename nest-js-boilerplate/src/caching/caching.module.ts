import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheDemoController } from './cache-demo.controller';
import { CacheDemoService } from './cache-demo.service';
import { CounterService } from './counter.service';

/**
 * Techniques › Caching (#27). Wraps `@nestjs/cache-manager` over cache-manager v7
 * (Keyv-backed in-memory store). Proves both documented modes — programmatic
 * `CACHE_MANAGER` access and the `CacheInterceptor` auto-cache.
 *
 * `ttl` is the store default, in MILLISECONDS (cache-manager v6+). Kept long so the
 * default-cached route stays warm across a test; per-route `@CacheTTL` overrides it.
 *
 * For a Redis-backed/global store, `CacheModule.register({ isGlobal: true, stores: [
 * new KeyvRedis('redis://…')] })` (see docs) — Redis itself is already proven in
 * #31 (BullMQ), so this module keeps the deterministic in-memory store.
 *
 * Standalone (demo controller with a request counter) — not wired into AppModule.
 */
@Module({
  imports: [CacheModule.register({ ttl: 30_000 })],
  controllers: [CacheDemoController],
  providers: [CacheDemoService, CounterService],
})
export class CachingModule {}
