import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// Proves SSR/CSR cookie flows:
//   - POST /cookies-ssr/login  sets device_token + access_token + refresh_token cookies
//   - GET  /cookies-ssr/me     reads them back, validates JWT
//   - POST /cookies-ssr/logout clears all three
//   - POST /cookies-ssr/theme  sets a JS-readable cookie (NOT httpOnly)
//
// Requires Postgres + Redis (docker compose up -d).

interface CookieInfo {
  value: string;
  httpOnly: boolean;
  secure: boolean;
}

interface CookieMap {
  [name: string]: CookieInfo;
}

interface LoginResponse {
  user: { id: string; email: string };
}

interface MeResponse {
  device: string | null;
  access: string | null;
  refresh: string | null;
  user: { id: string; email: string } | null;
}

interface StatusResponse {
  present: string[];
  count: number;
}

interface LogoutResponse {
  ok: boolean;
}

interface ThemeResponse {
  theme: string;
}

function parseCookies(res: request.Response): CookieMap {
  const raw = (res.headers['set-cookie'] ?? []) as unknown as string[];
  const map: CookieMap = {};
  for (const entry of raw) {
    const [nameVal, ...parts] = entry.split(';');
    const [name, value] = nameVal.split('=');
    const opts = parts.map((p) => p.trim().toLowerCase());
    map[name] = {
      value,
      httpOnly: opts.some((o) => o === 'httponly'),
      secure: opts.some((o) => o === 'secure'),
    };
  }
  return map;
}

describe('SSR/CSR Cookies (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let agent: ReturnType<typeof request.agent>;

  const email = 'ssr.cookies@example.com';
  let userId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    prisma = app.get(PrismaService);
    agent = request.agent(app.getHttpServer());

    // Seed a test user directly (no password — login just needs the email to exist)
    const user = await prisma.user.create({
      data: {
        email,
        name: 'SSR Cookie User',
        status: 'ACTIVE',
      },
    });
    userId = user.id;
  }, 30_000);

  afterAll(async () => {
    await prisma.device.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('POST /cookies-ssr/login sets device + access + refresh cookies (all httpOnly)', async () => {
    const res = await agent
      .post('/cookies-ssr/login')
      .send({ email })
      .expect(201);

    const cookies = parseCookies(res);

    // device_token — 1yr, httpOnly
    expect(cookies.device_token).toBeDefined();
    expect(cookies.device_token.httpOnly).toBe(true);
    expect(cookies.device_token.secure).toBe(false); // dev over http

    // access_token — 15m JWT, httpOnly
    expect(cookies.access_token).toBeDefined();
    expect(cookies.access_token.httpOnly).toBe(true);

    // refresh_token — 30d opaque session, httpOnly
    expect(cookies.refresh_token).toBeDefined();
    expect(cookies.refresh_token.httpOnly).toBe(true);
    expect(cookies.refresh_token.secure).toBe(false);

    const body = res.body as LoginResponse;
    expect(body.user.email).toBe(email);
  });

  it('GET /cookies-ssr/me reads the 3 cookies and validates the access token', async () => {
    const res = await agent.get('/cookies-ssr/me').expect(200);
    const body = res.body as MeResponse;
    expect(body.device).toBeTruthy();
    expect(body.access).toBeTruthy();
    expect(body.refresh).toBeTruthy();
    expect(body.user).toBeDefined();
    expect(body.user!.email).toBe(email);
    expect(body.user!.id).toBe(userId);
  });

  it('GET /cookies-ssr/status lists present cookies', async () => {
    const res = await agent.get('/cookies-ssr/status').expect(200);
    const body = res.body as StatusResponse;
    expect(body.present).toContain('device_token');
    expect(body.present).toContain('access_token');
    expect(body.present).toContain('refresh_token');
    expect(body.count).toBeGreaterThanOrEqual(3);
  });

  it('POST /cookies-ssr/logout clears all 3 auth cookies', async () => {
    const res = await agent.post('/cookies-ssr/logout').send().expect(201);
    const body = res.body as LogoutResponse;
    expect(body.ok).toBe(true);

    const cookies = parseCookies(res);
    // Each cookie should be expired (Max-Age=0 or past Expires)
    expect(cookies.device_token).toBeDefined();
    expect(cookies.access_token).toBeDefined();
    expect(cookies.refresh_token).toBeDefined();
  });

  it('GET /cookies-ssr/status returns 0 cookies after logout', async () => {
    const res = await agent.get('/cookies-ssr/status').expect(200);
    const body = res.body as StatusResponse;
    // After logout, the agent's cookie jar should be empty
    expect(body.count).toBe(0);
  });

  it('POST /cookies-ssr/theme sets a JS-readable cookie (NOT httpOnly)', async () => {
    const res = await agent
      .post('/cookies-ssr/theme')
      .send({ theme: 'dark' })
      .expect(201);

    const body = res.body as ThemeResponse;
    expect(body.theme).toBe('dark');

    const cookies = parseCookies(res);
    expect(cookies.theme).toBeDefined();
    expect(cookies.theme.value).toBe('dark');
    expect(cookies.theme.httpOnly).toBe(false); // client-side JS can read it
    expect(cookies.theme.secure).toBe(false); // dev
  });
});
