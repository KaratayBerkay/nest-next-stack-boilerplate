import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CacheDemoService } from './cache-demo.service';
import { CounterService } from './counter.service';

interface SetItemBody {
  value: unknown;
  ttlMs?: number;
}

/**
 * Two documented caching modes under `/cache`:
 *  - programmatic store access (`/cache/items/*`) via CacheDemoService, and
 *  - auto-caching of GET routes (`/cache/auto/*`) via `CacheInterceptor`, bound at
 *    controller scope here (the docs also show the global `APP_INTERCEPTOR` form).
 *    The interceptor caches GET only and stamps an `X-Cache: HIT|MISS` header.
 */
@Controller('cache')
export class CacheDemoController {
  constructor(
    private readonly cache: CacheDemoService,
    private readonly counter: CounterService,
  ) {}

  // ---- Programmatic store access (no interceptor) ----
  @Post('items/:key')
  async setItem(
    @Param('key') key: string,
    @Body() body: SetItemBody,
  ): Promise<{ stored: unknown }> {
    await this.cache.set(key, body.value, body.ttlMs);
    return { stored: body.value };
  }

  @Get('items/:key')
  async getItem(@Param('key') key: string): Promise<{ value: unknown }> {
    return { value: (await this.cache.get(key)) ?? null };
  }

  @Delete('items/:key')
  async delItem(@Param('key') key: string): Promise<{ deleted: boolean }> {
    return { deleted: await this.cache.del(key) };
  }

  // ---- Auto-caching via CacheInterceptor (GET-only, HTTP) ----
  // Cached under the request URL with the module's default 30s TTL.
  @UseInterceptors(CacheInterceptor)
  @Get('auto/default')
  autoDefault(): { value: number; servedAt: number } {
    return this.counter.next();
  }

  // @CacheTTL is MILLISECONDS (cache-manager v6+) — 200ms here, NOT 200s.
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(200)
  @Get('auto/short')
  autoShort(): { value: number; servedAt: number } {
    return this.counter.next();
  }

  // @CacheKey pins a fixed key, so different query strings share one cache entry.
  @UseInterceptors(CacheInterceptor)
  @CacheKey('fixed-key')
  @Get('auto/keyed')
  autoKeyed(): { value: number; servedAt: number } {
    return this.counter.next();
  }

  // Non-GET under the same interceptor: never cached (only GET is).
  @UseInterceptors(CacheInterceptor)
  @Post('auto/post')
  autoPost(): { value: number; servedAt: number } {
    return this.counter.next();
  }
}
