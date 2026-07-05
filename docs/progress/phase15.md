# Phase 15 — Phase 14 remediation: IP-change routing, WS close codes, frontend event pipe, Kibana searches, test debt

> Execution tracker for the fifteenth phase of the [stack roadmap](../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-05 · Status: **not started**. Planning only — no code written for
> this tracker yet, per the project's "plan phase N = write only phaseN.md" convention.

## Relationship to Phase 14

Phase 14 (commits `4c0ad50`…`c73c38b`) landed all 8 stages as real commits and a live
audit on 2026-07-05 (recorded in `phase14.md`'s "Live verification" section) confirmed
most of it works — but 7 items are real, live-reproduced gaps, not just tracker
drift: **T3, T11, T13, T14, T15, T19, T20**. This phase closes all of them out, plus a
separate batch of pre-existing test debt uncovered while actually running the test
suites for the first time (per this project's convention — see `phase14.md`'s own
Stage A precedent for absorbing a predecessor's remediation before starting new scope).

None of Phase 15's fixes require new infrastructure — everything needed (Fluent Bit
categorized routing, the ES index template, `AUTH_IP_STRICT`, the BFF's structured
logger) already exists and works after Phase 14's Stage B/G fixes.

## Survey (2026-07-05) — running the test suites for the first time

Neither test suite had ever actually been run against current HEAD before this. Doing
so now surfaces real, currently-broken things, none of which were introduced by Phase
14 — all pre-date it (confirmed via `git log`/`git blame`):

- **Backend unit tests (`pnpm test`, `nest-js-boilerplate`): 145/146 pass**, but only
  after two local-environment fixes were needed just to get a clean run (`DATABASE_URL`
  unset breaks the `prisma generate` postinstall hook; the stale `.prisma/client`
  output then breaks every spec that imports `PrismaService`) — neither is a repo bug,
  just missing local dev-env docs.
  - `session-auth.guard.spec.ts` — `TypeError: this.tokenStore.extendTTL is not a
    function`. The guard's step 9 (`session-auth.guard.ts:165`) calls
    `tokenStore.extendTTL()`, added in commit `5b1e725` (predates Phase 14 by several
    phases) — the spec's `mockTokenStore()` factory (`session-auth.guard.spec.ts:39-53`)
    implements `buildKey`/`read`/`write`/`revoke` but was never updated to add
    `extendTTL`. A stale mock, not a Phase 14 regression.
  - `automock/user.service.spec.ts` — `AdapterNotFoundError: No compatible adapter
    found (code ER020)`, `Jest worker encountered 4 child process exceptions`.
    `@suites/di.nestjs` and `@suites/doubles.jest` were removed from
    `package.json`'s devDependencies by commit `9ed659c` ("Add fallow code quality
    checks + clean up dead code") — but they're still physically required by
    `@suites/unit`'s adapter resolution at runtime, and pnpm's strict (non-hoisted)
    linking means a package absent from `package.json` gets no top-level
    `node_modules` symlink even if some other package still depends on it
    transitively. Same commit also silently dropped `pino-pretty` — needed by
    `nestjs-pino`'s dev-mode (non-`NODE_ENV=production`) transport, which breaks
    booting the full `AppModule` in e2e tests (`unable to determine transport target
    for "pino-pretty"`), and `device-sessions.e2e-spec.ts` calls
    `prisma.session.deleteMany()` against a `Session` model that **does not exist**
    in `prisma/schema.prisma` — sessions are Redis-only (`TokenStoreService`), a
    schema-vs-test mismatch that pre-dates Phase 14 too (the Redis-session design was
    Phase 3; this test file was seemingly never updated for it, or was written on
    spec before the design changed).
- **Frontend unit tests (`pnpm test`, `next-js-boilerplate`): 55/55 pass, clean.**
  But: `phase14.md`'s own Survey section (line ~90) claims the Kafka event pipeline is
  "genuine, tested infra (`events.schema.test.ts`, `event-logger.test.ts`) — not a
  stub." **These files don't exist and never have** — confirmed via
  `git log --all --diff-filter=A` across the whole repo history. Zero test coverage
  ever existed for `event-logger.ts`/`events.schema.ts`, which is very likely *why*
  T14/T15's incomplete rewiring (below) went unnoticed through Phase 14's own commits.
- **Backend e2e tests, Phase-14-relevant subset** (`auth`, `session`,
  `device-sessions`, `csrf`, `exception-filters`, `logging`, `ws*`): blocked from a
  clean signal by the `pino-pretty`/`Session`-model issues above before any
  Phase-14-specific e2e regression could even be isolated. Getting a real e2e signal
  on the Stage D/E/F session/exception/WS code is itself blocked on Stage A below.

The 7 outstanding Phase 14 items (full root-cause detail already recorded in
`phase14.md`'s "Live verification (2026-07-05)" section — not re-derived here):

- **T11** — `SessionAuthGuard`'s new soft "log IP-change, then continue" logic
  (`session-auth.guard.ts:120-138`) never runs for real traffic: `DeviceIpMiddleware`
  (pre-existing, global `app.use()` in `main.ts:41-42`, runs before any guard)
  independently hard-401s on the same IP mismatch first. Also, even in isolation the
  guard's check never updates the stored baseline, so it would refire every request.
- **T13** — `realtime.gateway.ts:152`'s `ws.on('close', () => {...})` discards the
  native `(code, reason)` args; `connection-loss` is never emitted.
- **T14/T15** — `useEventLogger.ts` still emits the pre-Phase-14 `eventType`/nested
  `metadata` shape over the unchanged Kafka pipe; `category`/`exceptionType` never
  exist on the wire, so `page-logs`/`exception-logs` never receive any
  frontend-originated document. `instrumentation.ts`'s `onRequestError` was never
  touched at all (still only calls `recordError()`).
- **T19** — `kibana-saved-objects.ndjson`'s 2 `dashboard` objects (session, exception
  — no page) have empty `panelsJSON` and a stray `panels` key that makes the whole
  import 400 against Kibana 8.15's strict `.kibana` mapping.
- **T20** — `docs/logging.md`'s "page (frontend)" section documents the aspirational
  architecture, contradicts itself two lines later, and its own sample `page-logs`
  query 404s against the live index.
- **T3** (carried from Phase 13, never done in Phase 14 either) — no live control run
  of Phase 12/13's UX regressions (count renewal, display-name reload,
  scroll-to-bottom) has ever happened against a rebuilt stack.

## Decisions

- **D1 — `DeviceIpMiddleware` and `SessionAuthGuard`'s IP-change check share one
  policy flag (`AUTH_IP_STRICT`), not two.** Two independent hard/soft IP checks on
  the same signal is the bug, not just the middleware's placement. Rather than
  removing the pre-existing device-level check (a real security control, catching
  unauthenticated/stale-cookie traffic the guard never sees), make it default-permissive
  (log `category:"exception", event:"device-change"`, update `Device.ip`, continue) —
  matching D6's original "log then continue" intent — and hard-401 only when
  `AUTH_IP_STRICT=true`, exactly like the guard already does. This is a one-flag,
  two-call-site change, not a redesign.
- **D2 — Session-hash IP/UA baseline update needs a new `TokenStoreService` method.**
  Nothing currently writes a single field back onto an existing session hash (the
  closest existing method, `updateFieldsForUser`, is a different bulk-update-by-user
  path used for role/tier changes). Add a narrow `updateFields(key, fields)` that
  `HSET`s onto the exact compound key already read in the same request — cheapest
  correct fix, reuses the existing Redis pipeline pattern.
- **D3 — Frontend `category`-based events are logged via the BFF's existing Pino
  logger, not published to Kafka.** This is Phase 14's own D1, just never actually
  implemented for T14/T15. `api/events/route.ts` already has a per-request structured
  logger (`withLogging`/`log`) that reaches stdout → Fluent Bit → ES today (confirmed
  live for the `"events accepted"` summary line) — extending it to log once per
  `category:"session"|"page"|"exception"` event, instead of the Kafka publish, is the
  direct fix. Kafka publish is kept for anything that *isn't* one of those 3
  categories (T6's "custom events" carve-out) so nothing regresses for free-form
  `action.click`-style telemetry.
- **D4 — `events.schema.ts` gets new fields added, not replaced.** Add
  `category`/`event`/`exceptionType`/`page`/`durationMs`/`token` as optional fields
  alongside the existing `eventType`/`metadata` shape, rather than a breaking rename.
  Existing custom-event producers (if any exist beyond `useEventLogger`) keep working
  unchanged; `useEventLogger` is updated to populate the new fields for its 3 emit
  sites.
- **D5 — Kibana: 3 `search`-type saved objects, not 2 `dashboard`s.** Matches T19's
  actual ask ("one saved search per category"). Each references its own index-pattern
  (already-imported `session-logs`/`page-logs`/`exception-logs`) with a sane default
  column set (`@timestamp`, `event`, `token`, `userId`, `deviceType`, plus
  `exceptionType` for the exception one) and `@timestamp` desc sort.
- **D6 — Test debt (Stage A) is fixed before Phase-14-specific remediation
  (Stage B+), same "close out the predecessor's gaps first" convention Phase 14's own
  Stage A used for Phase 13.** A clean, green baseline is what makes Stage B–G's
  fixes independently verifiable instead of drowned in unrelated failures.
- **D7 — `device-sessions.e2e-spec.ts`'s dead `prisma.session` calls are deleted, not
  worked around.** There is no `Session` Prisma model and none is planned — sessions
  are intentionally Redis-only (`TokenStoreService`). The two `deleteMany()` lines
  referencing it in `clearDb()` are simply removed; whatever DB-level cleanup the test
  actually needs (`Device`, `VerificationToken`, etc.) is already present in the same
  block.

## Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day, L ≈ ≥1 day. Stage A must land and gate-pass before
Stage B+ starts new scope (D6). Stages B/C/D/E are independent of each other and can
land in any order once Stage A is clean. F depends on D (docs describe the fixed
architecture). G is last, same as Phase 14's own Stage H/verify-loop ordering.

### Stage A — Test debt (blocking prerequisite)

- [ ] **T1 (S) — Fix `session-auth.guard.spec.ts`'s stale mock.** Add
  `extendTTL: jest.fn()` to `mockTokenStore()` (`session-auth.guard.spec.ts:39-53`).
  *Verify:* `pnpm test` — `SessionAuthGuard › authenticates a valid session` passes.
- [ ] **T2 (S) — Restore the 3 devDependencies commit `9ed659c` dropped.** Re-add
  `pino-pretty@^13.1.3`, `@suites/di.nestjs@^3.1.0`, `@suites/doubles.jest@^3.1.0` to
  `nest-js-boilerplate/package.json`'s devDependencies; `pnpm install`.
  *Verify:* `pnpm test` — `automock/user.service.spec.ts` passes (no
  `AdapterNotFoundError`); booting `AppModule` outside `NODE_ENV=production` (i.e. any
  e2e spec) no longer throws `unable to determine transport target for "pino-pretty"`.
- [ ] **T3 (S) — Delete `device-sessions.e2e-spec.ts`'s dead `prisma.session`
  references.** Remove the `prisma.session.deleteMany()` line from `clearDb()`
  (`device-sessions.e2e-spec.ts:53`); confirm no other spec in the file references a
  `Session` model.
  *Verify:* `device-sessions.e2e-spec.ts` boots (`TestingModule.compile()` no longer
  throws) — full green depends on T2 (pino-pretty) landing too.
- [ ] **T4 (S) — Document the local dev-env prerequisites for running tests outside
  Docker.** A short section (README or `docs/`) listing `DATABASE_URL`,
  `REDIS_URL`/`REDIS_HOST`/`REDIS_PORT`, `JWT_SECRET`, `TOKEN_DERIVATION_SECRET`,
  `ENCRYPTION_KEY`, `COOKIE_SECRET`, `CSRF_SECRET` — the dev defaults already baked
  into `docker-compose.yml`'s `app` service — pointed at `localhost` instead of
  compose service names.
  *Verify:* a fresh clone + these env vars + `pnpm test`/`pnpm test:e2e` runs without
  environment-shaped failures (infra-shaped failures — no Postgres/Redis running —
  are expected and fine).

### Stage B — T11 remediation: unify IP-change detection

- [ ] **T5 (M) — `DeviceIpMiddleware` becomes default-permissive, gated by
  `AUTH_IP_STRICT`.** On IP mismatch: log
  `{category:"exception", event:"device-change", deviceId, previousIp, newIp}`
  (matches T11's originally-specified event shape for the device side), update
  `Device.ip` via `prisma.device.update()`, call `next()`. Only `res.clearCookie` +
  throw `UnauthorizedException` when `config.get('AUTH_IP_STRICT') === 'true'`.
  *Verify:* with `AUTH_IP_STRICT` unset/false, two authenticated requests from
  different IPs both succeed (200), exactly one `device-change` doc lands in
  `exception-logs`, and `Device.ip` in Postgres reflects the new IP afterward. With
  `AUTH_IP_STRICT=true`, the second request 401s as it does today.
- [ ] **T6 (S) — `TokenStoreService.updateFields(key, fields)`.** A narrow `HSET`
  onto a single already-known compound key (alongside the existing
  `updateFieldsForUser` bulk-by-user method, not replacing it).
  *Verify:* unit test — write a session, call `updateFields(key, {ip: 'new'})`, `read`
  reflects the new value.
- [ ] **T7 (S) — `SessionAuthGuard` step 7 calls `updateFields` after logging.** Right
  after emitting `session.ip_change`/`session.ua_change`
  (`session-auth.guard.ts:120-148`), call
  `tokenStore.updateFields(compoundKey, {ip: reqIp})` /
  `{userAgent: reqUa}` respectively.
  *Verify:* per D6/T11's own spec — change IP mid-session across 3 consecutive
  requests from the new IP; exactly **one** `session.ip_change` doc appears, not
  three.

### Stage C — T13 remediation: WS close code

- [ ] **T8 (S) — `realtime.gateway.ts`'s close handler reads the close code.** Change
  `ws.on('close', () => {...})` to `ws.on('close', (code: number, reason: Buffer) =>
  {...})` (`realtime.gateway.ts:152`). Keep the existing unconditional
  `ws.disconnect` log; additionally, when `code` is not a clean-close code (`1000`
  Normal Closure or `1001` Going Away), emit
  `{category:"exception", event:"connection-loss", token, userId, code, reason:
  reason?.toString()}`.
  *Verify:* per T13's own spec — a clean tab close (client sends `1000`) produces no
  `connection-loss` doc; forcibly killing the TCP connection (e.g. blocking the port
  mid-session) produces exactly one.

### Stage D — T14/T15 remediation: frontend page/exception events into the real pipe

- [ ] **T9 (M) — Extend `events.schema.ts`'s wire shape (additive, D4).** Add optional
  `category: z.enum(["session","page","exception"]).optional()`,
  `event: z.string().optional()`,
  `exceptionType: z.enum(["CLIENT_UNHANDLED_ERROR","CLIENT_UNHANDLED_REJECTION","CLIENT_REQUEST_ERROR"]).optional()`,
  `page: z.string().optional()`, `durationMs: z.number().optional()` to
  `frontendEventSchema`.
  *Verify:* existing 55 frontend unit tests still pass; a payload using only the new
  fields validates.
- [ ] **T10 (M) — `useEventLogger.ts` emits the new shape.** `page.view`/`page.exit`
  emit `category:"page"`, `event`, `page` (route pattern from `usePathname()`), `url`,
  and (`page.exit` only) top-level `durationMs` — not nested under `metadata`.
  `onerror`/`onunhandledrejection` emit `category:"exception"`, `event:"exception"`,
  `exceptionType:"CLIENT_UNHANDLED_ERROR"` / `"CLIENT_UNHANDLED_REJECTION"`, `message`.
  Keep `metadata` populated too (stack/filename/lineno — additive, don't remove
  existing fields any current consumer might read).
  *Verify:* navigating 3 pages then throwing an uncaught client error produces
  payloads (inspect via `eventLogger.subscribe()` in a test, or the network payload)
  with real top-level `category`/`exceptionType`/`durationMs`.
- [ ] **T11 (S) — `instrumentation.ts`'s `onRequestError` also logs, additively.**
  Alongside the existing `recordError()` call, log (via the same server-side logger
  `route.ts` uses, or a shared helper) `{category:"exception",
  exceptionType:"CLIENT_REQUEST_ERROR", route: context.routePath, message}`. Per T15,
  don't remove `recordError()` — the `/observability` demo still needs it.
  *Verify:* an uncaught Route Handler/Server Action error produces both the existing
  `/observability` entry and a new structured log line with `exceptionType`.
- [ ] **T12 (M) — `api/events/route.ts` logs `category`-bearing events via Pino
  instead of Kafka (D3).** For each event in the enriched batch: if `event.category`
  is `"session"|"page"|"exception"`, call `log.info({...enriched, category, event,
  ...}, event.event ?? event.eventType)` (server-side structured logger, reaches
  stdout → Fluent Bit); otherwise (no `category`, i.e. legacy/custom events) keep the
  existing `publishEvent(TOPIC, ...)` Kafka path per T6. The summary
  `log.info({count, ...}, "events accepted")` line stays as-is in addition.
  *Verify:* per the Phase 14 phase gate's own unmet requirement — navigating 3 pages
  produces 3 real `page-logs` documents (not `frontend-events`) with non-zero
  `durationMs` on the non-active ones, all sharing one `token`; an uncaught client
  exception produces a matching `exception-logs` document with `exceptionType`.
  `curl localhost:9200/page-logs/_count` goes from the current 0 to >0.

### Stage E — T19 remediation: Kibana saved searches

- [ ] **T13 (S) — Replace `kibana-saved-objects.ndjson`'s 2 dashboards with 3
  `search` objects (D5).** One per category (`session-logs`, `page-logs`,
  `exception-logs`), each with a real `columns`/`sort` in
  `kibanaSavedObjectMeta.searchSourceJSON`, referencing its index-pattern via
  `references`. Delete the stray `panels` key entirely (it was never valid).
  *Verify:* `POST /api/saved_objects/_import` returns `success: true`,
  `successCount: 8` (5 index-patterns + 3 searches, 0 errors); each of the 3 searches
  opens in the Kibana UI and shows live documents (once Stage D lands for the page/
  exception ones).

### Stage F — T20 remediation: docs accuracy

- [ ] **T14 (S) — Rewrite `docs/logging.md`'s "page (frontend)" and "Kafka" sections
  to match the fixed architecture (post-Stage D).** State plainly:
  session/page/exception events flow Pino → Fluent Bit → ES from *both* apps now;
  Kafka/`frontend-events` remains only for events with no `category` (T6). Re-run all
  6 sample KQL queries from `docs/logging.md` against the live stack and confirm each
  returns real documents, not `index_not_found_exception`.
  *Verify:* the doc's own claims and its own sample queries agree with the live
  stack, checked by actually running them, not read.

### Stage G — T3 remediation: Phase 12/13 live control run (carried over)

- [ ] **T15 (M) — Live control run against a freshly rebuilt stack** (browser-driven,
  not `curl`): count renewal (a DM/notification arriving while on an unrelated page
  updates the bell without navigating away; poll-floor self-heals after a stalled
  WS), display-name reload (a null-`name` friend, reload `/messages`, no bare "?"),
  scroll-to-bottom (scroll up, receive a message, no yank, button appears and works),
  plus Phase 12's original 8 lettered findings' verify steps.
  *Verify:* every item above passes against the rebuilt stack. This closes out
  `phase13.md`'s 2 remaining unchecked boxes and `phase14.md`'s own T3.

## Verify loop (phase gate)

- [ ] **Test debt closed:** `pnpm test` is fully green in both apps; the
  Phase-14-relevant e2e subset (`auth`, `session`, `device-sessions`, `csrf`,
  `exception-filters`, `logging`, `ws*`) boots and passes.
- [ ] **T11 fixed, live:** IP change mid-session logs exactly one `device-change` (or
  `ip_change`) doc and the request still succeeds (default policy); `AUTH_IP_STRICT=true`
  still hard-401s.
- [ ] **T13 fixed, live:** an abrupt WS kill produces a `connection-loss` doc; a clean
  close doesn't.
- [ ] **T14/T15 fixed, live:** 3-page navigation → 3 real `page-logs` docs with
  `durationMs`; a frontend exception → an `exception-logs` doc with `exceptionType`.
  Matches the exact phase-gate line Phase 14 shipped unmet.
- [ ] **T19 fixed, live, via Kibana (not `curl`):** all 3 new saved searches import
  clean and show documents in the Kibana UI.
- [ ] **T20 fixed:** `docs/logging.md`'s 6 sample queries all return real results
  against the live stack.
- [ ] **T3/Phase 13 close-out:** the live control run passes; `phase13.md`'s and
  `phase14.md`'s remaining unchecked boxes get flipped based on these real results.
- [ ] **No regressions:** Phase 14's already-confirmed-working surface (T1/T2/T4/T5/
  T7-T10/T12/T16-T18 per `phase14.md`'s Live verification section) still passes after
  Stage B/C/D's changes to shared guard/gateway/route files.
- [ ] **Live control run** against freshly rebuilt containers before marking this
  phase complete, per this project's established convention.

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
| 14 (implemented, not gate-clean until Phase 15) | Phase 13 close-out + comprehensive Kibana activity logging: session/page/exception categories — 7 of 20 tasks (T3, T11, T13, T14, T15, T19, T20) confirmed broken live, remediated here | [phase14.md](phase14.md) |
| **15 (this file)** | Phase 14 remediation: unify IP-change detection (T11), WS close codes (T13), frontend event pipe onto Fluent Bit (T14/T15), Kibana saved searches (T19), docs accuracy (T20), Phase 12/13 live control run (T3), plus test debt found while actually running the suites for the first time | this file |
| 16 (was 15) | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7+9+10 realtime loops | [todo/01](../todo/01-stack-integration.md) |
| 17 (was 16) | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../todo/01-stack-integration.md) |
| 18 (was 17) | Backend warts + compose hardening + k8s | [todo/02](../todo/02-backend.md), [todo/04](../todo/04-devops.md) |
| 19 (was 18) | Backlog: OTel/metrics, remaining push polish, social auth, seed, publishing, backups | [todo/02](../todo/02-backend.md)–[05](../todo/05-docs-maintenance.md) |

<!-- Downstream phases 15-18 were renumbered +1 (now 16-19) to insert this Phase 14
remediation phase, same pattern Phase 14 itself used for Phase 13. -->
