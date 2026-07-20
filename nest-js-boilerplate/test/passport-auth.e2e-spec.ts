/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PassportAuthModule } from '../src/passport-auth/passport-auth.module';

// Proves the Passport recipe end-to-end over real HTTP: local-strategy login issues a JWT, and
// the jwt-strategy guards a protected route. No DB (in-memory users).
describe('Passport auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PassportAuthModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects login with bad credentials (LocalStrategy -> 401)', async () => {
    await request(app.getHttpServer())
      .post('/passport/login')
      .send({ username: 'alice', password: 'wrong' })
      .expect(401);
  });

  it('issues a JWT on a valid login (LocalAuthGuard)', async () => {
    const res = await request(app.getHttpServer())
      .post('/passport/login')
      .send({ username: 'alice', password: 'guess' })
      .expect(201);
    expect(typeof (res.body as { access_token?: unknown }).access_token).toBe(
      'string',
    );
  });

  it('rejects the protected route without a token (JwtAuthGuard -> 401)', async () => {
    await request(app.getHttpServer()).get('/passport/profile').expect(401);
  });

  it('returns the user on the protected route with a valid Bearer token', async () => {
    const login = await request(app.getHttpServer())
      .post('/passport/login')
      .send({ username: 'alice', password: 'guess' })
      .expect(201);
    const token = (login.body as { access_token: string }).access_token;

    const res = await request(app.getHttpServer())
      .get('/passport/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toEqual({ userId: 1, username: 'alice' });
  });
});
