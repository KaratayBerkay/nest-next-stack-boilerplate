/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ControllersModule } from '../src/controllers/controllers.module';

// Proves the documented controller behaviors over real HTTP (no DB, no global pipe — routing
// only). Each test maps to one capability from the Controllers docs page.
describe('Controllers (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ControllersModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST / binds @Body to the DTO and defaults to 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/cats')
      .send({ name: 'Felix', age: 3, breed: 'Tabby' })
      .expect(201);
    expect(res.body).toEqual({
      created: { name: 'Felix', age: 3, breed: 'Tabby' },
    });
  });

  it('GET / reads @Query and returns prior state', async () => {
    const res = await request(app.getHttpServer())
      .get('/cats?limit=5')
      .expect(200);
    const body = res.body as { limit: number; cats: unknown[] };
    expect(body.limit).toBe(5);
    expect(Array.isArray(body.cats)).toBe(true);
    expect(body.cats.length).toBeGreaterThanOrEqual(1); // the cat created above
  });

  it('GET /:id binds the route @Param', async () => {
    const res = await request(app.getHttpServer()).get('/cats/42').expect(200);
    expect(res.body).toEqual({ id: '42' });
  });

  it('PUT /:id binds @Param + @Body', async () => {
    const res = await request(app.getHttpServer())
      .put('/cats/7')
      .send({ name: 'Renamed' })
      .expect(200);
    expect(res.body).toEqual({ id: '7', update: { name: 'Renamed' } });
  });

  it('DELETE /:id binds @Param', async () => {
    const res = await request(app.getHttpServer())
      .delete('/cats/9')
      .expect(200);
    expect(res.body).toEqual({ removed: '9' });
  });

  it('@HttpCode(204) overrides the default status', async () => {
    await request(app.getHttpServer()).post('/cats/no-content').expect(204);
  });

  it('@Header sets a custom response header', async () => {
    const res = await request(app.getHttpServer())
      .get('/cats/cached')
      .expect(200);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('@Headers and @Ip read request metadata', async () => {
    const res = await request(app.getHttpServer())
      .get('/cats/inspect')
      .set('x-custom', 'hello')
      .expect(200);
    const body = res.body as { custom: string; ip: string };
    expect(body.custom).toBe('hello');
    expect(typeof body.ip).toBe('string');
    expect(body.ip.length).toBeGreaterThan(0);
  });

  it('@Redirect issues a static 302', async () => {
    const res = await request(app.getHttpServer())
      .get('/cats/docs')
      .expect(302);
    expect(res.headers.location).toBe('https://docs.nestjs.com');
  });

  it('@Redirect supports a dynamic target via the return value', async () => {
    const res = await request(app.getHttpServer())
      .get('/cats/docs?version=5')
      .expect(302);
    expect(res.headers.location).toBe('https://docs.nestjs.com/v5/');
  });

  it('matches an Express 5 named wildcard route and captures the segments', async () => {
    const res = await request(app.getHttpServer())
      .get('/cats/files/a/b/c')
      .expect(200);
    expect(res.body).toEqual({ path: ['a', 'b', 'c'] });
  });
});
