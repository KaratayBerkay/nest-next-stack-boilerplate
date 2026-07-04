# Phase 14 — Phase 13 close-out + comprehensive Kibana activity logging (session/page/exception)

> Execution tracker for the fourteenth phase of the [stack roadmap](../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-04 · Status: **not started**. Planning only — no code written
> for this tracker yet, per the project's "plan phase N = write only phaseN.md"
> convention.

## Relationship to Phase 13

Phase 13 (commits `5342030` + `6def6ff`) landed real implementation — 10 of its 11
tasks verified PASS by direct file read — but is **not gate-clean**: `phase13.md`
itself was left at Status "not started" with every box unchecked (the tracker never
caught up to the code, a recurring pattern in this project — see `phase12.md`'s and
`phase2.md`'s history), two concrete gaps survived its own control run, and its
required **live** control run never happened (only this phase's static re-verification
did). **Stage A below closes all of that out** before Stage B+ starts new scope,
mirroring how Phase 12/13 themselves absorbed their predecessor's remediation:

- **T2's status-code gap**: 5 of 7 BFF routes (`posts/[id]`, `comments/[id]`,
  `reactions`, `users/search`, `admin/set-tier`) build the correct
  `{statusCode,exc,msg,key}` body but call `NextResponse.json(graphqlErrorBody(...))`
  without `{status: body.statusCode}` — the HTTP status defaults to 200 on a real
  error. `proxy/[...path]/route.ts:48` sets `{status: res.status}` correctly, so
  these 5 routes are the odd ones out. Not part of the original Finding D text: a new
  regression, introduced (or rather left unaddressed) while fixing Finding D, not a
  reopening of it.
- **T10's sweep-miss**: `messaging-ws.gateway.ts:122` still has the raw
  `sender?.name || sender?.email || 'Someone'` fallback in the push-notification
  sender-name path — the exact bug class `displayName()` was built to eliminate,
  just missed in the sweep (the sibling call in `messaging.controller.ts:220` was
  converted correctly).
- **Tracker bookkeeping**: neither `phase12.md` (Status still "NOT complete",
  Findings A–H still shown blocking) nor `phase13.md` (Status still "not started")
  reflect the verified-PASS state of the underlying code.
- **No live control run**: `phase13.md`'s own phase gate requires reproducing the
  count-renewal race, the display-name reload bug, and scroll-to-bottom UX live
  against rebuilt containers — still outstanding.

## Survey (2026-07-04) — what's actually there for logging, read directly off HEAD

### The logging stack is running right now, and indexes nothing

Live-checked against the actually-running stack (`docker ps`: `postgres`, `redis`,
`minio`, `app`, `nextjs`, `elasticsearch`, `kibana`, `fluent-bit` all `Up`, most 2–3
hours) — **not hypothetical, this is the current state**:

```
$ curl localhost:9200/app-logs*/_count        → {"count":0,...}
$ curl localhost:9200/frontend-logs*/_count   → {"count":0,...}
$ curl localhost:9200/messaging-logs*/_count  → {"count":0,...}
$ curl localhost:9200/frontend-events*/_count → {"count":0,...}
```

Root cause: `docker-compose.yml`'s `app`/`nextjs` services (lines 219-227, 257-264)
use `logging: driver: json-file` plus a `tee`'d bind-mount (`./logs/back`,
`./logs/front`) — but `fluent-bit.conf`'s only `[INPUT]` is a `forward` listener on
port 24224 (the fluentd log-driver protocol). **No service in the compose file uses
`driver: fluentd`** (confirmed: repo-wide grep for `fluentd`/`24224` in any
`*.yml`/`*.yaml` matches only the port mapping, never a `logging.driver` value). Fluent
Bit's Docker-tag-based routing rules (`app*`→`app-logs`, `frontend*`→`frontend-logs`,
`messaging-ws*`→`messaging-logs`, `fluent-bit.conf:16-26,44-69`) are correctly written
but **have never received a single record** since nothing is configured to send to
port 24224. Separately, the Kafka-based `frontend-events` pipeline (below) is real but
Kafka itself isn't in the currently-running set (`docker ps` shows no `kafka`
container — the `kafka`/`all` profile isn't active) and its consumer defaults off
anyway (`FRONTEND_EVENTS_CONSUMER_ENABLED:-false}`, `docker-compose.yml:189`). **Before
any new categorization work matters, the base pipe has to actually carry data** — this
is Stage B, and it's the reason this phase's verify loop insists on a live
`curl .../_count` check, not just a code read.

### What already exists and is directly reusable

- **Pino, symmetrically, in both apps.** Backend: `nestjs-pino` (`logging.module.ts`,
  `logging.config.ts:34-77`) — ISO timestamps, redacted auth headers, a
  `correlationId` custom prop. Frontend: raw `pino` (`src/lib/logger.ts` +
  `request-logger.ts:1-57`) with its **own** `AsyncLocalStorage`-based
  `request-context.ts` and a `withLogging()` wrapper that builds a per-request child
  logger with `correlationId`/`userId`/`page` bindings — an almost exact structural
  mirror of the backend's pattern, independently built. Both are on `pino ^10.3.1`.
  No new logging library needed in either app.
- **A real, working Kafka pipeline for frontend telemetry** —
  `next-js-boilerplate/src/lib/kafka.ts` (`publishEvent()`) →
  `api/events/route.ts` (BFF, Zod-validated, rate-limited, resolves real `userId`
  server-side via `resolveUserId()`) → topic `frontend-events` → NestJS
  `FrontendEventConsumer` (`src/outbox/frontend-event.consumer.ts`, real
  `OnModuleInit` consumer, bulk-indexes into ES) → index `frontend-events`. Captures
  `page.view` (route-change) and generic `error` today via
  `useEventLogger.ts`/`event-logger.ts`, batched 5s/10-events,
  `sendBeacon`-on-unload. This is genuine, tested infra (`events.schema.test.ts`,
  `event-logger.test.ts`) — not a stub — but is optional-infra-gated (needs the
  `kafka` profile *and* the consumer env flag) and its own research doc
  (`docs/frontend/research/frontend-logging.md:108-116`) already documents it as an
  **interim deviation**, meant to be replaced by a Fluent-Bit-based path so neither
  app needs a Kafka client for logging. That target doc is referenced as
  `docs/logging.md` but **does not exist in the repo** — a dangling reference this
  phase finally resolves (Stage G).
- **The session token already exists, is already Redis-backed with IP/device — it's
  just never leaves the HTTP guard.** `TokenStoreService.write()`
  (`token-store.service.ts:64-91`) hashes 4 tokens into a Redis key and stores a hash
  with `userId, email, role, tier, deviceId, ip, userAgent, issuedAt, sessionId,
  name, ...` — literally the "Token: Data" shape described in the request. The one
  field that uniquely identifies a single login event (not shared across a user's
  concurrent devices/sessions the way the RBAC/user tokens are — those are
  `HMAC(userId+tier+date)`, identical all day across devices) is `sessionId`,
  `crypto.randomToken()` minted once in `issueTokens()` (`auth.service.ts:391`,
  stored via `tokenStore.write()` at :399-409). It reaches `req.user.sessionId` after
  `SessionAuthGuard` runs (`session-auth.guard.ts:136`) — available to every
  authenticated HTTP handler already — but is **never returned in any API response**
  (`AuthPayload`, `auth.types.ts:96-118`, has no `sessionId` field) and **never
  attached to the WS socket** (`realtime.gateway.ts`'s `handleAuth`, lines 301-307,
  sets `ws.userId`/`ws.deviceTokenHash`/`ws.userToken` from the same Redis hash but
  skips the `hash.sessionId` field that's sitting right there). This is a
  one-line-plus-a-field-addition gap, not a redesign — see D2/T7.
- **Login/logout are single, well-defined hook points.** Session start:
  `auth.service.ts`'s `login()`/`register()`/`loginWithOAuth()` all funnel through
  `issueTokens()` (:371-422) where `tokenStore.write()` is the literal session-start
  moment. Session end: `logout()` (:347-352) → `revokePresentedKey()`/
  `TokenStoreService.revoke()`/`revokeAllForUser()`.
- **IP is already captured, just discarded.** HTTP: `device.service.ts:74-76`
  (`req.ip` — `main.ts:37` sets `trust proxy: 1` so this already reflects
  `X-Forwarded-For`). WS: `realtime.gateway.ts:691-699`'s `clientIp()`, hand-parses
  `x-forwarded-for` (no `req.ip` on a raw socket). Frontend BFF:
  `api/events/route.ts:54-57`. In all three places the IP is read **only** to key a
  rate limiter / connection cap, then thrown away — never attached to a log
  document.

### What's genuinely new

- **No exception logging exists anywhere, at all.** Confirmed by reading every
  exception filter: `GlobalHttpExceptionFilter` (`global-http-exception.filter.ts:
  11-26`, global via `APP_FILTER`, `app.module.ts:194`) only shapes the response —
  zero `Logger` references in `src/exception-filters/`. Same for
  `CustomWsExceptionFilter`/`AllWsExceptionsFilter` on the WS side. Every exception
  in this system today is silently shaped and returned, never recorded.
- **No IP-change / device-change detection.** The IP/UA are compared against nothing
  after connect-time; a session hijacked or roaming mid-session produces no signal.
- **No connection-loss logging.** `realtime.gateway.ts`'s `ws.on('close', ...)`
  (141-163) is cleanup-only. Successful connect, successful auth, and failed auth are
  *also* all silent (only 4 total log lines exist in the whole gateway, all
  rate-limit/timeout warnings).
- **No device-type parsing.** No `ua-parser-js` (or equivalent) dependency in either
  app; `useDeviceType.ts` in the frontend is unrelated (pointer/input-method
  detection for CSS, browser-local only, never transmitted).
- **No page-view duration.** `useEventLogger.ts:12-22` emits `page.view` on path
  change with no timestamp pairing — time-on-page is not computed anywhere. The WS
  "page-claim" mechanism (`RealtimeProvider`/`realtime.gateway.ts`'s `handlePage`,
  Redis presence with TTL) is a live "where is this user now" pointer for realtime
  push routing, covers only ~6 allowlisted feature routes
  (`RealtimeProvider.tsx:111-145`), and computes no duration — it's the wrong tool
  for this job (D5).

## Decisions

- **D1 — Transport: Pino → Fluent Bit → 3 new Elasticsearch indices, not new Kafka
  topics.** The request's own phrasing ("3 topics") maps naturally to Kafka
  terminology, and Kafka *is* in this stack — but it's profile-gated, is not running
  in the default `docker compose up -d` path, and this repo's own research doc
  already documents the direction as *away* from requiring Kafka clients in both
  apps for logging. Fluent Bit/ES/Kibana are already running with zero extra infra
  and already have working tag-based routing + a Pino JSON parser. Building the
  mandated 3 categories on the piece that's already live, already-targeted-by-this-
  repo's-own-docs, and needs no profile flag to work is the lower-risk choice. The
  existing Kafka `frontend-events` pipeline is untouched and keeps serving
  free-form/custom client events (Stage C, T6) — this decision doesn't retire it,
  it just doesn't route the 3 *mandated* categories through it.
- **D2 — Correlation key: the backend's existing `sessionId`, not the frontend's
  existing `clientSessionId`.** Two different "session" concepts already exist in
  this codebase and must not be conflated: `clientSessionId`
  (`event-logger.ts:6-24`) is an anonymous per-tab UUID that exists even logged out;
  `sessionId` (`auth.service.ts:391`) is minted once per login, Redis-hash-backed
  with IP/device, and matches the request's own description ("once session is
  approved ... token"). Every log document gets a nullable `token` (=`sessionId`,
  present only once authenticated) *and* an always-present `clientSessionId`
  (frontend-originated docs only) so anonymous/pre-auth activity stays traceable
  without being the primary key.
  Downstream: [[phased-roadmap-workflow]] tracks this project's recurring
  tracker/reality drift; worth checking this phase's own tracker gets updated when
  it lands, not just Stage A's fixes.
- **D3 — The browser never sees the raw token.** `sessionId` is resolved
  **server-side only**, on both sides: backend handlers already have
  `req.user.sessionId` post-guard; the Next.js BFF resolves it the same way
  `api/events/route.ts`'s existing `resolveUserId()` already resolves `userId` —
  one small extension to the `me` GraphQL query (add a `sessionId` field, backed by
  the same `req.user.sessionId`), read server-side per BFF request. No new client
  exposure, no new trust boundary — the existing httpOnly-cookie model is unchanged.
- **D4 — Denormalize `ip`/`deviceType`/`userId`/`token` onto every log document,
  all 3 categories, not just Session.** Elasticsearch has no real cross-index join;
  the request's search requirements (device type, IP address) must work standalone
  against Page-Info and Exception documents, not only by reasoning back to a Session
  document. Cheap to write, and the ES-idiomatic way to do this.
- **D5 — Page-duration reuses/extends `useEventLogger`'s existing broad `page.view`
  capture, not the WS page-claim mechanism.** The WS mechanism only covers ~6
  allowlisted feature routes and is presence/push-routing infrastructure with a
  different job; `useEventLogger` already fires on every route change, is already
  mounted globally (`EventLoggerInit` in root layout), and already has a working
  transport. Add duration on top of what's already everywhere, don't build a second,
  narrower path.
- **D6 — IP/device-change detection updates the stored baseline after logging.**
  Compare the live request's IP/UA-fingerprint against the Redis session hash's
  stored values; on mismatch, log the change (old → new), then overwrite the hash.
  Fires once per actual change, not once per request for the rest of the session.
- **D7 — "Session loss" is best-effort via the WS unclean-disconnect signal; full
  TTL-expiry detection is an explicit non-goal for this phase.** A browser closed
  outright (no clean logout, no WS to notice) leaves no live signal without Redis
  keyspace-notifications, which is real additional infrastructure. Flagged as a
  follow-up in Stage H's docs, not required for this phase's verify gate — stating
  this explicitly so "session loss" isn't silently under-delivered against the
  request's ask.
- **D8 — Three new indices (`session-logs`, `page-info-logs`, `exception-logs`) via
  a Fluent Bit `rewrite_tag` filter keyed on a `category` field**, continuing this
  repo's existing one-index-per-logical-stream convention (already used for
  `app-logs`/`frontend-logs`/`messaging-logs`/`frontend-events`) rather than
  introducing a different pattern for just these three.

## Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day, L ≈ ≥1 day. Stage A must land and gate-pass before
Stage B starts (project convention: don't build new scope on an unclosed phase).
Stages B–C are a hard prerequisite for D–G (nothing downstream has a token or a pipe
to write to without them). E and F can land in parallel once C/D land. G depends on
D/E/F emitting the `category` field. H is last.

### Stage A — Phase 13 close-out (blocking prerequisite)

- [ ] **T1 (S) — Fix the BFF status-code gap.** Add `{status: body.statusCode}` to
  the `NextResponse.json(graphqlErrorBody(...))` calls in `posts/[id]`,
  `comments/[id]`, `reactions`, `users/search`, `admin/set-tier` route handlers.
  *Verify:* triggering a real error on each of the 5 routes returns the matching
  non-200 HTTP status, not 200 with an error body.
- [ ] **T2 (S) — Fix the `displayName()` sweep-miss.** Replace
  `messaging-ws.gateway.ts:122`'s `sender?.name || sender?.email || 'Someone'` with
  `displayName(sender ?? {})`.
  *Verify:* a push notification from a null-`name` sender shows the email-derived
  fallback, not "Someone"/"?".
- [ ] **T3 (M) — Live control run, Phase 12 + Phase 13.** Rebuild containers
  (`docker compose --profile all up -d --build migrate app nextjs`); reproduce
  live: count renewal (DM/notification arriving on an unrelated page updates the
  bell without navigating away; poll-floor self-heal with WS stalled), display-name
  reload (null-name friend, reload `/messages`, no bare "?"), scroll-to-bottom
  (scroll up, receive a message, no yank, button appears/works), and Phase 12's
  original 8 lettered findings' verify steps.
  *Verify:* every item above passes against the rebuilt stack, not just static
  reads.
- [ ] **T4 (S) — Tracker bookkeeping.** Flip `phase12.md`'s Findings A–H and
  per-stage checkboxes to reflect the now-verified fixes; update its Status line to
  "complete". Flip `phase13.md`'s Status and T1–T11 checkboxes based on T3's live
  results (T10 stays annotated per T2's fix above).
  *Verify:* both tracker files' Status lines and checkboxes match the real,
  now-live-verified state of the code.

### Stage B — Foundational pipe fix (logging infra prerequisite)

- [ ] **T5 (M) — Wire real log delivery into Fluent Bit.** Switch the `app` and
  `nextjs` services in root `docker-compose.yml` from `driver: json-file` to
  `driver: fluentd` (address `fluent-bit:24224`, a distinct `tag` per service so
  the existing `app*`/`frontend*` match rules keep working), keeping the `tee`'d
  bind-mount (`./logs/back`, `./logs/front`) for host-tailing since the fluentd
  driver stops `docker logs <container>` from showing output. Document that
  trade-off inline in the compose file.
  *Verify:* after `docker compose up -d --build app nextjs`, hitting either app
  causes `curl localhost:9200/app-logs*/_count` / `frontend-logs*/_count` to go
  above 0 within a minute — the concrete, currently-failing check from this phase's
  Survey section.
- [ ] **T6 (S) — Document the Kafka pipeline's continued scope.** No code change;
  add a short note (folded into Stage H's `docs/logging.md`) that
  `frontend-events`/Kafka remains the path for free-form custom events
  (`action.click` etc.), while `session`/`page`/`exception` flow through Fluent Bit
  per D1 — so a future contributor doesn't wonder why two pipelines coexist.

### Stage C — Session token as the correlation key (backend)

- [ ] **T7 (S) — Surface `sessionId` server-side-only.** Add a `sessionId` field to
  the GraphQL `me` query's response (backed by the already-populated
  `req.user.sessionId`, `session-auth.guard.ts:136`); add
  `ws.sessionId = hash.sessionId` in `realtime.gateway.ts`'s `handleAuth` (next to
  the existing `ws.userId`/`ws.deviceTokenHash` assignments, ~line 301-307).
  *Verify:* an authenticated `me` query response includes `sessionId`; a connected
  WS socket's in-memory state has `ws.sessionId` set post-auth (add a debug log or
  test assertion, not a client-visible field).
- [ ] **T8 (S) — BFF-side resolution.** Extend `api/events/route.ts`'s
  `resolveUserId()` pattern (or add a sibling `resolveSessionId()`) to also read
  `sessionId` from the same `me` call, cached per-request the same way
  `request-context.ts` already caches `correlationId`; use it to stamp every
  enriched frontend event before publishing/logging.
  *Verify:* an authenticated frontend event, inspected server-side before it's
  written, carries a non-null `token` matching the backend's Redis-stored
  `sessionId` for that login.

### Stage D — Structured log emission: Session category (backend)

- [ ] **T9 (M) — Session start/end/loss logging.** In `issueTokens()`
  (`auth.service.ts:391-409`), right after `tokenStore.write()`, emit
  `{category:"session", event:"session.start", token, userId, ip, deviceId,
  deviceType, userAgent, issuedAt}`. In `logout()`/`revokeAllForUser()`, emit
  `{category:"session", event:"session.end", token, userId, sessionDurationMs,
  reason}` (`sessionDurationMs` = now − the hash's `issuedAt`). Wire a
  `"session.loss"` emission into T13's unclean-WS-disconnect path per D7 (best
  effort — full TTL-expiry coverage is out of scope per D7).
  *Verify:* login → a `session.start` doc appears in `session-logs` (once Stage G
  lands) keyed by `token`, containing the full ip/device snapshot — literally the
  "Token: Data" write described in the request. Logout → a matching `session.end`
  doc with a plausible `sessionDurationMs`.

### Stage E — Structured log emission: Exception category (backend)

- [ ] **T10 (M) — Log real exceptions.** Add actual logging to
  `GlobalHttpExceptionFilter` (currently zero — confirmed) and both WS exception
  filters: `{category:"exception", event:"exception", exceptionType:<exc>, token,
  userId, ip, deviceType, message}`.
  *Verify:* triggering any handled exception (HTTP or WS) produces a matching
  `exception-logs` document with the correct `exceptionType` from Phase 12's
  existing `ExceptionCode` taxonomy.
- [ ] **T11 (M) — IP-change / device-change detection.** New check (HTTP
  interceptor + inline WS check) comparing the live request's `ip`/UA-fingerprint
  against the Redis session hash's stored `ip`/`userAgent`; on mismatch, emit
  `{category:"exception", event:"ip-change"|"device-change", previousIp, newIp}` (or
  the device equivalent), then update the hash per D6.
  *Verify:* change the simulated client IP or User-Agent mid-session (two
  authenticated requests, same token, different `X-Forwarded-For`/`User-Agent`) →
  exactly one `ip-change`/`device-change` doc appears, not one per subsequent
  request.
- [ ] **T12 (S) — Device-type parsing utility.** Add `ua-parser-js` (or
  equivalent), one shared backend util producing a normalized
  `"desktop"|"mobile"|"tablet"|"bot"|"unknown"`; call it wherever ip/UA are already
  read (HTTP guard/interceptor, WS `handleAuth`).
  *Verify:* a request from a mobile UA string and one from a desktop UA string
  produce visibly different `deviceType` values in the resulting logs.
- [ ] **T13 (S) — Connection-loss + connect/auth logging.** Add log calls to
  `realtime.gateway.ts`'s existing `ws.on('close', ...)` handler (distinguish clean
  vs. unclean close → `{category:"exception", event:"connection-loss"}` on
  unclean), plus previously-silent successful-connect, successful-auth, and
  failed-auth events.
  *Verify:* a clean tab close produces no `connection-loss` doc; killing the
  connection abruptly (e.g. blocking the port) does.

### Stage F — Frontend: page duration + exception capture rewiring

- [ ] **T14 (M) — Page-info duration tracking.** Extend `useEventLogger.ts`'s
  page-view effect to record entry time on `page.view` and compute `durationMs` on
  the next path change or `visibilitychange`/`pagehide`; emit
  `{category:"page", event:"page.view", page:<route pattern>, url:<pathname>,
  durationMs, token, clientSessionId}` via the existing batched `eventLogger`
  transport.
  *Verify:* navigating across 3 pages produces 3 `page-info-logs` documents (once
  Stage G lands), each with a non-zero `durationMs` except the currently-active
  page, all sharing the same `token`.
- [ ] **T15 (M) — Exception capture rewiring.** Point `useEventLogger.ts`'s
  `window.onerror`/`onunhandledrejection` handlers and `instrumentation.ts`'s
  `onRequestError` at the new shape (`category:"exception",
  exceptionType:"CLIENT_UNHANDLED_ERROR"|"CLIENT_UNHANDLED_REJECTION"|
  "CLIENT_REQUEST_ERROR"`) in addition to their current in-memory `recordError()`
  (don't rip out the `/observability` demo's data source in this phase — additive).
  *Verify:* an uncaught client exception produces a matching `exception-logs`
  document with `exceptionType:"CLIENT_UNHANDLED_ERROR"` and the caller's `token`.
- [ ] **T16 (S) — Server-side enrichment in the BFF.** In `api/events/route.ts`
  (and any sibling event-ingest route), stamp `ip` (already read for rate-limiting,
  `:54-57` — just also attach it) and `deviceType` (parse `user-agent` server-side)
  onto every enriched event, alongside T8's `token`/`userId` — never trust a
  client-sent `ip`/`deviceType` value.
  *Verify:* an event submitted with a forged `ip`/`deviceType` in its payload is
  overwritten by the server-derived value before it's logged.

### Stage G — Fluent Bit / Elasticsearch / Kibana wiring

- [ ] **T17 (M) — `rewrite_tag` + 3 new outputs.** Add a Fluent Bit
  `[FILTER] Name rewrite_tag` rule keyed on the `category` field
  (`session`/`page`/`exception` → e.g. `<service>.session`/`.page`/`.exception`),
  plus 3 new `[OUTPUT]` blocks routing to `session-logs`/`page-info-logs`/
  `exception-logs`. Existing `app-logs`/`frontend-logs`/`messaging-logs` outputs
  untouched for everything else.
  *Verify:* a `category:"session"` log line from either app lands in
  `session-logs`, not `app-logs`/`frontend-logs`.
- [ ] **T18 (S) — Explicit ES index mappings.** Index templates for the 3 new
  indices with `token`/`userId`/`exceptionType`/`deviceType`/`ip`/`page` mapped as
  `keyword` (exact-match/aggregatable), not dynamically-mapped `text`.
  *Verify:* a Kibana filter on `deviceType: "mobile"` (exact term) returns correct
  results, not a fuzzy/analyzed partial match.
- [ ] **T19 (S) — Kibana data views + starter searches + retention.** Data views for
  the 3 new indices; one saved search per category as a starting point; extend the
  existing ILM backlog item (`docs/todo/04-devops.md`'s "Elasticsearch ILM" entry)
  to also cover these 3 indices with a 7–30 day retention policy.
  *Verify:* all 3 data views resolve and show documents in the Kibana UI itself
  (not just via `curl` to the ES API).

### Stage H — Docs

- [ ] **T20 (S) — Write `docs/logging.md`.** Fills the dangling reference from
  `docs/frontend/research/frontend-logging.md:111`. Document: the final
  architecture (Pino → Fluent Bit → 3 indices, Kafka path retained for custom
  events per T6), the full field schema per category, and 6 copy-pasteable Kibana
  KQL queries — one per required search dimension (token, user id, page name,
  exception type, device type, ip address).
  *Verify:* each of the 6 sample queries, run against the live stack, returns the
  expected documents.

## Verify loop (phase gate)

- [ ] **Phase 13 close-out:** Stage A fully passes (see T1–T4) before anything below
  is considered part of a clean phase start.
- [ ] **Pipe carries data:** `app-logs*`/`frontend-logs*` document counts are >0
  after T5, confirmed live (not the pre-phase 0-count state recorded in the Survey).
- [ ] **Session:** login → `session.start` doc (token, ip, deviceType, deviceId all
  populated); logout → `session.end` doc with a plausible `sessionDurationMs`.
- [ ] **Page Info:** multi-page navigation produces `page.view` docs with real
  `durationMs`, all sharing one `token`.
- [ ] **Exceptions:** one backend-triggered and one frontend-triggered exception
  both land in `exception-logs` with correct `exceptionType`; a simulated mid-session
  IP/device change produces exactly one `ip-change`/`device-change` doc; an unclean
  WS disconnect produces a `connection-loss` doc.
- [ ] **Search, live, via Kibana (not just `curl`):** all 6 required dimensions —
  token, user id, page name, exception type, device type, ip address — each answer
  a real query against the live stack with correct results.
- [ ] **No regressions:** pre-existing `app-logs`/`frontend-logs`/`messaging-logs`/
  `frontend-events` streams keep working; Phase 9/10/12/13 realtime loops still
  behave after Stage C/D/E's changes to shared gateway/guard files.
- [ ] **Live control run** against freshly rebuilt containers before marking this
  phase complete, per this project's established convention — Stage B through G are
  infra- and timing-sensitive (log delivery, WS disconnects, mid-session token
  changes) in a way no static read can substitute for.

## Phase queue (updated 2026-07-04)

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
| 13 (implemented, not gate-clean until Phase 14/T3-T4) | Phase 12 remediation + notification/DM unread count renewal hardening + sender display-name consistency + chat scroll-to-bottom button | [phase13.md](phase13.md) |
| **14 (this file)** | Phase 13 close-out (2 residual bugs + live control run + tracker bookkeeping) + comprehensive Kibana activity logging: session/page/exception categories keyed by session token, searchable by token/user id/page name/exception type/device type/ip address | this file |
| 15 (was 14) | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7+9+10 realtime loops | [todo/01](../todo/01-stack-integration.md) |
| 16 (was 15) | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../todo/01-stack-integration.md) |
| 17 (was 16) | Backend warts + compose hardening + k8s | [todo/02](../todo/02-backend.md), [todo/04](../todo/04-devops.md) |
| 18 (was 17) | Backlog: OTel/metrics, remaining push polish, social auth, seed, publishing, backups | [todo/02](../todo/02-backend.md)–[05](../todo/05-docs-maintenance.md) |

<!-- Downstream phases 14-17 were renumbered +1 (now 15-18) to insert this
Phase 13 close-out + logging phase, same pattern Phase 12 used. -->
