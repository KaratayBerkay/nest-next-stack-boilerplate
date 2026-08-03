import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

// Set before AppModule's ConfigModule.forRoot() reads process.env (see setup-e2e.ts
// for why module-eval-time assignment is required, not a beforeAll).
const ALLOWED_ORIGIN = 'https://allowed.e2e-test';
process.env.CORS_ORIGIN = ALLOWED_ORIGIN;

// Proves the WS handshake itself is the only auth boundary for /ws: a valid session's
// httpOnly cookies (attached automatically by any real client, never read by JS) open
// and authenticate the connection with no client-sent message; anything else — no
// cookies, a tampered token, a disallowed Origin, or a revoked session — is rejected
// before a socket is ever created. Requires Postgres + Redis.
interface GqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

const SESSION_COOKIE_NAMES = [
  'access_token',
  'rbac_token',
  'device_token',
  'user_token',
] as const;

type ConnectResult =
  | { outcome: 'open'; socket: WebSocket; firstFrame: Record<string, unknown> }
  | { outcome: 'rejected'; statusCode: number };

describe('WS handshake auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let wsUrl: string;

  const password = 'sup3rSecret!';

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
    // Mirror main.ts: cookie-parser must run so req.cookies is populated for
    // the plain HTTP/GraphQL calls this spec makes alongside the WS ones.
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.listen(0);

    prisma = app.get(PrismaService);
    await clearDb();

    const httpUrl = await app.getUrl();
    wsUrl = `${httpUrl.replace('[::1]', '127.0.0.1').replace(/^http/, 'ws')}/ws`;
  }, 30_000);

  afterAll(async () => {
    await clearDb();
    await app.close();
  });

  async function registerUser(email: string): Promise<request.Response> {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation { register(input: { email: "${email}", password: "${password}" }) { accessToken } }`,
      })
      .expect(200);
    expect((res.body as GqlResponse<unknown>).errors).toBeUndefined();
    return res;
  }

  // Raw "name=value" pairs (no attributes) for the four session cookies, ready to
  // hand-build a Cookie header for the ws client — unlike a browser, it manages no
  // cookie jar of its own, so every value has to be attached explicitly.
  function sessionCookieHeader(
    res: request.Response,
    overrides: Partial<
      Record<(typeof SESSION_COOKIE_NAMES)[number], string>
    > = {},
  ): string {
    const raw = (res.headers['set-cookie'] ?? []) as unknown as string[];
    const pairs: string[] = [];
    for (const name of SESSION_COOKIE_NAMES) {
      if (overrides[name] !== undefined) {
        pairs.push(`${name}=${overrides[name]}`);
        continue;
      }
      const cookie = raw.find((c) => c.startsWith(`${name}=`));
      if (cookie) pairs.push(cookie.split(';')[0]);
    }
    return pairs.join('; ');
  }

  function connect(headers: Record<string, string>): Promise<ConnectResult> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(wsUrl, { headers });
      const timer = setTimeout(() => {
        socket.terminate();
        reject(new Error('connect() timed out waiting for open/rejection'));
      }, 5000);

      socket.on('unexpected-response', (_req, res: IncomingMessage) => {
        clearTimeout(timer);
        resolve({ outcome: 'rejected', statusCode: res.statusCode ?? 0 });
      });
      socket.on('open', () => {
        socket.once('message', (raw: Buffer) => {
          clearTimeout(timer);
          resolve({
            outcome: 'open',
            socket,
            firstFrame: JSON.parse(raw.toString()) as Record<string, unknown>,
          });
        });
      });
      // A rejection with no 'unexpected-response' listener would also surface
      // here; the listener above is always attached first, so this is only
      // reached for a genuine connection-level failure (not a handshake 4xx/5xx).
      socket.on('error', () => {
        /* handled via 'unexpected-response' above */
      });
    });
  }

  it('accepts a valid session and authenticates with no client-sent message', async () => {
    const res = await registerUser('ws-auth-valid@example.com');
    const cookie = sessionCookieHeader(res);

    const result = await connect({ Cookie: cookie, Origin: ALLOWED_ORIGIN });
    expect(result.outcome).toBe('open');
    if (result.outcome === 'open') {
      expect(result.firstFrame).toEqual({ type: 'authenticated' });
      result.socket.close();
    }
  });

  it('rejects a handshake with no session cookies at all', async () => {
    const result = await connect({ Origin: ALLOWED_ORIGIN });
    expect(result).toEqual({ outcome: 'rejected', statusCode: 401 });
  });

  it('rejects a handshake with a tampered access token', async () => {
    const res = await registerUser('ws-auth-tampered@example.com');
    const cookie = sessionCookieHeader(res, { access_token: 'tampered-jwt' });

    const result = await connect({ Cookie: cookie, Origin: ALLOWED_ORIGIN });
    expect(result).toEqual({ outcome: 'rejected', statusCode: 401 });
  });

  it('rejects a handshake from a disallowed Origin before touching the session', async () => {
    const res = await registerUser('ws-auth-badorigin@example.com');
    const cookie = sessionCookieHeader(res);

    const result = await connect({
      Cookie: cookie,
      Origin: 'https://evil.example',
    });
    expect(result).toEqual({ outcome: 'rejected', statusCode: 403 });
  });

  it('rejects a handshake presenting a cookie from an already-logged-out session', async () => {
    const agent = request.agent(app.getHttpServer());
    const regRes = await agent
      .post('/graphql')
      .send({
        query: `mutation { register(input: { email: "ws-auth-loggedout@example.com", password: "${password}" }) { accessToken } }`,
      })
      .expect(200);
    expect((regRes.body as GqlResponse<unknown>).errors).toBeUndefined();
    const cookie = sessionCookieHeader(regRes);

    // The CSRF token is HMAC-bound to whichever access_token cookie is on the
    // request that mints it — reuse the same agent (which already carries the
    // session cookies from registration) so logout's CsrfGuard accepts it.
    const csrfRes = await agent.get('/csrf/token').expect(200);
    const { token: csrfToken } = csrfRes.body as { token: string };

    const logoutRes = await agent
      .post('/graphql')
      .set('x-csrf-token', csrfToken)
      .send({ query: 'mutation { logout }' })
      .expect(200);
    expect(
      (logoutRes.body as GqlResponse<{ logout: boolean }>).data?.logout,
    ).toBe(true);

    const result = await connect({ Cookie: cookie, Origin: ALLOWED_ORIGIN });
    expect(result).toEqual({ outcome: 'rejected', statusCode: 401 });
  });
});
