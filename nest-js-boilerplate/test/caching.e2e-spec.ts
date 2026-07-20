/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CachingModule } from '../src/caching/caching.module';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Proves the documented Caching behaviors over real HTTP: programmatic CACHE_MANAGER
// access and CacheInterceptor auto-caching (incl. the millisecond TTL unit).
describe('Caching (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CachingModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('programmatic CACHE_MANAGER', () => {
    it('set then get returns the stored value', async () => {
      await request(app.getHttpServer())
        .post('/cache/items/greeting')
        .send({ value: 'hi' })
        .expect(201);
      const res = await request(app.getHttpServer())
        .get('/cache/items/greeting')
        .expect(200);
      expect(res.body).toEqual({ value: 'hi' });
    });

    it('del removes the key', async () => {
      await request(app.getHttpServer())
        .post('/cache/items/temp')
        .send({ value: 1 })
        .expect(201);
      await request(app.getHttpServer())
        .delete('/cache/items/temp')
        .expect(200);
      const res = await request(app.getHttpServer())
        .get('/cache/items/temp')
        .expect(200);
      expect(res.body).toEqual({ value: null });
    });

    it('TTL on set is milliseconds — the key expires within the window', async () => {
      await request(app.getHttpServer())
        .post('/cache/items/blink')
        .send({ value: 'x', ttlMs: 120 })
        .expect(201);
      const hit = await request(app.getHttpServer())
        .get('/cache/items/blink')
        .expect(200);
      expect(hit.body).toEqual({ value: 'x' });
      await sleep(300);
      const miss = await request(app.getHttpServer())
        .get('/cache/items/blink')
        .expect(200);
      expect(miss.body).toEqual({ value: null }); // expired in ms, not seconds
    });
  });

  describe('CacheInterceptor auto-caching', () => {
    it('caches a GET: the second call is a HIT with the identical body', async () => {
      const first = await request(app.getHttpServer())
        .get('/cache/auto/default')
        .expect(200);
      expect(first.headers['x-cache']).toBe('MISS');
      const second = await request(app.getHttpServer())
        .get('/cache/auto/default')
        .expect(200);
      expect(second.headers['x-cache']).toBe('HIT');
      expect(second.body).toEqual(first.body); // handler skipped → same counter value
    });

    it('@CacheKey ignores the query string (one key for different URLs)', async () => {
      const a = await request(app.getHttpServer())
        .get('/cache/auto/keyed?n=1')
        .expect(200);
      const b = await request(app.getHttpServer())
        .get('/cache/auto/keyed?n=2')
        .expect(200);
      expect(b.headers['x-cache']).toBe('HIT');
      expect(b.body).toEqual(a.body);
    });

    it('@CacheTTL expires the cache in milliseconds', async () => {
      const first = await request(app.getHttpServer())
        .get('/cache/auto/short')
        .expect(200);
      const firstBody = first.body as { value: number };
      const cached = await request(app.getHttpServer())
        .get('/cache/auto/short')
        .expect(200);
      expect(cached.headers['x-cache']).toBe('HIT');
      expect(cached.body).toEqual(first.body);
      await sleep(400); // > 200ms TTL
      const fresh = await request(app.getHttpServer())
        .get('/cache/auto/short')
        .expect(200);
      const freshBody = fresh.body as { value: number };
      expect(fresh.headers['x-cache']).toBe('MISS');
      expect(freshBody.value).toBeGreaterThan(firstBody.value);
    });

    it('only GET is cached — POST runs the handler every time', async () => {
      const first = await request(app.getHttpServer())
        .post('/cache/auto/post')
        .expect(201);
      const firstBody = first.body as { value: number };
      const second = await request(app.getHttpServer())
        .post('/cache/auto/post')
        .expect(201);
      const secondBody = second.body as { value: number };
      expect(first.headers['x-cache']).toBeUndefined(); // non-GET: not cacheable
      expect(secondBody.value).toBeGreaterThan(firstBody.value);
    });
  });
});
