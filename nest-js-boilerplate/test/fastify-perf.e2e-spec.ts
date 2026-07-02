import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { FastifyPerfModule } from '../src/fastify-perf/fastify-perf.module';

// Proves the app runs on the Fastify adapter. Uses Fastify's native app.inject()
// (light-my-request) — its existence/behavior is itself evidence the platform is
// Fastify, not Express.
describe('Performance / Fastify (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [FastifyPerfModule],
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves a JSON route through the Fastify adapter (no x-powered-by)', async () => {
    const res = await app.inject({ method: 'GET', url: '/fastify/hello' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ message: 'fast' });
    expect(res.headers['x-powered-by']).toBeUndefined(); // Express would set this
  });

  it('@Res() uses the Fastify reply API (.header().send())', async () => {
    const res = await app.inject({ method: 'GET', url: '/fastify/engine' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['x-engine']).toBe('fastify');
    expect(res.json()).toEqual({ ok: true });
  });

  it('reads request headers via FastifyRequest', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/fastify/agent',
      headers: { 'user-agent': 'jest' },
    });
    expect(res.json()).toEqual({ ua: 'jest' });
  });

  it('parses a JSON body under Fastify', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/fastify/echo',
      payload: { a: 1 },
    });
    expect(res.json()).toEqual({ echoed: { a: 1 } });
  });

  it('redirects via reply.status(302).redirect(url)', async () => {
    const res = await app.inject({ method: 'GET', url: '/fastify/redirect' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});
