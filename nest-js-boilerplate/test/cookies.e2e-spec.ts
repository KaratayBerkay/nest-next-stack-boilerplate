/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CookiesModule } from '../src/cookies/cookies.module';

const COOKIE_SECRET = 'test-cookie-secret';

describe('Cookies (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CookiesModule],
    }).compile();
    app = moduleRef.createNestApplication();
    // Mirrors the global cookie-parser registered in main.ts.
    app.use(cookieParser(COOKIE_SECRET));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('sets both a plain and a signed cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/cookies/set')
      .expect(201);
    const setCookie = (res.headers['set-cookie'] ?? []) as unknown as string[];
    expect(setCookie.some((c) => c.startsWith('plain='))).toBe(true);
    expect(setCookie.some((c) => c.startsWith('signed='))).toBe(true);
  });

  it('reads unsigned cookies and verifies signed ones', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/cookies/set').expect(201);
    const res = await agent.get('/cookies/read').expect(200);
    const body = res.body as {
      cookies: Record<string, unknown>;
      signedCookies: Record<string, unknown>;
    };
    expect(body.cookies.plain).toBe('plain-value');
    expect(body.signedCookies.signed).toBe('signed-value');
  });
});
