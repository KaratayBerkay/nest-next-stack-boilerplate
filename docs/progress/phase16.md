# Phase 16 — Phase 15 close-out (test debt, IP-change, WS close codes, frontend event pipe, Kibana, docs) + Welcome-email & password-reset for social signups

> Execution tracker for the sixteenth phase of the [stack roadmap](../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-05 · Status: **not started**. Planning only — no code written for
> this tracker yet, per the project's "plan phase N = write only phaseN.md" convention.

## Relationship to Phase 15

`phase15.md` (Status: not started, 15 tasks across Stages A–G) is **not actually done**.
Checked `git log 83af312..HEAD` (the range since `phase15.md` was written): 7 commits
landed (`ac6cc05`…`1ea8b80`), all shaped like **Stage G / T15** — the carried-over
Phase 12/13 live control run (scroll-to-bottom positioning, unread-count route, proxy
routing, fluent-bit `depends_on`, Y-swiper scrolling). None of them touch
`session-auth.guard.ts`, `realtime.gateway.ts`, `events.schema.ts`,
`kibana-saved-objects.ndjson`, or any test file — i.e. **Stages A–F (T1–T14) were never
started.** Per Berkay's direction, rather than write a separate close-out phase, Phase
15's 14 outstanding tasks are carried into this phase's **Stage A** unchanged (same
numbers, same bodies, cross-referenced back to `phase15.md`) — the same "fold the
predecessor's residue into the new phase's Stage A" shape Phase 14 used for Phase 13.
`phase15.md` itself is left untouched; its boxes get flipped from here once Stage A
lands, per this project's recurring "tracker lags reality" lesson (phases 2, 12, 13).

Phase 16's *new* scope (Stages B–H) is the feature Berkay actually asked for: when a
user signs up via a social/OAuth provider (Google, GitHub, etc.), send them a welcome
email containing their generated username and a link to set their password — sent via
a real mxroute SMTP mailbox Berkay already holds a subscription for, not the
placeholder Resend transport currently wired in.

## Survey (2026-07-05) — mail / social-auth code as it exists today

Researched via direct file reads (`auth.service.ts`, `mail/*.ts`, `prisma/schema.prisma`,
`oauth/*.ts`, `docker-compose.yml`, both `.env.example` files, frontend `messages/en/auth`,
`features/auth/ui/*`, `app/api/auth/*`) plus a dedicated research pass:

- **OAuth login is real and working**, just not via Passport despite what the backlog
  claims. `oauth-providers.ts` configures Google/GitHub/X/LinkedIn/HuggingFace/Twitch
  (PKCE Authorization Code flow); `oauth.controller.ts` exposes
  `GET /auth/oauth/:provider`, `.../callback`, `.../profile`;
  `AuthService.loginWithOAuth()` (`auth.service.ts:227-307`) upserts an `Account`,
  finds-or-creates the `User` (`status:'ACTIVE'`, `emailVerifiedAt: now()`), and issues
  tokens. **No email is sent from this path today, and no `username` is ever set** —
  `tx.user.create()` at `auth.service.ts:271-279` omits it entirely (the field is
  nullable, `@@unique`).
- `docs/todo/02-backend.md:27-29` is **stale**: still lists "Social auth providers... via
  Passport strategies" as an open backlog item; the OAuth flow above is already built
  and wired into `docker-compose.yml` (`GOOGLE_CLIENT_ID` etc., lines ~204-215) and both
  `.env.example` files. Corrected in Stage G (T30).
- **`User.passwordHash` nullable is the existing "social-only account" signal**
  (schema.prisma:254, comment: "credentials auth (null for social-only users)") — no
  separate `provider`/`signupSource` column exists or is needed; `Account` rows are the
  provider link.
- **Password-reset infrastructure is half-built.** `TokenType.PASSWORD_RESET`
  (schema.prisma:81) and the generic `VerificationToken` model (schema.prisma:424-438)
  already exist, but **zero application code references `PASSWORD_RESET`** — grep across
  `src/` hits only the generated Prisma enum file. Only `EMAIL_VERIFICATION` is used
  today, in `register()`/`verifyEmail()` (`auth.service.ts:59-126`, `183-224`) — this is
  the exact shape (`crypto.randomToken()` + `sha256()` hash stored, raw token only in the
  emailed link, one `$transaction`, outbox emit) the new password-reset flow will mirror.
- **Mail pipeline is real end-to-end but never renders a body.**
  `MailService.enqueue()` (`mail.service.ts`) persists an `EmailMessage` row and adds a
  BullMQ job; `MailProcessor.process()` (`mail.processor.ts:37-40`) drains it but calls
  `transport.send({ to, subject })` — **`template`/`variables` are never passed through**,
  so `MailTransport.send()`'s fallback (`mail.transport.ts:41`, `<p>${subject}</p>`) is
  all that ever ships. No template engine (Handlebars/React Email/MJML) exists in either
  app's `package.json`. `EmailMessage.template`/`.variables` columns already anticipate
  real templating (schema.prisma:449-450) — the data model is ready, the renderer isn't.
  Proven end-to-end today only as far as "a stub gets queued and marked SENT"
  (`test/mail.e2e-spec.ts`).
- **No SMTP/nodemailer path exists.** `MailTransport` (`mail.transport.ts`) only knows
  Resend (`resend` npm package, `RESEND_API_KEY`) or a dev no-op logger. mxroute is a
  plain SMTP mailbox — this is new transport code, not a config tweak.
- **Env wiring gap, pre-existing**: `RESEND_API_KEY`/`MAIL_FROM`/`MAIL_REPLY_TO` are
  documented in `prod/backend/.env.example:44-50` but **never passed through**
  `docker-compose.yml`'s `app.environment` block — unlike the neighboring OAuth vars,
  which are fully wired (`docker-compose.yml:~204-215`). Fixed alongside the new SMTP
  vars in Stage G.
- **No frontend page consumes either token type.** `next-js-boilerplate/src/app` has no
  `verify-email`, `reset-password`, or `set-password` route — confirmed by directory
  listing. Even `register()`'s already-shipped `${FRONTEND_URL}/verify-email?token=`
  link (`auth.service.ts:112`) points at a page that has never existed. The real
  (non-demo) auth forms live at `features/auth/ui/{login,register}-form.tsx`, routed
  under `app/(demos)/auth/{login,register}/page.tsx`, proxied through
  `app/api/auth/{login,register}/route.ts` (GraphQL via `graphqlFetch`, cookie-setting
  `NextResponse`) — the pattern every new BFF route/page in this phase follows.
  i18n copy lives at `messages/{en,tr}/auth/messages.json` (`form.login.*`,
  `form.register.*`, `errors.*`).
- `env.validation.ts`'s Joi schema only validates `NODE_ENV`/`PORT`
  (`allowUnknown: true`) — everything else (Redis, Resend, OAuth) is read ad-hoc via
  `ConfigService.get('X', default)` at the point of use. New SMTP vars follow the same
  ad-hoc pattern, no schema change needed.

## Decisions

- **D1 — Stage A (carried Phase 15 debt) gates Stage B+, unchanged from Phase 15's own
  ordering rationale.** A clean baseline (green tests, unified IP-change logic, real WS
  close codes) is what makes the new mail feature's own e2e coverage trustworthy instead
  of drowned in pre-existing failures. Same "close the predecessor's gaps first"
  convention Phase 14 and Phase 15 both used.
- **D2 — Username generation happens inside `loginWithOAuth()`'s existing
  `$transaction`, not a separate migration/backfill.** Base slug from the email
  local-part (lowercased, `[a-z0-9_]` only, clamped to the field's own documented
  3–30 char range); on collision, retry with a random numeric suffix using the same
  transaction client (`tx.user.findUnique`) so it's race-safe. No existing users get
  retrofitted a username — out of scope, nothing currently depends on social users
  having one.
- **D3 — `MailTransport` gains a third provider, `smtp` (via `nodemailer`), selected
  ahead of Resend when `SMTP_HOST` is set.** Selection order: `SMTP_HOST` → smtp (real
  path once mxroute creds are supplied), else `RESEND_API_KEY` → resend (kept for
  parity/tests, zero behavior change for anyone currently relying on it), else the
  existing dev no-op logger. `nodemailer` is a new dependency — there is no existing
  SMTP client anywhere in the repo to reuse.
- **D4 — A small hand-written template renderer, not a new template-engine
  dependency.** Three templates needed (`email-verification` — existing but never
  rendered, `welcome-social`, `password-reset`), sharing one HTML layout function and an
  HTML-escape helper for interpolated user strings (name/email). Matches the repo's
  existing preference for hand-rolled, dependency-free helpers over pulling in a library
  for a small, stable set of templates (see `CryptoService`'s comment-documented
  hand-rolled token/HMAC helpers).
- **D5 — One generic password-reset pair, reused by both entry points.** A single
  `AuthService.requestPasswordReset(email)` / `resetPassword(token, newPassword)` pair
  (using `TokenType.PASSWORD_RESET`, same shape as the existing email-verification flow)
  serves both: (a) a public "forgot password" mutation for anyone, and (b) the new
  social-signup welcome flow, which calls the same token-issuing helper internally right
  after user creation instead of duplicating token logic. `requestPasswordReset` always
  returns success regardless of whether the email exists (enumeration-safe, standard
  practice) and enqueues no mail for unknown addresses.
- **D6 — The welcome email fires only on true first-time social signup, never on
  relink or repeat login.** `loginWithOAuth()`'s existing `existing ? ... : ...` branch
  (`auth.service.ts:270-279`) already distinguishes "brand-new user" from "linked an
  OAuth account to an email that already existed" — the welcome email (and its
  password-reset token) is issued only in the brand-new-user case, never when linking to
  a pre-existing (already-has-a-password-or-not) account, and never on subsequent
  logins via the same provider (handled by the earlier `if (account) { ... return }`
  branch that never reaches user-creation at all).
- **D7 — Fix the frontend `verify-email` gap opportunistically (T27), don't expand
  scope beyond it.** It's the exact same "emailed link, no page to catch it" shape as
  the new `reset-password` page, cheap to build alongside it, and closes a real dead
  link `register()` has been shipping since before this phase existed. Nothing else
  adjacent (e.g. rebuilding `register`/`login` UX) is in scope.
- **D8 — `docker-compose.yml`'s missing `RESEND_*` passthrough is fixed alongside the
  new `SMTP_*` wiring (T29), not left as a separate untracked gap.** Same file, same
  block, same PR — no reason to defer a one-line-per-var fix found while already
  editing that exact block.
- **D9 — Mailpit (local SMTP catcher) is bonus/optional (T31), sized separately so it
  can be dropped without blocking the phase gate.** It directly closes
  `docs/todo/02-backend.md:53-54`'s existing "Dev mail sink" backlog item and pairs
  naturally with adding real SMTP support, but isn't required for mxroute itself to work
  in prod.

## Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day, L ≈ ≥1 day. Stage A must land and gate-pass before
Stage B+ starts new scope (D1). Stages B/C are independent of each other; D depends on
C (needs the renderer); E depends on B (username) and D (token issuance); F depends on
D/E (needs working backend endpoints); G can land any time but is easiest done
alongside C/D's own env/compose edits; H is last.

### Stage A — Phase 15 close-out (carried over, blocking prerequisite)

Unchanged from `phase15.md`'s Stages A–F — copied here verbatim (same task IDs) since
none were started. Full context/root-cause detail lives in `phase15.md` and
`phase14.md`'s "Live verification (2026-07-05)" section; not re-derived here.

- [ ] **T1 (S) — Fix `session-auth.guard.spec.ts`'s stale mock.** Add
  `extendTTL: jest.fn()` to `mockTokenStore()` (`session-auth.guard.spec.ts:39-53`).
  *Verify:* `pnpm test` — `SessionAuthGuard › authenticates a valid session` passes.
- [ ] **T2 (S) — Restore the 3 devDependencies commit `9ed659c` dropped.** Re-add
  `pino-pretty@^13.1.3`, `@suites/di.nestjs@^3.1.0`, `@suites/doubles.jest@^3.1.0` to
  `nest-js-boilerplate/package.json`'s devDependencies; `pnpm install`.
  *Verify:* `pnpm test` — `automock/user.service.spec.ts` passes (no
  `AdapterNotFoundError`); booting `AppModule` outside `NODE_ENV=production` no longer
  throws `unable to determine transport target for "pino-pretty"`.
- [ ] **T3 (S) — Delete `device-sessions.e2e-spec.ts`'s dead `prisma.session`
  references.** Remove the `prisma.session.deleteMany()` line from `clearDb()`
  (`device-sessions.e2e-spec.ts:53`); there is no `Session` Prisma model (sessions are
  Redis-only via `TokenStoreService`) and none is planned.
  *Verify:* `device-sessions.e2e-spec.ts` boots (`TestingModule.compile()` no longer
  throws) — full green depends on T2 landing too.
- [ ] **T4 (S) — Document local dev-env prerequisites for running tests outside
  Docker.** A short section (README or `docs/`) listing `DATABASE_URL`,
  `REDIS_URL`/`REDIS_HOST`/`REDIS_PORT`, `JWT_SECRET`, `TOKEN_DERIVATION_SECRET`,
  `ENCRYPTION_KEY`, `COOKIE_SECRET`, `CSRF_SECRET` pointed at `localhost` instead of
  compose service names.
  *Verify:* a fresh clone + these env vars + `pnpm test`/`pnpm test:e2e` runs without
  environment-shaped failures (infra-shaped failures are expected/fine).
- [ ] **T5 (M) — `DeviceIpMiddleware` becomes default-permissive, gated by
  `AUTH_IP_STRICT`.** On IP mismatch: log
  `{category:"exception", event:"device-change", deviceId, previousIp, newIp}`, update
  `Device.ip` via `prisma.device.update()`, call `next()`. Only `res.clearCookie` +
  throw `UnauthorizedException` when `AUTH_IP_STRICT === 'true'`.
  *Verify:* with `AUTH_IP_STRICT` unset/false, two authenticated requests from
  different IPs both succeed, exactly one `device-change` doc lands in
  `exception-logs`, `Device.ip` reflects the new IP. With `AUTH_IP_STRICT=true`, the
  second request still 401s.
- [ ] **T6 (S) — `TokenStoreService.updateFields(key, fields)`.** A narrow `HSET` onto
  a single already-known compound key (alongside `updateFieldsForUser`, not replacing
  it).
  *Verify:* unit test — write a session, call `updateFields(key, {ip:'new'})`, `read`
  reflects the new value.
- [ ] **T7 (S) — `SessionAuthGuard` step 7 calls `updateFields` after logging.**
  Right after emitting `session.ip_change`/`session.ua_change`
  (`session-auth.guard.ts:120-148`), call `tokenStore.updateFields(...)`.
  *Verify:* change IP mid-session across 3 consecutive requests; exactly **one**
  `session.ip_change` doc appears, not three.
- [ ] **T8 (S) — `realtime.gateway.ts`'s close handler reads the close code.** Change
  `ws.on('close', () => {...})` to `ws.on('close', (code: number, reason: Buffer) =>
  {...})` (`realtime.gateway.ts:152`); when `code` isn't `1000`/`1001`, emit
  `{category:"exception", event:"connection-loss", token, userId, code, reason}`.
  *Verify:* a clean tab close (`1000`) produces no `connection-loss` doc; forcibly
  killing the TCP connection produces exactly one.
- [ ] **T9 (M) — Extend `events.schema.ts`'s wire shape (additive).** Add optional
  `category: z.enum(["session","page","exception"]).optional()`,
  `event: z.string().optional()`,
  `exceptionType: z.enum([...]).optional()`, `page`, `durationMs` to
  `frontendEventSchema`.
  *Verify:* existing 55 frontend unit tests still pass; a payload using only the new
  fields validates.
- [ ] **T10 (M) — `useEventLogger.ts` emits the new shape.** `page.view`/`page.exit`
  emit `category:"page"`/`event`/`page`/`url`/(`page.exit`-only) `durationMs` at the
  top level, not nested under `metadata`. `onerror`/`onunhandledrejection` emit
  `category:"exception"`/`event:"exception"`/`exceptionType`/`message`. Keep `metadata`
  populated too (additive).
  *Verify:* navigating 3 pages then throwing an uncaught client error produces
  payloads with real top-level `category`/`exceptionType`/`durationMs`.
- [ ] **T11 (S) — `instrumentation.ts`'s `onRequestError` also logs, additively.**
  Alongside the existing `recordError()` call, log
  `{category:"exception", exceptionType:"CLIENT_REQUEST_ERROR", route, message}`.
  Don't remove `recordError()` — `/observability` still needs it.
  *Verify:* an uncaught Route Handler/Server Action error produces both the existing
  `/observability` entry and a new structured log line.
- [ ] **T12 (M) — `api/events/route.ts` logs `category`-bearing events via Pino
  instead of Kafka.** For each event: if `event.category` is
  `"session"|"page"|"exception"`, log via the per-request structured logger
  (stdout → Fluent Bit); otherwise (legacy/custom events) keep the existing
  `publishEvent()` Kafka path.
  *Verify:* navigating 3 pages produces 3 real `page-logs` documents with non-zero
  `durationMs`, sharing one `token`; an uncaught client exception produces a matching
  `exception-logs` document. `curl localhost:9200/page-logs/_count` goes from 0 to >0.
- [ ] **T13 (S) — Replace `kibana-saved-objects.ndjson`'s 2 dashboards with 3
  `search` objects.** One per category (`session-logs`, `page-logs`, `exception-logs`),
  each with real `columns`/`sort`, referencing its index-pattern via `references`.
  Delete the stray `panels` key.
  *Verify:* `POST /api/saved_objects/_import` returns `success: true,
  successCount: 8`; each search opens in Kibana and shows live documents (once T12
  lands).
- [ ] **T14 (S) — Rewrite `docs/logging.md`'s "page (frontend)" and "Kafka"
  sections to match the fixed architecture.** State plainly: session/page/exception
  events flow Pino → Fluent Bit → ES from both apps now; Kafka/`frontend-events`
  remains only for events with no `category`. Re-run all 6 sample KQL queries against
  the live stack.
  *Verify:* the doc's own sample queries return real documents, not
  `index_not_found_exception`, checked by actually running them.

### Stage B — Username generation for social signups

- [ ] **T15 (M) — `UsernameService.generate(seed, tx)` in
  `nest-js-boilerplate/src/auth/username.service.ts`.** Derives a base slug from the
  email local-part (lowercase, strip to `[a-z0-9_]`, clamp to the field's own
  documented 3–30 char range, pad short bases), then resolves collisions by retrying
  with a random numeric suffix (bounded attempts, e.g. 5) via
  `tx.user.findUnique({ where: { username } })` on the **same transaction client**
  passed in, so concurrent signups can't race each other into a duplicate.
  *Verify:* unit test — `"jane.doe@gmail.com"` → a valid `janedoe`-shaped slug;
  forcing a collision (pre-seed a user with the expected base slug) yields a distinct
  suffixed username on the second call.
- [ ] **T16 (S) — Wire into `AuthService.loginWithOAuth()`'s new-user branch.** Call
  `this.usernames.generate(email, tx)` inside the existing `tx.user.create()`
  (`auth.service.ts:271-279`) and include the result in `data`.
  *Verify:* e2e — a fresh OAuth login (profile with no matching `Account`/`User`)
  creates a `User` row with a non-null, unique `username`.

### Stage C — Mail transport: SMTP (mxroute) + real template rendering

- [ ] **T17 (M) — Add `nodemailer`/`@types/nodemailer`; extend `MailTransport`
  (`mail.transport.ts`) with an SMTP branch.** Selection order: `SMTP_HOST` set → smtp
  (`nodemailer.createTransport({host, port, secure, auth:{user,pass}})`,
  `sendMail(...)`, map to `{provider:'smtp', messageId: info.messageId}`); else
  `RESEND_API_KEY` → resend (unchanged); else dev no-op (unchanged).
  *Verify:* existing `mail.transport.spec.ts`'s Resend/dev cases pass unchanged
  (they never set `SMTP_HOST`); new cases (mocking `nodemailer.createTransport`)
  assert an SMTP send call, correct provider mapping, and a thrown-error → `FAILED`
  case mirroring the existing Resend one.
- [ ] **T18 (M) — Hand-written template renderer,
  `nest-js-boilerplate/src/mail/templates/render.ts`.** No new template-engine
  dependency — plain functions returning `{subject, html, text}` from `variables`,
  sharing one `layout(bodyHtml)` wrapper (basic inline CSS, app name/logo placeholder)
  and an HTML-escape helper for interpolated strings (name/email). Implements
  `'email-verification'` (existing template name, finally rendered for real instead of
  the bare-subject stub) plus `'welcome-social'` and `'password-reset'` (bodies from
  T25).
  *Verify:* unit test per template — known variables produce HTML containing the
  expected link/button; a name containing `<script>` renders HTML-escaped, not
  executed.
- [ ] **T19 (S) — `MailProcessor.process()` renders before sending.** Call the T18
  renderer with `email.template`/`email.variables`, pass the resulting
  `{html, text}` (not just `{to, subject}`) into `transport.send()`
  (`mail.processor.ts:37-40`).
  *Verify:* `mail.e2e-spec.ts`'s existing assertions still pass; a new/updated
  assertion spies on `MailTransport.send` and confirms `html` contains the real
  verification link, not the bare-subject stub.

### Stage D — Password-reset / set-password backend flow

- [ ] **T20 (M) — `AuthService.requestPasswordReset(email)`.** Look up the user;
  if found, issue a `VerificationToken{type:'PASSWORD_RESET'}` (same
  `crypto.randomToken()`/`sha256()` shape as `register()`), enqueue the
  `'password-reset'` template. **Always resolve to the same success shape** regardless
  of whether the email exists (enumeration-safe) — enqueue nothing for unknown emails.
  Factor the token-issuing half into a small private helper so Stage E can reuse it.
  *Verify:* unit test — known email enqueues mail + creates a token; unknown email
  returns the identical success response and enqueues nothing (`mail.enqueue` not
  called).
- [ ] **T21 (M) — `AuthService.resetPassword(rawToken, newPassword)`.** Hash-lookup
  the token; validate `type==='PASSWORD_RESET' && !consumedAt && expiresAt > now`;
  hash the new password (`hash()` from `@node-rs/argon2`, same as `register()`);
  update `User.passwordHash`/`passwordSetAt`; mark token consumed; emit an outbox
  event — all in one `$transaction` (mirrors `verifyEmail()`'s shape,
  `auth.service.ts:183-224`).
  *Verify:* unit test — a valid token lets a subsequent `login()` with the new
  password succeed; expired/consumed/wrong-type tokens throw `UnauthorizedException`;
  a token can't be used twice.
- [ ] **T22 (S) — `AuthResolver` gains `requestPasswordReset`/`resetPassword`
  mutations.** New DTOs under `dto/` following existing conventions
  (`login.input.ts`/`register.input.ts`), reusing `RegisterInput`'s password-strength
  validators for the new password.
  *Verify:* e2e — GraphQL round-trip for both mutations in `auth.e2e-spec.ts`,
  matching `register`/`login`'s existing coverage shape.
- [ ] **T23 (S) — BFF routes**
  `next-js-boilerplate/src/app/api/auth/request-password-reset/route.ts` and
  `.../reset-password/route.ts`, proxying the two new mutations — same shape as
  `app/api/auth/register/route.ts` (JSON body validation, `graphqlFetch`,
  `graphqlErrorBody` mapping to `{statusCode,exc,msg,key}`).
  *Verify:* `curl` both routes against the running stack; a malformed body returns
  the real HTTP status (not the 200-on-error bug Phase 13 already fixed elsewhere).

### Stage E — Welcome-email trigger for social signups

- [ ] **T24 (M) — Fire the welcome email from `loginWithOAuth()`'s new-user branch,
  off the request path.** After the `$transaction` (`auth.service.ts:267-300`)
  commits, and only when `!existing` (a truly new, social-only account — never on
  relink to an existing email, never on a repeat login via the same provider, per D6),
  issue a `PASSWORD_RESET` token via T20's shared helper and
  `this.mail.enqueue({ template: 'welcome-social', variables: { username, name, email,
  url } })` — mirrors `register()`'s existing "off the request path" comment/pattern
  (`auth.service.ts:111-119`).
  *Verify:* e2e — a fresh OAuth login (no matching `Account`) produces exactly one
  queued `EmailMessage{template:'welcome-social'}` plus a valid `PASSWORD_RESET`
  token; a second login via the same provider identity sends none; linking the same
  provider to an **existing** credentials-registered email also sends none.
- [ ] **T25 (S) — Write the `'welcome-social'` and `'password-reset'` copy** (T18's
  renderer): welcome — "Welcome to `<App>` — your username is **{username}**. Set
  your password: {url}"; reset — "Reset your password: {url}". Both through the
  shared layout.
  *Verify:* render both to a static HTML file and open in a browser (or send via the
  dev/Mailpit transport) — confirm they don't look broken and the button/link is
  present and correct.

### Stage F — Frontend pages

- [ ] **T26 (M) — New `reset-password` page + form.**
  `features/auth/ui/reset-password-form.tsx` + a route alongside the existing
  `(demos)/auth/{login,register}` pages: reads `?token=` from the URL, a new-password
  field (+ confirm), calls T23's BFF route, success/error states, redirects to login
  on success. New i18n keys under `auth.form.resetPassword.*`/`auth.errors.*` in both
  `messages/en/auth/messages.json` and `messages/tr/auth/messages.json`, following the
  existing `form.login.*`/`form.register.*` shape.
  *Verify:* manual browser check — mint a real token via T20/T24, submit a new
  password, then log in with it.
- [ ] **T27 (S, opportunistic per D7) — Build the pre-existing, never-built
  `verify-email` page.** `register()` has been emailing a
  `${FRONTEND_URL}/verify-email?token=` link since before this phase
  (`auth.service.ts:112`) with no page to catch it. Same token-consuming shape as T26;
  small enough to build alongside it.
  *Verify:* manual — register a credentials account, click the emailed link, confirm
  `verifyEmail` fires and the account becomes `ACTIVE`.

### Stage G — Env/compose wiring + docs corrections

- [ ] **T28 (S) — Document `SMTP_HOST`/`SMTP_PORT`/`SMTP_SECURE`/`SMTP_USER`/
  `SMTP_PASS`** in `prod/backend/.env.example`'s "Email" block (mxroute values go
  here) and root `.env.example`, following the existing commented-optional style used
  for the OAuth block.
  *Verify:* `docker compose config` renders the new vars with their `${VAR:-}`
  defaults.
- [ ] **T29 (S) — Fix the pre-existing `docker-compose.yml` gap (D8):** the `app`
  service never actually passes `RESEND_API_KEY`/`MAIL_FROM`/`MAIL_REPLY_TO` through
  despite being documented. Add those plus the new `SMTP_*` vars to `app.environment`,
  same `${VAR:-default}` pattern as the neighboring OAuth block.
  *Verify:* rebuild the `app` container; confirm the env vars are populated inside it.
- [ ] **T30 (S) — Correct `docs/todo/02-backend.md`.** Line 27-29's "Social auth
  providers... via Passport strategies" is stale (already implemented, differently)
  — reword or strike it. Line 53-54's "Dev mail sink... add Mailpit" — mark done if
  T31 lands, otherwise leave as an explicit follow-up.
  *Verify:* doc reads accurately against the code as of this phase.
- [ ] **T31 (S, optional/bonus per D9) — Add a `mailpit` service to
  `docker-compose.yml`** (SMTP catcher on 1025, web UI on 8025) with a dev-default
  `SMTP_HOST=mailpit` so local runs never hit mxroute by accident; prod
  compose/env overrides point at the real mxroute host.
  *Verify:* send a test email locally, see it land in Mailpit's web UI.

### Stage H — Live control run (phase gate)

- [ ] **T32 (M) — Live control run against a freshly rebuilt stack.** A real
  Google/GitHub OAuth login for a brand-new email produces a `User` with a generated
  `username`; a `welcome-social` email is queued and actually sent (Mailpit locally, or
  a real mxroute-delivered inbox if creds are configured); the emailed reset-password
  link works end-to-end (set password → log in with credentials); a second login via
  the same provider does not re-send the welcome email; `AUTH_IP_STRICT`/WS
  close-code/frontend-event-pipe/Kibana items from Stage A are re-checked live too
  (they share the same rebuilt containers).
  *Verify:* every item above passes against the rebuilt stack, browser-driven where
  relevant (not just `curl`), per this project's established convention.

## Verify loop (phase gate)

- [ ] **Stage A (Phase 15 debt) fully closed:** all of T1–T14 pass; `phase15.md`'s
  own checkboxes get flipped based on these real results (per the established
  "tracker lags reality" lesson — don't just trust this file either without
  cross-checking `git log`).
- [ ] **Username generation:** every new social signup gets a unique, valid
  `username`; no existing user is touched.
- [ ] **Mail actually renders and sends:** all three templates
  (`email-verification`, `welcome-social`, `password-reset`) produce real HTML via
  the SMTP (or dev/Mailpit) transport — not the old bare-subject stub.
- [ ] **Welcome-email trigger is precise:** fires exactly once per true social
  signup; never on relink, never on repeat login.
- [ ] **Password-reset flow works round-trip:** both the public "forgot password"
  entry point and the welcome-email's implicit "set your first password" entry point
  lead to a working login with the new password; expired/reused/wrong-type tokens are
  rejected.
- [ ] **`verify-email` dead link fixed:** the pre-existing `register()` email link
  now resolves to a working page.
- [ ] **Env/compose gap closed:** `RESEND_*` and the new `SMTP_*` vars are both
  documented and actually wired into `docker-compose.yml`.
- [ ] **Docs corrected:** `docs/todo/02-backend.md`'s stale social-auth/mail-sink
  entries match reality.
- [ ] **No regressions:** Stage A's already-passing surface (T1–T14) still passes
  after Stage B–G's changes to shared `auth.service.ts`/mail files.
- [ ] **Live control run** (T32) passes against freshly rebuilt containers before
  marking this phase complete.

## Phase queue (updated 2026-07-05)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1–4 (done) | See [phase4.md](phase4.md) queue table | — |
| 5 (skipped-renumbered) | — reserved — | — |
| 6 (done, re-scoped) | Realtime consolidation: socket, renew protocol, emit points | [phase6.md](phase6.md) |
| 7 (done) | Page-claim realtime: presence in Redis, page-scoped push, transport fixes, hardening | [phase7.md](phase7.md) |
| 8 (done) | Realtime close-out: bounded conversations SQL, notification index, find-friends cache | [phase8.md](phase8.md) |
| 9 (done, 14/15 code tasks) | Realtime UX close-out: transport deadlock, claim keying, thread order, receipts, header routing, chat-room switching, push completion | [phase9.md](phase9.md) |
| 10 (mostly landed) | Realtime UX round 2: DM unread everywhere, live feed renew, chat-room presence + stability, transport-state UX — T11 broken, T4/T15 carried to 11 | [phase10.md](phase10.md) |
| 11 (parked — plan only, tasks open) | Phase 10 remediation: post-detail live-renew fix (allowlist + context churn), close-out bookkeeping, verification gate, residual UX — deferred in favor of Phase 12, resume after | [phase11.md](phase11.md) |
| 12 (implemented, not gate-clean until Phase 14/T4) | Exception handling: unified backend error contract, frontend `exceptionHandler` + i18n resolver, dedicated connection-unstable + access-denied pages, loading skeletons, real auth forms | [phase12.md](phase12.md) |
| 13 (implemented, not gate-clean until Phase 15/T15) | Phase 12 remediation + notification/DM unread count renewal hardening + sender display-name consistency + chat scroll-to-bottom button | [phase13.md](phase13.md) |
| 14 (implemented, not gate-clean until Phase 15) | Phase 13 close-out + comprehensive Kibana activity logging: session/page/exception categories — 7 of 20 tasks confirmed broken live, remediated in Phase 15 | [phase14.md](phase14.md) |
| 15 (Stage G/T15 done, Stages A–F not started) | Phase 14 remediation: IP-change unification, WS close codes, frontend event pipe, Kibana saved searches, docs accuracy, Phase 12/13 live control run, test debt — Stages A–F carried whole into Phase 16's Stage A | [phase15.md](phase15.md) |
| **16 (this file)** | Phase 15 close-out (Stage A, carried) + welcome-email & password-reset for social signups: username generation, SMTP (mxroute) transport, real mail templates, generic password-reset flow, frontend set-password/verify-email pages, env/compose/docs cleanup | this file |
| 17 (was 16) | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7+9+10 realtime loops | [todo/01](../todo/01-stack-integration.md) |
| 18 (was 17) | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../todo/01-stack-integration.md) |
| 19 (was 18) | Backend warts + compose hardening + k8s | [todo/02](../todo/02-backend.md), [todo/04](../todo/04-devops.md) |
| 20 (was 19) | Backlog: OTel/metrics, remaining push polish, seed, publishing, backups (social auth item removed — implemented, see Phase 16) | [todo/02](../todo/02-backend.md)–[05](../todo/05-docs-maintenance.md) |

<!-- Downstream phases 16-19 (from phase15.md's own queue table) were renumbered +1
(now 17-20) to insert this Phase 15-close-out + welcome-email phase, same pattern
Phase 14 and Phase 15 themselves used. -->
