import { getQueueToken } from '@nestjs/bullmq';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { TokenStoreService } from './../src/auth/token-store.service';

// Proves TODO workstream 3 (secure-by-env SSR cookies) end-to-end: login delivers the refresh
// token as an httpOnly cookie (NOT Secure in dev), `refresh` rotates the session using ONLY the
// cookies (no body), and `logout` clears the cookie + revokes the session. A supertest agent acts
// as the browser — it carries the httpOnly device + refresh cookies automatically. Requires
// Postgres + Redis (docker compose up -d).
interface GqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

describe('Secure-by-env cookies (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let tokenStore: TokenStoreService;
  let agent: ReturnType<typeof request.agent>;

  const email = 'cookie.user@example.com';
  const password = 'sup3rSecret!';
  let userId: string;
  let csrfToken: string;

  const REGISTER = `mutation { register(input: { email: "${email}", password: "${password}" }) { accessToken refreshToken } }`;
  const REFRESH = `mutation { refresh { accessToken refreshToken } }`;
  const LOGOUT = `mutation { logout }`;

  const refreshCookieOf = (res: request.Response): string | undefined => {
    const raw = (res.headers['set-cookie'] ?? []) as unknown as string[];
    return raw.find((c) => c.startsWith('refresh_token='));
  };

  const clearDb = async () => {
    await prisma.device.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.emailMessage.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.outboxEvent.deleteMany();
    await prisma.user.deleteMany();
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Mirror main.ts: cookie-parser must run so req.cookies is populated.
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    tokenStore = app.get(TokenStoreService);
    for (const name of ['outbox', 'mail']) {
      await app.get<Queue>(getQueueToken(name)).obliterate({ force: true });
    }
    await clearDb();
    // The agent's cookie jar persists the httpOnly device + refresh cookies across requests,
    // exactly like a browser/SSR client would.
    agent = request.agent(app.getHttpServer());
  }, 30_000);

  afterAll(async () => {
    await clearDb();
    await app.close();
  });

  it('delivers the refresh token as an httpOnly, NON-Secure cookie on register (dev)', async () => {
    const res = await agent
      .post('/graphql')
      .send({ query: REGISTER })
      .expect(200);
    const body = res.body as GqlResponse<{
      register: { refreshToken: string };
    }>;
    expect(body.errors).toBeUndefined();
    expect(body.data!.register.refreshToken).toBeTruthy(); // still in body for API clients

    const cookie = refreshCookieOf(res);
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).not.toMatch(/Secure/i); // dev over http
    expect(cookie).toMatch(/Path=\//i);

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    userId = user.id;
    const sessions = await tokenStore.listSessionsForUser(userId);
    expect(sessions).toHaveLength(1);
    expect(cookie).toContain(`refresh_token=${sessions[0].sessionId}`);
  });

  it('rejects refresh with no CSRF token (cookie-driven mutation is CSRF-guarded)', async () => {
    const res = await agent
      .post('/graphql')
      .send({ query: REFRESH }) // valid refresh cookie, but no x-csrf-token
      .expect(200);
    const body = res.body as GqlResponse<unknown>;
    expect(body.errors).toBeDefined();
    expect(JSON.stringify(body.errors)).toMatch(/csrf/i);

    const sessions = await tokenStore.listSessionsForUser(userId);
    expect(sessions).toHaveLength(1);
  });

  it('rotates the session and re-sets the cookie using ONLY the cookies + CSRF token', async () => {
    // Browser/SSR flow: GET the CSRF token (sets the csrf cookie), echo it on writes.
    const tokenRes = await agent.get('/csrf/token').expect(200);
    csrfToken = (tokenRes.body as { token: string }).token;
    expect(csrfToken).toBeTruthy();

    const before = await tokenStore.listSessionsForUser(userId);
    expect(before).toHaveLength(1);
    const beforeSessionId = before[0].sessionId;

    // The agent sends the httpOnly device_token + refresh_token + csrf cookies automatically.
    const res = await agent
      .post('/graphql')
      .set('x-csrf-token', csrfToken)
      .send({ query: REFRESH })
      .expect(200);
    const body = res.body as GqlResponse<{ refresh: { refreshToken: string } }>;
    expect(body.errors).toBeUndefined();
    expect(body.data!.refresh.refreshToken).toBeTruthy();

    const cookie = refreshCookieOf(res);
    expect(cookie).toBeDefined();
    expect(cookie).not.toContain(beforeSessionId); // rotated to a new token

    const sessions = await tokenStore.listSessionsForUser(userId);
    expect(sessions).toHaveLength(1); // deduped per device, not accumulated
    expect(sessions[0].sessionId).not.toBe(beforeSessionId); // old session revoked
  });

  it('clears the cookie and revokes the session on logout, then refresh fails', async () => {
    const res = await agent
      .post('/graphql')
      .set('x-csrf-token', csrfToken)
      .send({ query: LOGOUT })
      .expect(200);
    const body = res.body as GqlResponse<{ logout: boolean }>;
    expect(body.errors).toBeUndefined();
    expect(body.data!.logout).toBe(true);

    const cookie = refreshCookieOf(res);
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0/i);

    const sessions = await tokenStore.listSessionsForUser(userId);
    expect(sessions).toHaveLength(0); // session revoked

    // CSRF token still valid, but the refresh cookie is gone -> rejected by the service.
    const after = await agent
      .post('/graphql')
      .set('x-csrf-token', csrfToken)
      .send({ query: REFRESH })
      .expect(200);
    const afterBody = after.body as GqlResponse<unknown>;
    expect(afterBody.errors).toBeDefined();
    expect(JSON.stringify(afterBody.errors)).toMatch(/refresh token/i);
  });
});
