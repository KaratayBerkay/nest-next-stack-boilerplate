import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

/**
 * Programmatic cache access exactly as documented: inject `CACHE_MANAGER` as a
 * `Cache` and use get/set/del/clear. The TTL passed to `set` is in MILLISECONDS
 * (cache-manager v6+/Keyv) — there is no seconds form.
 *
 * `Cache` is `import type` because it appears in a decorated constructor
 * parameter (TS1272 under isolatedModules + emitDecoratorMetadata); DI resolves
 * via the explicit `@Inject(CACHE_MANAGER)` token, not the reflected type.
 */
@Injectable()
export class CacheDemoService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttlMs?: number): Promise<T> {
    return this.cache.set<T>(key, value, ttlMs);
  }

  del(key: string): Promise<boolean> {
    return this.cache.del(key);
  }

  clear(): Promise<boolean> {
    return this.cache.clear();
  }
}
