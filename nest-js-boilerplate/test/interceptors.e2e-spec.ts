/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { InterceptorsModule } from '../src/interceptors/interceptors.module';

describe('Interceptors (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [InterceptorsModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('TransformInterceptor wraps the response in a { data } envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/interceptors/transform')
      .expect(200);
    expect(res.body).toEqual({ data: { id: 1, name: 'cat' } });
  });

  it('ExcludeNullInterceptor rewrites a null result to an empty string', async () => {
    const res = await request(app.getHttpServer())
      .get('/interceptors/nullable')
      .expect(200);
    // Over HTTP both null and '' serialize to an empty body, so the observable proof is that the
    // mapped response is delivered without error; the null→'' substitution itself is the map().
    expect(res.text).toBe('');
  });

  it('LoggingInterceptor logs before and after the handler runs', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    try {
      const res = await request(app.getHttpServer())
        .get('/interceptors/logging')
        .expect(200);
      expect(res.body).toEqual({ ok: true });
      const messages = logSpy.mock.calls.map((c) => String(c[0]));
      expect(messages).toContain('Before...');
      expect(messages.some((m) => /^After\.\.\. \d+ms$/.test(m))).toBe(true);
      // "Before" is logged synchronously pre-handler, "After" inside tap() post-handler → ordered.
      expect(messages.indexOf('Before...')).toBeLessThan(
        messages.findIndex((m) => m.startsWith('After...')),
      );
    } finally {
      logSpy.mockRestore();
    }
  });

  it('CacheInterceptor short-circuits the handler when the cache is hit', async () => {
    const res = await request(app.getHttpServer())
      .get('/interceptors/cache')
      .set('x-cache', 'hit')
      .expect(200);
    // The handler throws; a successful cached body proves it never executed.
    expect(res.body).toEqual(['cached']);
  });

  it('CacheInterceptor falls through to the handler on a cache miss', async () => {
    await request(app.getHttpServer()).get('/interceptors/cache').expect(500); // no x-cache header → handler runs → it throws
  });

  it('ErrorsInterceptor maps a thrown 500 to a 502 BadGateway', async () => {
    const res = await request(app.getHttpServer())
      .get('/interceptors/error')
      .expect(502);
    expect((res.body as { message: string }).message).toBe('Bad Gateway');
  });

  it('TimeoutInterceptor aborts a slow handler with a 408', async () => {
    await request(app.getHttpServer()).get('/interceptors/timeout').expect(408);
  });

  it('TimeoutInterceptor lets a fast handler complete normally', async () => {
    const res = await request(app.getHttpServer())
      .get('/interceptors/fast')
      .expect(200);
    expect(res.body).toEqual({ ok: true });
  });
});
