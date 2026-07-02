import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { generateSync } from 'otplib';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth.service';
import { OutboxService } from './../src/outbox/outbox.service';
import { PrismaService } from './../src/prisma/prisma.service';

// Proves the full auth + transactional-outbox + broker-logging stack end-to-end:
//   credentials register/login (argon2 + JWT), account lockout tracking, email-confirmation
//   queued through the broker, OutboxEvent -> BullMQ -> AuditLog fan-out, TOTP MFA, and
//   OAuth account-linking. Requires Postgres + Redis (docker compose up -d).
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

describe('Auth + Outbox (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let outbox: OutboxService;
  let authService: AuthService;

  const email = 'alice@example.com';
  const password = 'sup3rSecret!';
  let accessToken: string;
  let userId: string;

  const gql = async <T>(
    query: string,
    token?: string,
  ): Promise<GqlResponse<T>> => {
    const req = request(app.getHttpServer()).post('/graphql').send({ query });
    if (token) req.set('Authorization', `Bearer ${token}`);
    const res = await req.expect(200);
    return res.body as GqlResponse<T>;
  };

  const clearDb = async () => {
    await prisma.mfaBackupCode.deleteMany();
    await prisma.mfaFactor.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
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
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    outbox = app.get(OutboxService);
    authService = app.get(AuthService);

    // Clear any stale broker jobs so assertions are deterministic.
    for (const name of ['outbox', 'mail']) {
      await app.get<Queue>(getQueueToken(name)).obliterate({ force: true });
    }
    await clearDb();
  }, 30_000);

  afterAll(async () => {
    await clearDb();
    await app.close();
  });

  it('registers a user, returns tokens, and queues a confirmation email', async () => {
    const body = await gql<{
      register: {
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; status: string };
      };
    }>(
      `mutation { register(input: { email: "${email}", password: "${password}", name: "Alice" }) {
        accessToken refreshToken user { id email status } } }`,
    );

    expect(body.errors).toBeUndefined();
    const payload = body.data!.register;
    expect(payload.accessToken).toBeTruthy();
    expect(payload.refreshToken).toBeTruthy();
    expect(payload.user.email).toBe(email);
    expect(payload.user.status).toBe('PENDING_VERIFICATION');

    accessToken = payload.accessToken;
    userId = payload.user.id;

    // The confirmation email is created QUEUED and "sent" by the mail worker via the broker.
    const sent = await waitFor(() =>
      prisma.emailMessage.findFirst({
        where: { to: email, template: 'email-verification', status: 'SENT' },
      }),
    );
    expect(sent.sentAt).toBeTruthy();
  });

  it('relays the SIGNUP event through the broker into the AuditLog', async () => {
    await outbox.relayPendingEvents();
    const audit = await waitFor(() =>
      prisma.auditLog.findFirst({
        where: { action: 'SIGNUP', entityId: userId },
      }),
    );
    expect(audit.entityType).toBe('User');
    expect(audit.actorId).toBe(userId);
  });

  it('verifies the email via the token in the confirmation link', async () => {
    const message = await prisma.emailMessage.findFirstOrThrow({
      where: { to: email, template: 'email-verification' },
    });
    const url = (message.variables as { url: string }).url;
    const token = new URL(url).searchParams.get('token')!;

    const body = await gql<{
      verifyEmail: { status: string; emailVerifiedAt: string };
    }>(
      `mutation { verifyEmail(token: "${token}") { status emailVerifiedAt } }`,
    );

    expect(body.errors).toBeUndefined();
    expect(body.data!.verifyEmail.status).toBe('ACTIVE');
    expect(body.data!.verifyEmail.emailVerifiedAt).toBeTruthy();
  });

  it('logs in with correct credentials', async () => {
    const body = await gql<{
      login: { accessToken: string; user: { email: string } };
    }>(
      `mutation { login(input: { email: "${email}", password: "${password}" }) {
        accessToken user { email } } }`,
    );
    expect(body.errors).toBeUndefined();
    expect(body.data!.login.accessToken).toBeTruthy();
    accessToken = body.data!.login.accessToken;
  });

  it('rejects a wrong password and records LOGIN_FAILED', async () => {
    const body = await gql(
      `mutation { login(input: { email: "${email}", password: "wrong-password" }) { accessToken } }`,
    );
    expect(body.errors).toBeDefined();
    expect(JSON.stringify(body.errors)).toMatch(/invalid credentials/i);

    await outbox.relayPendingEvents();
    const audit = await waitFor(() =>
      prisma.auditLog.findFirst({
        where: { action: 'LOGIN_FAILED', entityId: userId },
      }),
    );
    expect(audit.level).toBe('WARN');
  });

  it('protects the `me` query behind the JWT guard', async () => {
    const denied = await gql(`{ me { email } }`);
    expect(denied.errors).toBeDefined();

    const allowed = await gql<{ me: { email: string } }>(
      `{ me { email } }`,
      accessToken,
    );
    expect(allowed.errors).toBeUndefined();
    expect(allowed.data!.me.email).toBe(email);
  });

  it('enrolls and verifies TOTP MFA, returning backup codes', async () => {
    const enroll = await gql<{
      enrollMfa: { otpauthUrl: string; secret: string };
    }>(`mutation { enrollMfa { otpauthUrl secret } }`, accessToken);
    expect(enroll.errors).toBeUndefined();
    const secret = enroll.data!.enrollMfa.secret;
    expect(enroll.data!.enrollMfa.otpauthUrl).toContain('otpauth://');

    const code = generateSync({ secret });
    const verify = await gql<{
      verifyMfa: { enabled: boolean; backupCodes: string[] };
    }>(
      `mutation { verifyMfa(code: "${code}") { enabled backupCodes } }`,
      accessToken,
    );
    expect(verify.errors).toBeUndefined();
    expect(verify.data!.verifyMfa.enabled).toBe(true);
    expect(verify.data!.verifyMfa.backupCodes).toHaveLength(10);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.mfaEnabled).toBe(true);
  });

  it('links a social account and is idempotent across logins', async () => {
    const profile = {
      type: 'GOOGLE' as const,
      provider: 'google',
      providerAccountId: 'google-oauth-123',
      email: 'oauth.user@example.com',
      name: 'OAuth User',
    };

    const first = await authService.loginWithOAuth(profile);
    const second = await authService.loginWithOAuth(profile);

    expect(first.user.id).toBe(second.user.id);
    expect(first.user.status).toBe('ACTIVE'); // provider-verified email -> active
    expect(first.user.emailVerifiedAt).toBeTruthy();

    const accounts = await prisma.account.findMany({
      where: { provider: 'google', providerAccountId: 'google-oauth-123' },
    });
    expect(accounts).toHaveLength(1); // linked once, not duplicated
  });
});
