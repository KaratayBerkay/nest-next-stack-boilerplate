import { getQueueToken } from '@nestjs/bullmq';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { OutboxService } from './../src/outbox/outbox.service';
import { PrismaService } from './../src/prisma/prisma.service';
import { TokenStoreService } from './../src/auth/token-store.service';

// Proves device-bound sessions end-to-end: login reads a server-issued, httpOnly device-token
// cookie, binds the refresh Session to a Device, dedups one session per device on repeat login
// from the same browser, and treats a cookieless login as a new device. Requires Postgres + Redis.
interface GqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

const waitFor = async <T>(
  fn: () => Promise<T | null | undefined>,
  { timeout = 10_000, interval = 150 } = {},
): Promise<T> => {
  const start = Date.now();
  for (;;) {
    const result = await fn();
    if (result) return result;
    if (Date.now() - start > timeout) throw new Error('waitFor timed out');
    await new Promise((r) => setTimeout(r, interval));
  }
};

describe('Device-bound sessions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let outbox: OutboxService;
  let tokenStore: TokenStoreService;

  const email = 'device.user@example.com';
  const password = 'sup3rSecret!';
  let userId: string;
  let deviceCookie: string; // "device_token=<id>"

  const REGISTER = `mutation { register(input: { email: "${email}", password: "${password}" }) { accessToken } }`;
  const LOGIN = `mutation { login(input: { email: "${email}", password: "${password}" }) { accessToken } }`;

  const deviceCookieOf = (res: request.Response): string | undefined => {
    const raw = (res.headers['set-cookie'] ?? []) as unknown as string[];
    return raw.find((c) => c.startsWith('device_token='));
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
    outbox = app.get(OutboxService);
    tokenStore = app.get(TokenStoreService);
    for (const name of ['outbox', 'mail']) {
      await app.get<Queue>(getQueueToken(name)).obliterate({ force: true });
    }
    await clearDb();
  }, 30_000);

  afterAll(async () => {
    await clearDb();
    await app.close();
  });

  const USER_AGENT = 'jest-e2e-agent/1.0';

  it('issues an httpOnly device cookie and binds the session to a Device on register', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('User-Agent', USER_AGENT)
      .send({ query: REGISTER })
      .expect(200);
    expect((res.body as GqlResponse<unknown>).errors).toBeUndefined();

    const cookie = deviceCookieOf(res);
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/HttpOnly/i);
    deviceCookie = cookie!.split(';')[0];

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    userId = user.id;
    const devices = await prisma.device.findMany({ where: { userId } });
    const sessions = await tokenStore.listSessionsForUser(userId);
    expect(devices).toHaveLength(1);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].deviceId).toBe(devices[0].id);
    expect(sessions[0].userAgent).toBe(USER_AGENT); // captured from the request
    expect(devices[0].fingerprint).toBeTruthy(); // sha256(user-agent)
  });

  it('reuses the device and dedups the session on repeat login from the same browser', async () => {
    const before = await prisma.device.findFirstOrThrow({ where: { userId } });
    const beforeSessions = await tokenStore.listSessionsForUser(userId);
    expect(beforeSessions).toHaveLength(1);
    const beforeSessionId = beforeSessions[0].sessionId;

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Cookie', deviceCookie) // same device-token cookie
      .send({ query: LOGIN })
      .expect(200);
    expect((res.body as GqlResponse<unknown>).errors).toBeUndefined();

    const devices = await prisma.device.findMany({ where: { userId } });
    const sessions = await tokenStore.listSessionsForUser(userId);
    expect(devices).toHaveLength(1); // no new device row
    expect(devices[0].id).toBe(before.id); // same device reused
    expect(sessions).toHaveLength(1); // session deduped, not duplicated
    expect(sessions[0].deviceId).toBe(before.id);
    expect(sessions[0].sessionId).not.toBe(beforeSessionId); // rotated
  });

  it('treats a cookieless login as a new device with its own session', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: LOGIN }) // no cookie -> changed device
      .expect(200);
    expect((res.body as GqlResponse<unknown>).errors).toBeUndefined();
    expect(deviceCookieOf(res)).toBeDefined(); // a fresh device token is issued

    const devices = await prisma.device.findMany({ where: { userId } });
    const sessions = await tokenStore.listSessionsForUser(userId);
    expect(devices).toHaveLength(2); // a second, distinct device
    expect(sessions).toHaveLength(2); // one session per device (not deduped across devices)
  });

  it('audits the new-device sign-in (CREATE on the Device aggregate)', async () => {
    await outbox.relayPendingEvents();
    const audit = await waitFor(() =>
      prisma.auditLog.findFirst({
        where: { action: 'CREATE', entityType: 'Device' },
      }),
    );
    expect(audit.level).toBe('WARN');
  });
});
