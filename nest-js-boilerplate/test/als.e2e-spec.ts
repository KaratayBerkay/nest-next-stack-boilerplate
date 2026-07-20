/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AlsModule } from '../src/als/als.module';

// Proves the Async Local Storage recipe (#118) end-to-end over HTTP. The handler and service take
// NO userId parameter: identity travels from the `x-user-id` header → ALS middleware (`als.run`) →
// the store, and CatsService reads it back with `als.getStore()`. The decisive test is the
// concurrent one: the service awaits a randomized delay before reading the store, so many requests
// interleave on the event loop — yet each still reads its own userId. That isolation across async
// contexts is the entire reason AsyncLocalStorage exists.
describe('Async Local Storage / Cats (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AlsModule],
    }).compile();
    app = moduleRef.createNestApplication();
    // Listen on an ephemeral port so the 50 concurrent requests below all reuse one already-bound
    // socket; otherwise supertest tries to bind per-call and the parallel binds race (ECONNRESET).
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  });

  it('reads userId from the ALS store (set by middleware from x-user-id), not a parameter', async () => {
    const res = await request(app.getHttpServer())
      .get('/als/cats')
      .set('x-user-id', '42')
      .expect(200);
    expect(res.body).toEqual({ userId: '42', name: 'Garfield' });
  });

  it('a different header yields a different store and a different cat', async () => {
    const res = await request(app.getHttpServer())
      .get('/als/cats')
      .set('x-user-id', '7')
      .expect(200);
    expect(res.body).toEqual({ userId: '7', name: 'Felix' });
  });

  it('falls back to the default store value when the header is absent', async () => {
    const res = await request(app.getHttpServer()).get('/als/cats').expect(200);
    expect(res.body).toEqual({ userId: 'anonymous', name: 'Stray' });
  });

  it('keeps each request store isolated under heavy concurrent interleaving', async () => {
    const userIds = Array.from({ length: 50 }, (_, i) => String(i));
    const responses = await Promise.all(
      userIds.map((userId) =>
        request(app.getHttpServer()).get('/als/cats').set('x-user-id', userId),
      ),
    );

    // Every response must carry back exactly the userId its own request sent — never a neighbour's.
    responses.forEach((res, i) => {
      expect(res.status).toBe(200);
      expect((res.body as { userId: string }).userId).toBe(userIds[i]);
    });
  });
});
