import { randomBytes, randomUUID } from 'node:crypto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailAccount, Prisma } from '@prisma/client';
import { CryptoService } from '../common/crypto/crypto.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  MAIL_ACCOUNT_RECONCILE_USAGE_CEILING_MB,
  MAIL_SEND_LIMIT_PER_HOUR,
  MAIL_SEND_LIMIT_WINDOW_MS,
  MAIL_SEND_SAFETY_MARGIN,
  resolveMailDomain,
} from './mail.constants';

const MXROUTE_API_BASE = 'https://api.mxroute.com';

export interface MxrouteSendStatus {
  email: string;
  /** Configured daily send limit (MXRoute caps this at 9600 = 400/hr). */
  limit: number;
  /** Emails sent today, per MXRoute. */
  sent: number;
  remaining: number;
  suspended: boolean;
}

interface MxrouteEmailAccountResponse {
  success: boolean;
  data?: {
    email: string;
    limit: number;
    sent: number;
    suspended: boolean;
  };
  error?: { code: string; message: string };
}

interface MxrouteCreateAccountResponse {
  success: boolean;
  data?: { email: string };
  error?: { code: string; message: string };
}

export interface MxrouteListedAccount {
  username: string;
  email: string;
  /** MB, disk quota used — NOT a send count (see getLocalEstimatedRemaining's
   *  doc for why MXRoute's own send-count stat can't be trusted instead). */
  usage: number;
  suspended: boolean;
}

interface MxrouteListAccountsResponse {
  success: boolean;
  data?: MxrouteListedAccount[];
  error?: { code: string; message: string };
}

export interface ReconcileResult {
  imported: number;
  alreadyTracked: number;
}

/** Reads live send usage from MXRoute's account API (api.mxroute.com) — not MXRoute's disk-quota
 * endpoints, which track storage, not the daily send counter this account is throttled on. */
@Injectable()
export class MxrouteAccountsService implements OnModuleInit {
  private readonly logger = new Logger(MxrouteAccountsService.name);
  private readonly server?: string;
  private readonly username?: string;
  private readonly apiKey?: string;
  private readonly domain: string;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
  ) {
    this.server = config.get<string>('MXROUTE_SERVER');
    this.username = config.get<string>('MXROUTE_USERNAME');
    this.apiKey = config.get<string>('MXROUTE_API_KEY');
    this.domain = resolveMailDomain(config);
  }

  get configured(): boolean {
    return Boolean(this.server && this.username && this.apiKey);
  }

  /** Local DB resets don't touch MXRoute — every prior run's real sender
   *  mailboxes survive there with no local row to show for it, permanently
   *  unusable (their password was only ever known at creation, never
   *  persisted). Reclaims them once at boot rather than leaving the pool to
   *  silently mint a fresh mailbox per lane every time the DB gets reset. */
  async onModuleInit(): Promise<void> {
    if (!this.configured) return;
    try {
      const result = await this.reconcilePool(this.domain);
      if (result.imported > 0) {
        this.logger.log(
          `Mail account pool reconciled for ${this.domain}: imported ${result.imported}, ${result.alreadyTracked} already tracked`,
        );
      }
    } catch (err) {
      // Reconciliation failing must never block app startup — the pool just
      // falls back to createAccount() per send, same as before this existed.
      this.logger.warn(
        `Mail account pool reconciliation failed, continuing without it: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async getSendStatus(
    domain: string,
    user: string,
  ): Promise<MxrouteSendStatus> {
    if (!this.server || !this.username || !this.apiKey) {
      throw new Error(
        'MXROUTE_SERVER/MXROUTE_USERNAME/MXROUTE_API_KEY are not configured',
      );
    }

    const url = `${MXROUTE_API_BASE}/domains/${encodeURIComponent(domain)}/email-accounts/${encodeURIComponent(user)}`;
    // fallow-ignore-next-line security-sink — MXROUTE_API_BASE is a hardcoded constant; domain/user are caller-supplied config, not untrusted request input
    const res = await fetch(url, {
      headers: {
        'X-Server': this.server,
        'X-Username': this.username,
        'X-API-Key': this.apiKey,
      },
    });

    const body = (await res.json()) as MxrouteEmailAccountResponse;

    if (!res.ok || !body.success || !body.data) {
      const message = body.error?.message ?? `HTTP ${res.status}`;
      throw new Error(`MXRoute API error: ${message}`);
    }

    return {
      email: body.data.email,
      limit: body.data.limit,
      sent: body.data.sent,
      remaining: body.data.limit - body.data.sent,
      suspended: body.data.suspended,
    };
  }

  /** Every real mailbox MXRoute currently has under `domain` — the ground truth
   *  reconcilePool() diffs the local MailAccount table against. */
  async listAccounts(domain: string): Promise<MxrouteListedAccount[]> {
    if (!this.server || !this.username || !this.apiKey) {
      throw new Error(
        'MXROUTE_SERVER/MXROUTE_USERNAME/MXROUTE_API_KEY are not configured',
      );
    }

    // fallow-ignore-next-line security-sink — MXROUTE_API_BASE is a hardcoded constant; domain is caller-supplied config, not untrusted request input
    const res = await fetch(
      `${MXROUTE_API_BASE}/domains/${encodeURIComponent(domain)}/email-accounts`,
      {
        headers: {
          'X-Server': this.server,
          'X-Username': this.username,
          'X-API-Key': this.apiKey,
        },
      },
    );

    const body = (await res.json()) as MxrouteListAccountsResponse;
    if (!res.ok || !body.success || !body.data) {
      const message = body.error?.message ?? `HTTP ${res.status}`;
      throw new Error(`MXRoute API error: ${message}`);
    }
    return body.data;
  }

  /** Resets an existing mailbox's password via the MXRoute API — the write that
   *  makes reconcilePool() possible at all: without it, an orphaned account (real
   *  mailbox, no local row, password unknown) could never become usable again. */
  private async patchPassword(
    domain: string,
    localPart: string,
    password: string,
  ): Promise<void> {
    if (!this.server || !this.username || !this.apiKey) {
      throw new Error(
        'MXROUTE_SERVER/MXROUTE_USERNAME/MXROUTE_API_KEY are not configured',
      );
    }

    // fallow-ignore-next-line security-sink — MXROUTE_API_BASE is a hardcoded constant; domain/localPart are caller-supplied config, not untrusted request input
    const res = await fetch(
      `${MXROUTE_API_BASE}/domains/${encodeURIComponent(domain)}/email-accounts/${encodeURIComponent(localPart)}`,
      {
        method: 'PATCH',
        headers: {
          'X-Server': this.server,
          'X-Username': this.username,
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      },
    );

    const body = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      error?: { message: string };
    };
    if (!res.ok || !body.success) {
      const message = body.error?.message ?? `HTTP ${res.status}`;
      throw new Error(`MXRoute API error: ${message}`);
    }
  }

  /** Diffs MXRoute's real account list against the local MailAccount table and
   *  reclaims anything found only on MXRoute's side: resets its password (so
   *  it's actually usable, not just a record we'd fail to authenticate with)
   *  and inserts the tracked row. Scoped deliberately narrow so it can never
   *  touch a recipient inbox (test/test-user-N@) or anything with real content:
   *  only the `noreply-<uuid>` sender-pool naming convention createAccount()
   *  itself uses, and only at or below MAIL_ACCOUNT_RECONCILE_USAGE_CEILING_MB
   *  disk usage. Safe to call repeatedly — already-tracked accounts are
   *  skipped, never re-touched. */
  async reconcilePool(domain: string): Promise<ReconcileResult> {
    const [remote, tracked] = await Promise.all([
      this.listAccounts(domain),
      this.prisma.mailAccount.findMany({ select: { email: true } }),
    ]);
    const trackedEmails = new Set(tracked.map((a) => a.email));

    const orphaned = remote.filter(
      (a) =>
        !trackedEmails.has(a.email) &&
        a.username.startsWith('noreply-') &&
        !a.suspended &&
        a.usage <= MAIL_ACCOUNT_RECONCILE_USAGE_CEILING_MB,
    );

    let imported = 0;
    for (const account of orphaned) {
      const password = `${randomBytes(18).toString('base64url')}Aa1`;
      await this.patchPassword(domain, account.username, password);
      await this.prisma.mailAccount.create({
        data: {
          email: account.email,
          encryptedPassword: Uint8Array.from(this.crypto.encrypt(password)),
        },
      });
      imported++;
    }

    return {
      imported,
      alreadyTracked: remote.length - orphaned.length,
    };
  }

  /** Shared MXRoute create-email-account call. Returns the confirmed email — MXRoute's
   * response never echoes the password back, so callers must hang onto the one they
   * generated locally and passed in. */
  private async postEmailAccount(
    domain: string,
    localPart: string,
    password: string,
  ): Promise<string> {
    if (!this.server || !this.username || !this.apiKey) {
      throw new Error(
        'MXROUTE_SERVER/MXROUTE_USERNAME/MXROUTE_API_KEY are not configured',
      );
    }

    // fallow-ignore-next-line security-sink — MXROUTE_API_BASE is a hardcoded constant; domain is caller-supplied config, not untrusted request input
    const res = await fetch(
      `${MXROUTE_API_BASE}/domains/${encodeURIComponent(domain)}/email-accounts`,
      {
        method: 'POST',
        headers: {
          'X-Server': this.server,
          'X-Username': this.username,
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: localPart, password }),
      },
    );

    const body = (await res.json()) as MxrouteCreateAccountResponse;
    if (!res.ok || !body.success || !body.data) {
      const message = body.error?.message ?? `HTTP ${res.status}`;
      throw new Error(`MXRoute API error: ${message}`);
    }
    return body.data.email;
  }

  /** Creates a `noreply-<uuid>@domain` mailbox via the MXRoute API (its own isolated
   * 9600/day quota) and persists it, password encrypted at rest, in `MailAccount`. */
  async createAccount(domain: string): Promise<MailAccount> {
    const localPart = `noreply-${randomUUID()}`;
    const password = `${randomBytes(18).toString('base64url')}Aa1`;
    const email = await this.postEmailAccount(domain, localPart, password);

    return this.prisma.mailAccount.create({
      data: {
        email,
        encryptedPassword: Uint8Array.from(this.crypto.encrypt(password)),
      },
    });
  }

  /** Creates a receive-only mailbox with a caller-chosen local part (e.g. a
   * `test-user-N` load-test recipient inbox). Unlike createAccount(), this isn't part
   * of the sender pool rotation draws from, so it's deliberately not persisted to
   * `MailAccount` — callers that need the password again (there usually isn't a need;
   * these mailboxes are only ever addressed `to:`, never sent `from:`) must hold onto
   * the one returned here. */
  async createNamedAccount(
    domain: string,
    localPart: string,
  ): Promise<{ email: string; password: string }> {
    const password = `${randomBytes(18).toString('base64url')}Aa1`;
    const email = await this.postEmailAccount(domain, localPart, password);
    return { email, password };
  }

  /** Deletes a mailbox via the MXRoute API and its corresponding MailAccount row.
   * Takes the full email (as stored in MailAccount.email) — MXRoute's own path
   * param is just the local part, derived here. A 404 from MXRoute (already gone)
   * is treated as success rather than an error, so this is safe to re-run. */
  async deleteAccount(domain: string, email: string): Promise<void> {
    if (!this.server || !this.username || !this.apiKey) {
      throw new Error(
        'MXROUTE_SERVER/MXROUTE_USERNAME/MXROUTE_API_KEY are not configured',
      );
    }
    const localPart = email.split('@')[0];

    // fallow-ignore-next-line security-sink — MXROUTE_API_BASE is a hardcoded constant; domain/localPart are caller-supplied config, not untrusted request input
    const res = await fetch(
      `${MXROUTE_API_BASE}/domains/${encodeURIComponent(domain)}/email-accounts/${encodeURIComponent(localPart)}`,
      {
        method: 'DELETE',
        headers: {
          'X-Server': this.server,
          'X-Username': this.username,
          'X-API-Key': this.apiKey,
        },
      },
    );

    if (!res.ok && res.status !== 404) {
      const body = (await res.json().catch(() => ({}))) as {
        error?: { message: string };
      };
      const message = body.error?.message ?? `HTTP ${res.status}`;
      throw new Error(`MXRoute API error: ${message}`);
    }

    await this.prisma.mailAccount.deleteMany({ where: { email } });
  }

  /** Decrypts a stored account's mailbox password for SMTP use. */
  async getDecryptedPassword(email: string): Promise<string> {
    const account = await this.prisma.mailAccount.findUniqueOrThrow({
      where: { email },
    });
    return this.crypto.decrypt(Buffer.from(account.encryptedPassword));
  }

  /** Estimates remaining send headroom for the account's current rolling-hour
   * window using our own locally-tracked ledger (`usage`/`firstSentAt`) — never
   * MXRoute's own send-count API, which is proven to stay at 0 long after real
   * sends land. If more than an hour has passed since `firstSentAt`, the window
   * has rolled over and the account is treated as having full headroom again,
   * even though `usage` itself isn't physically reset until the next recordSend(). */
  async getLocalEstimatedRemaining(email: string): Promise<number> {
    const account = await this.prisma.mailAccount.findUniqueOrThrow({
      where: { email },
    });
    const windowStart = new Date(Date.now() - MAIL_SEND_LIMIT_WINDOW_MS);
    const windowActive =
      account.firstSentAt !== null && account.firstSentAt >= windowStart;
    const estimatedUsage = windowActive ? account.usage : 0;
    return Math.max(0, MAIL_SEND_LIMIT_PER_HOUR - estimatedUsage);
  }

  /** Bulk-resets usage/firstSentAt to a clean slate for every account whose
   * rolling-hour window has expired, so the raw table reads accurately at a
   * glance (usage always reflects real activity within the last hour) instead of
   * requiring a reader to cross-check firstSentAt by hand — getLocalEstimatedRemaining
   * already accounts for window expiry on its own, this is purely for the table's
   * own bookkeeping. Meant to run once per script/process invocation, before any
   * sends. lastSentAt is left untouched — it's historical, not part of the
   * rate-limit calculation. Returns the number of accounts reset. */
  async resetExpiredWindows(): Promise<number> {
    const windowStart = new Date(Date.now() - MAIL_SEND_LIMIT_WINDOW_MS);
    return this.prisma.$executeRaw`
      UPDATE "MailAccount"
      SET "usage" = 0, "firstSentAt" = NULL
      WHERE "firstSentAt" < ${windowStart}
    `;
  }

  /** Atomically claims one existing ACTIVE account with real headroom — either its
   * rolling-hour window has expired (reset to a clean slate as part of the same
   * claim) or it genuinely has usage left within the current window — instead of
   * assuming a new mailbox is needed. Uses FOR UPDATE SKIP LOCKED so concurrent
   * callers (e.g. 20 lanes starting at once) each land on a different row rather
   * than racing over the same one; ORDER BY usage ASC, updatedAt ASC also biases
   * away from a row another caller only just claimed a moment ago, narrowing (if
   * not perfectly closing) the window where two callers could still pick the same
   * lightly-used row between separate claim calls. Returns null if nothing is
   * currently claimable, so the caller can fall back to createAccount(). This is
   * what makes the sender pool actually get reused instead of every lane/rotation
   * creating a brand new mailbox regardless of idle capacity sitting right there. */
  async claimAvailableAccount(): Promise<MailAccount | null> {
    const windowStart = new Date(Date.now() - MAIL_SEND_LIMIT_WINDOW_MS);
    const claimableUsageCeiling =
      MAIL_SEND_LIMIT_PER_HOUR - MAIL_SEND_SAFETY_MARGIN;
    const rows = await this.prisma.$queryRaw<MailAccount[]>`
      UPDATE "MailAccount"
      SET
        "usage" = CASE
          WHEN "firstSentAt" IS NULL OR "firstSentAt" < ${windowStart} THEN 0
          ELSE "usage"
        END,
        "firstSentAt" = CASE
          WHEN "firstSentAt" IS NULL OR "firstSentAt" < ${windowStart} THEN NULL
          ELSE "firstSentAt"
        END,
        "updatedAt" = now()
      WHERE id = (
        SELECT id FROM "MailAccount"
        WHERE status = 'ACTIVE'
          AND (
            "firstSentAt" IS NULL
            OR "firstSentAt" < ${windowStart}
            OR "usage" < ${claimableUsageCeiling}
          )
        ORDER BY "usage" ASC, "updatedAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING *
    `;
    return rows[0] ?? null;
  }

  /** Atomically records a real send against the account's local rolling-hour
   * ledger: resets the window (usage=1, firstSentAt=now) if more than an hour has
   * passed since the window's current firstSentAt, otherwise increments usage —
   * always bumps lastSentAt. Returns an unexecuted PrismaPromise so callers can
   * fold it into their own $transaction alongside other writes (e.g. the
   * EmailMessage status update) for atomicity, same as prisma.*.update() would. */
  recordSend(email: string): Prisma.PrismaPromise<number> {
    const windowStart = new Date(Date.now() - MAIL_SEND_LIMIT_WINDOW_MS);
    return this.prisma.$executeRaw`
      UPDATE "MailAccount"
      SET
        "usage" = CASE
          WHEN "firstSentAt" IS NULL OR "firstSentAt" < ${windowStart} THEN 1
          ELSE "usage" + 1
        END,
        "firstSentAt" = CASE
          WHEN "firstSentAt" IS NULL OR "firstSentAt" < ${windowStart} THEN now()
          ELSE "firstSentAt"
        END,
        "lastSentAt" = now()
      WHERE "email" = ${email}
    `;
  }
}
