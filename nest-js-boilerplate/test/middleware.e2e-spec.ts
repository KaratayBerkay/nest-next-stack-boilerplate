/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { MiddlewareModule } from '../src/middleware/middleware.module';

// Proves the MiddlewareConsumer bindings actually run (compiling decorators isn't enough).
// Each middleware stamps a header; the headers present on each route reveal which ran.
describe('Middleware (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MiddlewareModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs class middleware for a controller-bound route', async () => {
    const res = await request(app.getHttpServer()).get('/mw/all').expect(200);
    expect(res.headers['x-class-mw']).toBe('hit');
    expect(res.headers['x-fn-mw']).toBeUndefined();
  });

  it('runs both class and path/method-scoped functional middleware', async () => {
    const res = await request(app.getHttpServer()).get('/mw/fn').expect(200);
    expect(res.headers['x-class-mw']).toBe('hit');
    expect(res.headers['x-fn-mw']).toBe('hit');
  });

  it('honours exclude() — the excluded route gets no class middleware', async () => {
    const res = await request(app.getHttpServer()).get('/mw/skip').expect(200);
    expect(res.headers['x-class-mw']).toBeUndefined();
  });

  it('matches an Express 5 named wildcard route (mw/wild/*splat)', async () => {
    const res = await request(app.getHttpServer())
      .get('/mw/wild/item')
      .expect(200);
    expect(res.headers['x-wild-mw']).toBe('hit');
    // The controller-wide class middleware still applies here too.
    expect(res.headers['x-class-mw']).toBe('hit');
  });
});
