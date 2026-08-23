# Mail (backend)

**Source:** [`nest-js-boilerplate/src/mail/`](../../../../nest-js-boilerplate/src/mail/) ·
**Category:** [Platform / Core](../README.md) · **Interface docs:** none (internal — no REST/GraphQL/WS
surface of its own)

## What this module owns

Outbound transactional email, queued off the request path. `MailService.enqueue()` persists an
`EmailMessage` row (status `QUEUED`) and adds a BullMQ job to the `mail` queue; a separate worker,
`MailProcessor`, drains it, renders the template, sends, and updates the row to `SENT`/`FAILED`. The
send path is rate-limited at the BullMQ Worker level (not the Queue) — `@Processor('mail', {limiter:
{max: MAIL_SEND_LIMIT_PER_HOUR, duration: MAIL_SEND_LIMIT_WINDOW_MS}})`, 400/hour. Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly.

## Three-tier send fallback

[`mail.transport.ts`](../../../../nest-js-boilerplate/src/mail/mail.transport.ts)'s `send()` tries, in
order:

1. **A per-send MXRoute pool account**, if `MxrouteAccountsService` claimed one (see below) — a
   one-off SMTP transport authenticated as that specific mailbox.
2. **Static `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`**, if configured and no pool account was available.
3. **Resend** (`RESEND_API_KEY`), if SMTP isn't configured at all.
4. **Dev-log fallback** — if none of the above are configured, the "send" is just a Pino log line
   (`[dev-mail] -> to :: subject`) and the email is marked sent without ever leaving the process.

SMTP is always implicit-TLS on port 465, never STARTTLS on 587 — a deliberate, commented choice (465
encrypts from the first byte; STARTTLS on 587 has a brief plaintext negotiation window a MITM could
strip). `SMTP_PORT`/`SMTP_SECURE` env vars are intentionally ignored.

## `MxrouteAccountsService` — a rotating sender-mailbox pool

The most substantial file in this module,
[`mxroute-accounts.service.ts`](../../../../nest-js-boilerplate/src/mail/mxroute-accounts.service.ts),
manages a pool of `noreply-<uuid>@<domain>` mailboxes against the MXRoute hosting API
(`api.mxroute.com`), each with its own independent 9600/day (400/hour) send quota — so the app's real
effective throughput scales with pool size rather than being capped by one shared mailbox. Every
`MailAccount` row tracks a **locally-computed** rolling-hour usage ledger (`usage`/`firstSentAt`) — the
service's own doc comments note this is deliberate: MXRoute's own send-count API was live-confirmed to
stay at `0` long after real sends landed, so it can't be trusted as the throttle signal.

- `claimAvailableAccount()` atomically claims one `ACTIVE` account with headroom (`FOR UPDATE SKIP
  LOCKED`, biased toward the least-recently-used row) so concurrent send bursts don't collide on the
  same mailbox; `MailProcessor` falls back to `createAccount()` only when nothing is claimable.
- `onModuleInit()`'s `reconcilePool()` runs once at boot: local DB resets (docker volume wipes,
  `migrate reset`) don't touch MXRoute itself, so every prior run's real mailboxes survive there with
  no local row and an unrecoverable (never-persisted) password. Reconciliation resets each orphan's
  password via the MXRoute API and re-imports it, scoped conservatively (only `noreply-*`-named,
  unsuspended, ≤1MB disk usage) so it can never touch a real mailbox with real content.
- Passwords are AES-256-GCM-encrypted at rest via [`common/crypto`](../common/crypto/README.md)'s
  `CryptoService`, never stored or logged in plaintext.

## Interfaces

None. Internal-only — `MailService.enqueue()` is the sole entry point, called directly by other
backend modules (not exposed over REST/GraphQL/WS itself).

## Depends on

[`prisma`](../prisma/README.md) (`EmailMessage`/`MailAccount` tables), `BullModule.registerQueue`
(the `mail` queue, Redis-backed via the app's shared BullMQ connection — see
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `BullModule.forRootAsync`),
[`common/crypto`](../common/crypto/README.md) (`CryptoService`, pool-account password encryption).

## Used by (who calls `MailService`, and why)

Exclusively [identity-access/auth](../../identity-access/auth/README.md) — confirmed via grep, the
only importers of `MailModule`/`MailService` anywhere in `src/` are `auth/auth.service.ts`,
`auth/auth-login.service.ts`, `auth/auth-registration.service.ts`, and `auth/email-otp.service.ts`.
Five templates are enqueued in total: `email-verification`, `password-reset`, `password-changed`,
`email-otp`, and `welcome-social` (post-OAuth-signup welcome). No other feature module sends email
today.

## Known issues

None specific to this module.
