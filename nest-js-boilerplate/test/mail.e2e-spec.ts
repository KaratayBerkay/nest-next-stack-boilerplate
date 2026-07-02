import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { registerAndLogin } from './utils/auth';

// Proves the email pipeline end-to-end: registering a user enqueues a confirmation email
// (MailService -> BullMQ), the MailProcessor worker drains the queue and sends it through
// MailTransport, and the EmailMessage row lands in SENT. The test env has no RESEND_API_KEY, so
// the transport uses its dev fallback (provider 'dev') — the queue/worker/DB flow is exercised for
// real, offline. Requires Postgres + Redis (docker compose up -d).
describe('Mail pipeline (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  /** Poll an EmailMessage by recipient until it leaves the QUEUED/SENDING states. */
  const waitForDelivery = async (to: string, timeoutMs = 15000) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const email = await prisma.emailMessage.findFirst({
        where: { to },
        orderBy: { createdAt: 'desc' },
      });
      if (email && email.status !== 'QUEUED' && email.status !== 'SENDING') {
        return email;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`email to ${to} was not delivered within ${timeoutMs}ms`);
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('enqueues a confirmation email on registration and the worker marks it SENT', async () => {
    const { email } = await registerAndLogin(app);

    const delivered = await waitForDelivery(email);

    expect(delivered.status).toBe('SENT');
    expect(delivered.template).toBe('email-verification');
    // No RESEND_API_KEY in the test env -> dev transport handles delivery, no providerMessageId.
    expect(delivered.provider).toBe('dev');
    expect(delivered.providerMessageId).toBeNull();
    expect(delivered.attempts).toBeGreaterThanOrEqual(1);
    expect(delivered.sentAt).toBeInstanceOf(Date);
  });
});
