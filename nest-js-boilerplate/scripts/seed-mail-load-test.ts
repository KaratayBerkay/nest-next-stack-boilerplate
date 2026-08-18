/**
 * Creates N real test users and sends each the two real signup emails
 * (email-verification + email-otp, mirroring auth-registration.service.ts's
 * register() and EmailOtpService.generate()), delivered to 20 real, checkable
 * MXRoute inboxes (test-user-1@ .. test-user-20@) instead of a synthetic
 * catch-all address — entirely through isolated per-lane sender mailboxes,
 * never touching the shared app container, its Vault-sourced SMTP identity,
 * or the shared MAIL_QUEUE.
 *
 * Concurrency: since User.email is unique and there are only 20 real recipient
 * inboxes, each of the 20 "lanes" owns one recipient address for the whole run
 * and cycles it (create user -> send both emails -> delete user) as many times
 * as its share of `count` requires, freeing the address for reuse each time.
 * All 20 lanes run concurrently (Promise.allSettled) with their own dedicated
 * sender mailbox, which is what actually makes this fast: MailTransport doesn't
 * pool SMTP connections, so serial sends are dominated by per-send TCP+TLS
 * overhead (~0.5-1.5s each), not by any artificial pacing between them.
 *
 * No mailbox — sender or recipient — is provisioned up front. main() does zero
 * account setup; each lane creates/ensures both of its own the moment it starts
 * (ensureRecipientAccount() + createSenderContext(), run in parallel with each
 * other, and concurrently with every other lane's own startup), instead of a
 * blocking batch of up to 40 mailboxes before any real work begins.
 * Sender accounts (noreply-<uuid>@) are a real reusable pool across runs and
 * within a single run's rotations: createSenderContext() always tries
 * claimAvailableAccount() first — an idle existing MailAccount with real
 * headroom, claimed race-safely under concurrent callers via FOR UPDATE SKIP
 * LOCKED — and only creates a brand new mailbox when nothing is currently
 * claimable. Recipient accounts (test-user-N@) work differently on purpose:
 * idempotently created only if missing (checked via getSendStatus) and reused
 * forever after by design, since they're meant to be stable, checkable inboxes,
 * not persisted to MailAccount (that table is sender bookkeeping only); a
 * recipient's password is only ever logged once, at creation, in case you want
 * to check webmail directly.
 *
 * Rate-limit handling: MXRoute's own `sent`/`usage` stat is unreliable (stays 0
 * well after real sends land — confirmed live), so headroom is never checked
 * against MXRoute directly. Instead, MailAccount tracks its own rolling-hour
 * ledger (`usage` + `firstSentAt`/`lastSentAt`, updated atomically by
 * MxrouteAccountsService.recordSend on every confirmed send). Before each send
 * attempt, getLocalEstimatedRemaining() checks that ledger and proactively
 * rotates to a fresh sender once it's within MAIL_SEND_SAFETY_MARGIN of the real
 * cap — catching e.g. a reused sender still hot from an earlier run this hour —
 * without wasting a round-trip on a send MXRoute would just 550 anyway. The
 * window auto-expires an hour after firstSentAt, at which point the account
 * reads as fully fresh again even before usage is physically reset — main()
 * also runs resetExpiredWindows() once at startup to bulk-clear any account
 * whose window already lapsed, so the raw table reads accurately at a glance
 * without needing to cross-check firstSentAt by hand. Real 550 rejections (our
 * estimate being wrong, or usage from outside this script) still trigger the
 * same reactive rotation as a backstop, bounded by MAX_SEND_ATTEMPTS per email.
 *
 * Do not run this script concurrently with itself — a second invocation would
 * race the first over the same 20 recipient addresses (unique-constraint
 * collisions, or one process's stale-row cleanup deleting the other's in-flight
 * row). For extra DB-pool headroom under the 20-way concurrency, consider
 * running with DATABASE_POOL_MAX=30 (defaults to 20, see prisma.service.ts —
 * fine, but leaves no slack if every lane wants a connection at once).
 *
 * Requires MXROUTE_SERVER/MXROUTE_USERNAME/MXROUTE_API_KEY configured (see
 * MxrouteAccountsService) — used both to provision the 20 sender/recipient
 * mailboxes and to rotate senders reactively on a real rate-limit rejection.
 *
 * Usage:
 *   pnpm exec ts-node -r tsconfig-paths/register scripts/seed-mail-load-test.ts [count]
 *
 * count defaults to 1200.
 */
import { randomInt } from 'node:crypto';
import { hash } from '@node-rs/argon2';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { CryptoModule } from '../src/common/crypto/crypto.module';
import { CryptoService } from '../src/common/crypto/crypto.service';
import { MailTransport } from '../src/mail/mail.transport';
import { MAIL_SEND_SAFETY_MARGIN } from '../src/mail/mail.constants';
import { MxrouteAccountsService } from '../src/mail/mxroute-accounts.service';
import { renderTemplate } from '../src/mail/templates/render';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';

const DOMAIN = 'berwallet.online';
const SMTP_HOST = 'mail.berwallet.online';
const TEST_USER_PASSWORD = 'LoadTest123!';
const LANE_COUNT = 20;
// Per-lane bound on reactive rotations. A lane's share of a large run can span
// several sender accounts (~399 safe sends each) — e.g. 10,000 users/20 lanes =
// 1,000 sends/lane needs ~3 — so this is headroom above the worst case expected,
// not a volume estimate, and it costs nothing unused since rotation only creates
// an account when actually triggered.
const MAX_AUTO_ACCOUNTS_PER_LANE = 8;
// Per-email attempts before giving up on it: 1 initial + up to 2 rotate-and-retry.
const MAX_SEND_ATTEMPTS = 3;
// How often (in cycles) each lane logs mid-run progress — purely for visibility
// on long runs; does not affect behavior.
const PROGRESS_LOG_EVERY = 100;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CryptoModule,
  ],
  providers: [MxrouteAccountsService],
})
class LoadTestModule {}

interface SendContext {
  transport: MailTransport;
  accountEmail: string;
}

interface LaneResult {
  lane: number;
  ok: boolean;
  sent: number;
  failed: number;
  accountsCreated: number;
  error?: string;
}

function makeTransportConfig(
  accountEmail: string,
  password: string,
): ConfigService {
  const values: Record<string, string> = {
    SMTP_HOST,
    SMTP_USER: accountEmail,
    SMTP_PASS: password,
    MAIL_FROM: accountEmail,
  };
  return { get: (key: string) => values[key] } as unknown as ConfigService;
}

function isRateLimitError(err: unknown): boolean {
  return err instanceof Error && err.message.includes('Rate limit exceeded');
}

/** Gets a ready SendContext for a sender account — reusing an existing idle one
 * (claimAvailableAccount(), race-safe under concurrent callers) whenever one has
 * real headroom, only creating a fresh noreply-<uuid>@ via the MXRoute API when
 * nothing is currently claimable. The plaintext password only ever exists
 * transiently here, decrypted for the SMTP transport, never persisted. */
async function createSenderContext(
  mxroute: MxrouteAccountsService,
): Promise<SendContext> {
  const claimed = await mxroute.claimAvailableAccount();
  let account: { email: string };
  if (claimed) {
    console.log(`[sender] reusing ${claimed.email} (usage=${claimed.usage})`);
    account = claimed;
  } else {
    account = await mxroute.createAccount(DOMAIN);
    console.log(`[sender] created ${account.email}`);
  }
  const password = await mxroute.getDecryptedPassword(account.email);
  return {
    accountEmail: account.email,
    transport: new MailTransport(makeTransportConfig(account.email, password)),
  };
}

/** Points `ctx` at a fresh sender account — called only once the currently-active
 * account gets a real 550 rate-limit rejection from MXRoute, or once our own local
 * ledger says it's out of headroom (see getLocalEstimatedRemaining), never based
 * on MXRoute's own (unreliable) reported usage stat. */
async function rotateAccount(
  ctx: SendContext,
  mxroute: MxrouteAccountsService,
  created: { count: number },
): Promise<void> {
  if (created.count >= MAX_AUTO_ACCOUNTS_PER_LANE) {
    throw new Error(
      `hit MAX_AUTO_ACCOUNTS_PER_LANE=${MAX_AUTO_ACCOUNTS_PER_LANE} — refusing to auto-create another account`,
    );
  }
  const next = await createSenderContext(mxroute);
  created.count++;
  console.warn(
    `[rotate] ${ctx.accountEmail} hit its hourly limit — switched to account ` +
      `#${created.count}: ${next.accountEmail}`,
  );
  ctx.accountEmail = next.accountEmail;
  ctx.transport = next.transport;
}

async function sendTracked(
  prisma: PrismaService,
  ctx: SendContext,
  mxroute: MxrouteAccountsService,
  created: { count: number },
  args: {
    to: string;
    userId: string;
    subject: string;
    template: string;
    variables: Record<string, unknown>;
  },
): Promise<void> {
  const rendered = renderTemplate(args.template, args.variables);
  const record = await prisma.emailMessage.create({
    data: {
      to: args.to,
      userId: args.userId,
      subject: rendered.subject || args.subject,
      template: args.template,
      variables: args.variables as Prisma.InputJsonValue,
      status: 'SENDING',
      attempts: 1,
    },
  });

  const payload = {
    to: args.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  };

  // Bounded retry-with-rotation: a single rate-limit hit shouldn't be able to lose
  // this email outright — only a non-rate-limit error, or exhausting every attempt,
  // gives up. Each attempt after the first happens on a freshly-rotated account.
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt++) {
    // Proactive: our own local ledger is reliable (unlike MXRoute's send-count API,
    // which never updates), so rotate before wasting a round-trip on a send we can
    // already tell MXRoute will 550 — e.g. a reused sender still hot from an earlier
    // run within the same hour.
    const remaining = await mxroute.getLocalEstimatedRemaining(
      ctx.accountEmail,
    );
    if (remaining <= MAIL_SEND_SAFETY_MARGIN) {
      await rotateAccount(ctx, mxroute, created);
    }

    try {
      const result = await ctx.transport.send(payload);
      await prisma.$transaction([
        prisma.emailMessage.update({
          where: { id: record.id },
          data: {
            status: 'SENT',
            provider: result.provider,
            providerMessageId: result.messageId ?? null,
            sentAt: new Date(),
          },
        }),
        mxroute.recordSend(ctx.accountEmail),
      ]);
      return;
    } catch (err) {
      lastErr = err;
      if (!isRateLimitError(err) || attempt === MAX_SEND_ATTEMPTS) break;
      await rotateAccount(ctx, mxroute, created);
    }
  }

  await prisma.emailMessage.update({
    where: { id: record.id },
    data: {
      status: 'FAILED',
      lastError: lastErr instanceof Error ? lastErr.message : String(lastErr),
    },
  });
  throw lastErr;
}

/** Idempotently ensures this lane's `test-user-N@` recipient inbox exists,
 * creating it if missing. Never persisted to MailAccount — these are
 * receive-only, not part of the sender pool. */
async function ensureRecipientAccount(
  mxroute: MxrouteAccountsService,
  laneIndex: number,
): Promise<string> {
  const localPart = `test-user-${laneIndex + 1}`;
  const email = `${localPart}@${DOMAIN}`;
  try {
    await mxroute.getSendStatus(DOMAIN, localPart);
  } catch {
    const account = await mxroute.createNamedAccount(DOMAIN, localPart);
    console.log(
      `[setup] created recipient inbox ${account.email} (password: ${account.password}) — save this if you want to check webmail`,
    );
  }
  return email;
}

async function runLane(params: {
  laneIndex: number;
  quota: number;
  prisma: PrismaService;
  crypto: CryptoService;
  mxroute: MxrouteAccountsService;
}): Promise<LaneResult> {
  const { laneIndex, quota, prisma, crypto, mxroute } = params;
  let sent = 0;
  let failed = 0;
  const created = { count: 0 };

  try {
    // Nothing is pre-provisioned in main() — every lane ensures/creates both its
    // own recipient inbox and its own dedicated sender account right here,
    // concurrently with every other lane's own startup, instead of a blocking
    // batch of 20+20 mailboxes before any real work begins.
    const [recipientEmail, ctx] = await Promise.all([
      ensureRecipientAccount(mxroute, laneIndex),
      createSenderContext(mxroute),
    ]);

    // Defensive: a previous crashed/interrupted run may have left this address's
    // row behind — deleteMany silently no-ops when there's nothing to clean up.
    await prisma.user.deleteMany({ where: { email: recipientEmail } });

    for (let cycle = 1; cycle <= quota; cycle++) {
      // User creation is its own failure domain — if it fails, there's nothing
      // to email, so the two sends below don't run at all. But the two sends
      // are independent of each other: one failing must not skip the other.
      let user;
      let rawToken: string;
      try {
        // Hashed per-cycle, not hoisted — argon2's per-call random salt only
        // does anything if the call actually happens once per row.
        const passwordHash = await hash(TEST_USER_PASSWORD);
        user = await prisma.user.create({
          data: {
            email: recipientEmail,
            name: `Load Test lane${laneIndex + 1}-${cycle}`,
            passwordHash,
            passwordSetAt: new Date(),
            status: 'PENDING_VERIFICATION',
          },
        });

        rawToken = randomInt(100_000_000, 999_999_999).toString();
        await prisma.verificationToken.create({
          data: {
            userId: user.id,
            type: 'EMAIL_VERIFICATION',
            tokenHash: crypto.sha256(rawToken),
            identifier: recipientEmail,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          },
        });
      } catch (err) {
        console.error(
          `[lane ${laneIndex + 1}] cycle ${cycle} user creation failed:`,
          err instanceof Error ? err.message : err,
        );
        continue;
      }

      try {
        await sendTracked(prisma, ctx, mxroute, created, {
          to: recipientEmail,
          userId: user.id,
          subject: 'Confirm your email',
          template: 'email-verification',
          variables: {
            url: `http://localhost:3000/auth/verify-email?token=${rawToken}`,
            name: user.name,
          },
        });
        sent++;
      } catch (err) {
        failed++;
        console.error(
          `[lane ${laneIndex + 1}] cycle ${cycle} verification email failed:`,
          err instanceof Error ? err.message : err,
        );
      }

      try {
        const code = String(randomInt(100_000, 999_999));
        await sendTracked(prisma, ctx, mxroute, created, {
          to: recipientEmail,
          userId: user.id,
          subject: 'Your email verification code',
          template: 'email-otp',
          variables: { code, purpose: 'registration', name: '' },
        });
        sent++;
      } catch (err) {
        failed++;
        console.error(
          `[lane ${laneIndex + 1}] cycle ${cycle} otp email failed:`,
          err instanceof Error ? err.message : err,
        );
      }

      // Both attempts are done (sent or FAILED — the audit trail survives via
      // EmailMessage.userId's onDelete: SetNull) — free the address for reuse.
      await prisma.user.deleteMany({ where: { id: user.id } });

      if (cycle % PROGRESS_LOG_EVERY === 0) {
        console.log(
          `[lane ${laneIndex + 1}] progress: ${cycle}/${quota} cycles, ` +
            `sent=${sent} failed=${failed} accountsCreated=${created.count}`,
        );
      }
    }

    console.log(
      `[lane ${laneIndex + 1}] done: sent=${sent} failed=${failed} accountsCreated=${created.count}`,
    );
    return {
      lane: laneIndex + 1,
      ok: true,
      sent,
      failed,
      accountsCreated: created.count,
    };
  } catch (err) {
    console.error(
      `[lane ${laneIndex + 1}] aborted:`,
      err instanceof Error ? err.message : err,
    );
    return {
      lane: laneIndex + 1,
      ok: false,
      sent,
      failed,
      accountsCreated: created.count,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  const count = Number(process.argv[2]) || 1200;
  if (count < 1) {
    throw new Error('usage: seed-mail-load-test.ts [count]');
  }

  const app = await NestFactory.createApplicationContext(LoadTestModule, {
    logger: ['error', 'warn'],
  });
  const prisma = app.get(PrismaService);
  const crypto = app.get(CryptoService);
  const mxroute = app.get(MxrouteAccountsService);

  const resetCount = await mxroute.resetExpiredWindows();
  if (resetCount > 0) {
    console.log(
      `[setup] reset ${resetCount} sender account(s) whose rolling-hour window had expired`,
    );
  }

  // No mailboxes are provisioned here — every lane ensures/creates both its
  // recipient inbox and its dedicated sender lazily, concurrently, as part of
  // its own runLane() call below.

  // Explicit per-lane quotas summing to exactly `count` — Math.ceil(count/LANE_COUNT)
  // applied independently per lane would over-create whenever count isn't an exact
  // multiple of LANE_COUNT.
  const quotas = Array.from(
    { length: LANE_COUNT },
    (_, i) => Math.floor(count / LANE_COUNT) + (i < count % LANE_COUNT ? 1 : 0),
  );

  const startedAt = Date.now();
  const results = await Promise.allSettled(
    Array.from({ length: LANE_COUNT }, (_, lane) =>
      runLane({
        laneIndex: lane,
        quota: quotas[lane],
        prisma,
        crypto,
        mxroute,
      }),
    ),
  );

  let sent = 0;
  let failed = 0;
  let accountsCreated = 0;
  let abortedLanes = 0;
  for (const result of results) {
    if (result.status === 'fulfilled') {
      sent += result.value.sent;
      failed += result.value.failed;
      accountsCreated += result.value.accountsCreated;
      if (!result.value.ok) abortedLanes++;
    } else {
      abortedLanes++;
      console.error('[lane] rejected unexpectedly:', result.reason);
    }
  }

  const elapsedMin = ((Date.now() - startedAt) / 60000).toFixed(1);
  console.log(
    `done. users=${count} sent=${sent} failed=${failed} ` +
      `accountsCreated=${accountsCreated} abortedLanes=${abortedLanes} elapsed=${elapsedMin}min`,
  );
  await app.close();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
