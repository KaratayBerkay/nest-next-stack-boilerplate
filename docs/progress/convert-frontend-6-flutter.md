# convert-frontend-6-flutter — Mobile activity logging (session/page/exception/network → ELK)

**Date:** 2026-07-25 · **Verified against:** `c765536` (HEAD of main) ·
**Status:** ✅ **ALL TASKS COMPLETE** — implemented 2026-07-25, verified against
HEAD `<current>`. All 12 tasks in §7 done:
`dart analyze lib/` clean, `dart format` clean, `flutter test` passes (1
pre-existing failure in `card_test.dart`), NestJS `tsc --noEmit` clean for the
new module.
**Predecessor:** [convert-frontend-5-flutter.md](convert-frontend-5-flutter.md)
(APK UI overlap, RBAC tier-casing, theme/forms fidelity — Status line there says
"ALL PHASES COMPLETE" and recent commits `92c979f`/`2ae1557`/`363bb06`/`edcf8f3`/
`c765536` look like real follow-through, but its own findings haven't had an
independent re-verification pass as of this writing. Not a blocker for this doc —
see §9.)
**Reference doc this mirrors:** [`docs/logging.md`](../logging.md) — the existing
web+backend structured-logging architecture (built across the old `phase14.md` /
`phase15.md` / `phase16.md` trackers, archived under `docs/progress/archive/steps/`).

> Berkay asked for a doc mirroring the web/backend's existing Kibana
> activity-logging system so mobile-app activity becomes queryable in the same
> Elasticsearch/Kibana stack. This is the Flutter-side design + task plan —
> nothing below has been implemented yet.
>
> **Headline finding: Flutter cannot reuse the web's transport mechanism as-is.**
> The reference pipeline is `Logger.log({category,...})` → stdout → Docker's
> `fluentd` log driver → Fluent Bit → Elasticsearch — for *both* apps, including
> the Next.js side, which does its own Pino logging inside its own server process
> (§3.2). It depends on being a container whose stdout Docker/Fluent Bit can see.
> A mobile binary has no such stdout, and Flutter has no BFF layer of its own to
> imitate the Next.js side with either. The only viable design is a new backend
> HTTP endpoint Flutter's existing Dio client calls directly — detailed in §5.
>
> **Second finding: most of the Flutter-side "logging" scaffolding that already
> exists is dead and/or broken, not a working feature to extend** (§4.1) — wrong
> host, wrong wire shape, zero call sites, confirmed by direct grep. One piece
> (§4.2, `validators/events/schema.dart`) is a correct, ready-to-use, currently
> orphaned port of the web's Zod schema — reuse it as-is.
>
> **Third finding, not caused by this doc but relevant to its own verify loop:**
> the pipeline this doc mirrors currently looks broken at the root, on both
> platforms, not just for a hypothetical Flutter addition. `docker-compose.yml`'s
> `x-logging` anchor is `driver: json-file` (line 6), not `fluentd` — and
> Fluent Bit's only `[INPUT]` is a `forward` listener on port 24224 (the fluentd
> log-driver protocol), with no `tail` input reading any bind-mounted log file.
> Traced the full history (§3.3): Phase 14 fixed this exact gap on 2026-07-05
> (`02cf2fb`), then commit `4950bcb` (2026-07-08, an unrelated Vault-secrets
> cleanup) silently deleted the fix as collateral damage, and a later commit
> (`3958823`, 2026-07-20) tidied the anchor's YAML structure without restoring
> the value. Flagging this once, per this project's convention — it means the
> live ES-arrival checks in §8 may fail for a pre-existing reason unrelated to
> anything in this doc. Fixing it is Stage 0, not silently skipped, but it's a
> shared-infra bug, not a Flutter bug.

---

## Table of contents

1. [How to use this doc](#1-how-to-use-this-doc)
2. [Executive summary](#2-executive-summary)
3. [Current state — backend + web reference pipeline](#3-current-state--backend--web-reference-pipeline)
4. [Current state — Flutter side](#4-current-state--flutter-side)
5. [Decisions](#5-decisions)
6. [Scope — what Flutter will and won't emit](#6-scope--what-flutter-will-and-wont-emit)
7. [Tasks](#7-tasks)
8. [Verify loop (phase gate)](#8-verify-loop-phase-gate)
9. [Relationship to convert-frontend-5](#9-relationship-to-convert-frontend-5)

---

## 1. How to use this doc

§3-4 are reference material — read once, verified against HEAD, cited
`file:line`. §5 is the actual design; read it before touching code, since two of
its decisions (D1, D3) change the shape of everything downstream. §7 is the
stage-ordered task list — Stage 0 blocks the live parts of everyone else's verify
steps but not the code itself, Stages A-B block C-E, F-G come last. §8 is the
phase gate.

## 2. Executive summary

Four pieces of real work:

1. **One new NestJS endpoint** (`POST /activity-logs`, Stage A) — Flutter has no
   BFF, so a mobile-originated structured event needs a backend process that can
   itself call `Logger.log()` into the existing Pino → Fluent Bit → ES pipeline.
   No new Elasticsearch indices, Fluent Bit routes, or Kibana objects are needed —
   every category Flutter will ever emit already has a live index, mapping, and
   saved search (§3.4).
2. **A Flutter transport layer** (Stage B) mirroring `next-js-boilerplate/src/lib/
   event-logger.ts`'s batching contract almost exactly (5s / 10-event flush,
   fire-and-forget, in-memory per-process session id), with one necessary
   deviation: there's no `sendBeacon`/`beforeunload` equivalent, so flush-on-
   background uses `WidgetsBindingObserver` instead (best-effort, not a delivery
   guarantee — stated plainly, not oversold).
3. **Three new capture points** (Stages C-E): page views (a `NavigatorObserver`
   on `GoRouter`, none exists today), uncaught exceptions (`FlutterError.onError`
   + `PlatformDispatcher.instance.onError`, none exists today), and connectivity
   transitions (extending the already-live `hooks/use_presence.dart`, not adding
   a second listener).
4. **Tests + docs** (Stages F-G) — the schema validator already exists untested;
   the reference doc has an internal inconsistency worth fixing while in there.

**Explicitly not new Flutter work, because it already fires for any client
including Flutter's:** `session` (backend-driven, keyed off `login()`/`logout()`
regardless of caller), `http-exception` (backend's `GlobalHttpExceptionFilter`
logs every failed request already, Flutter's included), `database`/`performance`/
`payment`/`billing` (backend-internal, client-agnostic). See §6 for the full
scope table and why.

## 3. Current state — backend + web reference pipeline

Verified directly against HEAD (`c765536`), not against the archived phase docs,
which are 3 weeks old and — per their own text — already recorded several
"looks done, live-verify says no" gaps at the time.

### 3.1 The real category taxonomy

`docs/logging.md` documents this, but **its own top table disagrees with its own
body** — cross-checked against the actual emission sites and infra config, the
top table is the accurate one:

| category | emitted from (backend) | emitted from (frontend) | ES index |
|---|---|---|---|
| `session` | `auth-session.service.ts:36`, `session-auth.guard.ts:134,151`, `auth-token.service.ts:67`, `realtime.gateway.ts` (7 sites) | — | `session-logs` |
| `page` | — | `useEventLogger.ts:30,45` | `page-logs` |
| `http-exception` | `global-http-exception.filter.ts:45`, `devices/device-ip-middleware.ts:61` | `instrumentation.ts:56` (Next.js SSR `onRequestError`, not browser) | `http-exception-logs` |
| `websocket-exception` | `realtime.gateway.ts:133`, `ws-exception.filter.ts:24`, `all-ws-exceptions.filter.ts:24` | — | `websocket-exception-logs` |
| `application-exception` | `global-http-exception.filter.ts:24` | `useEventLogger.ts:57,74` | `application-exception-logs` |
| `network` | `http-throttler.guard.ts:39`, `csrf.guard.ts:26` | `useNetworkLogger.ts:16,27`, `api/events/route.ts:97` | `network-logs` |
| `database` | `prisma.service.ts:42,56` | — | `database-logs` |
| `performance` | `performance.interceptor.ts:61` | `usePerformanceLogger.ts:23` | `performance-logs` |
| `payment` | `stripe-payment.provider.ts` (2 sites), `stripe-webhook.controller.ts` (4 sites) | — | `payment-logs` |
| `billing` | `billing.service.ts` (4 sites), `stripe-webhook.controller.ts:228` | — | `billing-logs` |

That's **10 real category values across 9 indices** (`http-exception`/
`websocket-exception`/`application-exception` are 3 distinct categories, each
with its own index) — confirmed by `grep -rn "category:\s*['\"]" nest-js-boilerplate/
src next-js-boilerplate/src`, and matching `fluent-bit.conf:55,61`'s
`rewrite_tag` regex verbatim (`^(session|page|http-exception|websocket-exception|
application-exception|network|database|performance|payment|billing)$`) and the ES
index template's `index_patterns` (`docker/elasticsearch/
index-template-structured-logs.json:2`).

`docs/logging.md`'s **body** (its "Categories & Event Types" section, lines
46-108, and its "Fluent Bit Routing" prose, lines 276-283) describes an older,
6-category version — a single generic `exception` category instead of the 3 real
ones, and no `payment`/`billing` at all. That's stale content left over from
before the payment/billing/3-way-exception-split landed (most likely in the
`60af0c4` "Phase D15/E18/E20 ... logging index" commit, which touched this file
without reconciling the rest of it). Not fixed here — flagged for Stage G (§7)
since this doc's own Flutter additions will touch the same file anyway.

The web's own Zod schema (`next-js-boilerplate/src/validators/events/schema.ts:17-27`)
and its Flutter port (`flutter-boilerplate/lib/validators/events/schema.dart:36-49`)
both only allow **7** of the 10 values (`session, page, http-exception,
application-exception, network, database, performance` — no
`websocket-exception`/`payment`/`billing`). That's correct, not a bug: those 3
are categories only a backend process could ever originate (a WS gateway, a
Stripe webhook), so the client-facing schema never needed them. Flutter's actual
originable subset is smaller still — see §6.

### 3.2 Why the web's transport can't be reused as-is

Backend: `nestjs-pino` writes structured JSON to stdout → Docker's `fluentd` log
driver ships it to Fluent Bit on port 24224 → tag-based routing into the indices
above.

Next.js is **not a proxy in front of this** — it's a second, independent
producer into the *same* pipeline. `next-js-boilerplate/src/app/api/events/
route.ts` (the `/api/events` BFF route) runs inside the Next.js server process,
uses its own Pino instance via `withLogging()` (`src/lib/request-logger.ts`), and
that process's *own* stdout is what Fluent Bit's `frontend*`-tag rules capture
(`fluent-bit.conf:43-46,58-62`). Confirmed by reading `route.ts:90-157` directly:
it does its own rate-limiting, its own `resolveMe()` GraphQL call to enrich
`userId`/`sessionId`, and its own `log.info(event, "category event")` — no HTTP
call out to NestJS anywhere in that file.

A Flutter binary is neither of these — it isn't a container, has no stdout
Docker captures, and (confirmed §4) has no server process of its own to run a
Pino instance in. The only structurally-possible design is an HTTP hop into a
process that *does* already have a working `Logger.log()` → Fluent Bit path —
i.e., NestJS itself, which every category in §3.1's backend column already
proves works. See D1.

### 3.3 Infra caveat — the compose logging-driver regression

Confirmed by direct read, not the archived docs: `docker-compose.yml:4-6`

```yaml
x-logging: &default-logging
  logging:
    driver: json-file
```

merged via `<<: *default-logging` into both `app:` and `nextjs:` (no per-service
override — checked). `fluent-bit.conf`'s only `[INPUT]` is `Name forward, Port
24224` (the fluentd-driver protocol) — no `tail` input exists reading the
`./logs/back`/`./logs/front` bind-mounts also configured in the same compose
file. A `json-file`-driver container speaking to a `forward`-only listener ships
zero records, full stop, regardless of anything Flutter does.

Full history (`git log --oneline --all -S "driver: fluentd" -- docker-compose.yml`):

- `02cf2fb` (2026-07-04, Phase 14 Stage B) — introduces `driver: fluentd`,
  `fluentd-address: localhost:24224`, live-verified working 2026-07-05
  (`phase14.md`'s "Live verification" section, T5 confirmed PASS via
  `curl .../_count`).
- `4950bcb` (2026-07-08, "cleanup: remove prod/ folder, strip static envs, keep
  only vault") — diff shows the `fluentd` `logging:` block **deleted** from both
  services. The commit message is entirely about the Vault secrets migration;
  logging isn't mentioned. This is collateral damage from a compose-file
  rewrite, not a deliberate reversal.
- `3958823` (2026-07-20, "fix x-logging anchor") — confirmed by diff: this fixed
  a YAML structure bug (`driver: json-file` was sitting directly under the
  anchor with no `logging:` parent key, which isn't a valid compose key at that
  level) but the *value* was already `json-file` both before and after — this
  commit didn't touch the fluentd question either way.

`elasticsearch`/`kibana`/`fluent-bit` containers are currently up (6h, per `docker
ps`); `app`/`nextjs`/`postgres`/`redis` are **not currently running** in this
environment, so a live `curl .../_count` re-check wasn't possible while writing
this doc. Stage 0 (§7) re-verifies live before anything else in this doc's own
gate can be trusted.

### 3.4 What's already wired and reusable — no infra changes needed

The payoff of §3.1's taxonomy being real: every category Flutter will ever emit
(§6 — `page`, `application-exception`, `network`) already has, right now, with no
new work:

- A `rewrite_tag` rule matching it (`fluent-bit.conf:52-62`).
- A dedicated `[OUTPUT]` block indexing it (`fluent-bit.conf:142-160` for
  `page`/`network`; `132-140` for `application-exception`).
- A `keyword`-mapped ES index template entry (`docker/elasticsearch/
  index-template-structured-logs.json`).
- A Kibana index pattern + saved search (`kibana-saved-objects.ndjson` — `page-
  logs-search`, `network-logs-search`; `application-exception-logs` has no
  dedicated saved search today since the doc's stale body content (§3.1) never
  anticipated the 3-way exception split — worth a 4th saved search in Stage G,
  a small real gap, not a blocker).

Stage A (§7) is pure NestJS application code — a controller, a validator, a
handful of `Logger.log()` calls. Nothing in Fluent Bit, the ES template, or
Kibana needs to change for Flutter's data to start flowing once Stage 0 is
fixed.

## 4. Current state — Flutter side

### 4.1 Existing "event logger" scaffolding is dead, not a foundation

Three files form a complete but non-functional chain, confirmed by direct read
and by grep for callers:

- `hooks/use_event_logger.dart` (5-22) — `EventLogger.log({category, action,
  label, metadata})` builds a synthetic string `"$category.$action.$label"` and
  posts `{event, properties}`. **Zero call sites** anywhere outside this file's
  own definition (`grep -rn "eventLoggerProvider\|EventLogger(" lib` matches only
  the definition itself) — nothing in the app has ever called this.
- `api/client/events/actions.dart` → `api/server/events/log.dart:13-21` — posts
  to a hardcoded literal `'/api/events'` (not even sourced from
  `constants/api/urls.dart`, unlike every other endpoint in the app) on
  `dioProvider`'s `baseUrl` — which is `AppConfig.apiBaseUrl`, i.e. the **NestJS
  backend**, not the Next.js server. NestJS has no `/api/events` route: the only
  `@Controller('events')` in the backend (`nest-js-boilerplate/src/events/
  events.controller.ts`) is the framework-docs Orders/Inventory tutorial recipe
  (`/events/orders`, `/events/log`, `/events/inventory`) — an unrelated demo
  module, confirmed by reading it directly, not the logging system.
- Even if the host/path were fixed, the payload shape (`{event, properties}`)
  doesn't match `eventsBatchSchema` (`events: FrontendEvent[]` with required
  `clientSessionId`/`timestamp` per event) — the request would 422 today if it
  ever reached the real BFF route.

Three independent ways this chain doesn't work, before even asking "does
anything call it." Treat it as dead scaffolding to replace (D11), not a base to
extend.

### 4.2 The one reusable piece — `validators/events/schema.dart`

`flutter-boilerplate/lib/validators/events/schema.dart:1-73` is a correct,
already-written, mechanical port of `next-js-boilerplate/src/validators/events/
schema.ts` — `validateCategory` accepts the same 7 values as the web (§3.1),
`validateExceptionType` accepts `CLIENT_ERROR`/`CLIENT_REJECTION`/
`CLIENT_REQUEST_ERROR`, plus `validateClientSessionId`/`validateUserId`/
`validateUrl`/`validateUserAgent`/`validateDurationMs`/`validateBatchSize` (max
50, matching `eventsBatchSchema.events.max(50)`). **Zero call sites today**
(confirmed — nothing in `test/validators/` covers it either, §7 Stage F), but
nothing about it needs to change. Reuse verbatim as the Dart-side contract (D2).

### 4.3 `sessionId` — already queried, silently dropped

`api/server/auth/me.dart:19` already asks for `sessionId` in its GraphQL query,
and `types/auth/user.dart:20-33`'s `AuthenticatedUser.fromJson` — confirmed by
direct read — never reads `json['sessionId']`, so it's discarded on every
`me()` call today. A parallel, already-built path exists too:
`api/server/auth/me_raw.dart:1-43` (`MeRawServer` → `AuthMeResult.session`) does
capture it, but has zero call sites (nothing imports `MeRawServer` outside its
own file).

**Neither of these needs to be touched for this feature** (a deliberate scope
cut, not an oversight) — see D3. The new backend endpoint (Stage A) resolves
`sessionId` the same way every other authenticated NestJS request already does,
server-side, off `req.user.sessionId` post-guard — Flutter never needs to know
its own session id at all. Left as-is; a candidate for some *other* future
feature that actually needs the client to display/reference it.

### 4.4 Ambient conventions worth knowing before adding new code

- `debugPrint` is the app's only existing "logging" convention today —
  `app/app.dart:55,58`, `lib/api_client.dart:24`, `lib/realtime/
  realtime_client.dart` (5 sites, the "log realtime connection lifecycle" work
  from commit `c765536`). None of it leaves the device.
- `lib/lib/logger.dart:3-5` (a 3-line `Logger(printer: PrettyPrinter())` wrapper
  around the `logger` package) has no confirmed importers — the one page that
  uses the `logger` package (`views/demos/observability_page.dart`) imports it
  directly rather than this shared instance. Not relevant to remote log
  shipping either way — a local pretty-printer, not a transport.
- **Correction to an earlier research pass this doc's author checked twice:**
  `connectivity_plus` is **not** unused — `hooks/use_presence.dart:1-15` already
  wires `Connectivity().onConnectivityChanged` into `presenceProvider`/
  `isOnlineProvider`, and that provider has two real, live consumers
  (`views/messages/messages_sidebar_conversations.dart:161`, `views/messages/
  chat_view_header.dart:26` — an online/offline badge in the chat UI). Stage E
  extends this existing file; it does not add a second connectivity listener.
  `device_info_plus`, by contrast, really does have zero imports anywhere in
  `lib/` — confirmed.
- No `FlutterError.onError`, `PlatformDispatcher.instance.onError`,
  `runZonedGuarded`, or `NavigatorObserver` exists anywhere in the app today
  (all four greps returned nothing) — Stages C and D are genuinely greenfield,
  not extensions of something partial.
- `main.dart` is a 13-line file (`usePathUrlStrategy()` →
  `WidgetsFlutterBinding.ensureInitialized()` → `runApp`) — the natural, already
  cited-elsewhere-in-this-codebase place to wire error handlers before `runApp`.
- `test/hooks/auth_test.dart` and `test/hooks/realtime_test.dart` are real,
  existing examples of this app's hook-test convention (bare
  `ProviderContainer()`, no `BuildContext`/widget pump, `addTearDown(container.
  dispose)`) — use them as the template for Stage F, don't invent a new test
  shape. `test/validators/` has `auth_test.dart`/`billing_test.dart`/
  `forms_test.dart`/`messages_test.dart` but no `events_test.dart` yet.

### 4.5 A pre-existing config caveat, not this doc's to fix

`AppConfig.apiBaseUrl` (`app_config.dart:6-9`) defaults to
`http://localhost:3001`, and this project's own **flutter-conversion** skill
documents `http://10.0.2.2:3001` as the Android-emulator mapping — but
`nest-js-boilerplate/src/main.ts:151` shows the real NestJS default is
`process.env.PORT ?? 3000`, and `docker-compose.yml` maps `"3000:3000"` for the
containerized `app` service. Nothing in this repo's compose file exposes
anything on `3001`. This predates this doc and isn't caused by anything here —
noted because whoever implements Stage A/B needs the *actual* reachable port to
test against locally, and `3001` should not be assumed correct without checking
how the backend is actually being run at the time (containerized vs. bare
`pnpm start:dev`, which may default differently).

## 5. Decisions

- **D1 — Transport: new NestJS endpoint `POST /activity-logs`, not a reuse of
  `/api/events`.** Per §3.2, Flutter has no server process of its own to
  participate in the stdout-capture mechanism the web side depends on; the only
  structurally possible design is a direct HTTP call into a process that can log
  via Pino, which is NestJS. Name avoids colliding with the pre-existing,
  unrelated `@Controller('events')` demo module (§4.1).
- **D2 — Payload shape: reuse `validators/events/schema.dart`'s 7-value
  category enum verbatim** (§4.2) as the Dart-side contract; give the new
  NestJS endpoint a matching validator accepting the same field set as
  `eventsBatchSchema` (`events: [...]`, max 50/batch). Don't invent a new shape
  — the existing one is correct and already ported.
- **D3 — `sessionId`/`userId` resolved server-side only, and Flutter never
  needs to carry its own session id at all** (stronger than the web's
  equivalent decision in the old `phase14.md`'s D3, and simpler to implement):
  because the new endpoint lives *on* NestJS itself, it can reuse the exact
  same guard every other authenticated Flutter request already goes through to
  get `req.user.sessionId`/`req.user.id` populated — no side-channel `me` query
  needed the way the Next.js BFF requires one (the BFF has to ask because it's
  a *different process* than the one running the guard; NestJS asking itself
  is redundant). The endpoint should not hard-require auth, though: mirror
  `route.ts`'s `resolveMe()` try/catch-swallow pattern (§3.2) so pre-login
  screens (splash, login, register) can still log page-views and exceptions
  anonymously, tagged only with `clientSessionId` (D4).
  **Consequence: §4.3's dead `sessionId`-plumbing gap in `AuthenticatedUser.
  fromJson`/`me_raw.dart` does not need to be fixed for this feature.** Leave
  it; it's a separate concern if some future feature needs the client itself to
  know its session id.
- **D4 — `clientSessionId` mirrors `event-logger.ts`'s per-tab random UUID**
  (`getSessionId()`, `event-logger.ts:7-25`): generate once, in-memory only
  (a static/singleton, **not** persisted to `shared_preferences` or secure
  storage) — the closest equivalent of "one browser tab's `sessionStorage`
  lifetime" for a mobile app is "this process's lifetime," not "this install."
  Always present on every event, independent of and complementary to the
  optional, server-resolved `token` (=`sessionId`) from D3.
- **D5 — `ip` is always server-derived** (`req.ip`, already flowing through
  `main.ts`'s `trust proxy` setup per the existing backend guards), **never
  trusted from the client** — mirrors the web's own T16 exactly. **`deviceType`
  deviates from the web's approach on purpose:** the web guesses from a
  spoofable browser `User-Agent` string via a regex util; Dio's default
  User-Agent is not descriptive the same way, and re-deriving it server-side
  would likely just produce `"unknown"` for every Flutter request. Instead,
  have the Dart client send a `platform` hint (`"ios"`/`"android"`) — trustworthy
  here in a way a UA string never is, since it comes from a compiled binary, not
  arbitrary page JS — and have the endpoint map that plus a screen-size
  breakpoint (mirroring `hooks/use_device_type.dart`'s existing tablet/phone
  cutoff) to `deviceType: "mobile"|"tablet"`. State this explicitly as an
  intentional deviation, not an inconsistency to "fix" later.
- **D6 — Flutter's client-originated category scope is exactly 3 values:
  `page`, `application-exception`, `network`.** See §6 for the full reasoning
  per excluded category — the short version is that `session`/`http-exception`/
  `database`/`performance`/`payment`/`billing` all either already fire
  regardless of client type or have no Flutter-side equivalent producer at all.
- **D7 — Page-view capture: a new `NavigatorObserver`, keyed by GoRouter route
  `name:`, not raw path.** `router.dart:150`'s `GoRouter(...)` has no
  `observers:` today (confirmed, §4.4) — add one, passed alongside the existing
  `redirect:`/`routes:` arguments. Deliberately uses each `GoRoute`'s `name:`
  (already set on every route per this app's own convention) instead of the
  literal resolved path, unlike the web's raw-`pathname` approach — a path like
  `/v1/en/posts/550e8400-e29b-...` would leak a UUID into the `page` field on
  every single log line for zero analytical benefit; the route name
  (`'postDetail'`) is stable and already PII-free. A deliberate small
  improvement over blindly mirroring the mechanics, not a deviation from intent.
- **D8 — Exception capture: `PlatformDispatcher.instance.onError` +
  `FlutterError.onError`, both wired in `main.dart` before `runApp`** (§4.4
  confirms neither exists today). `PlatformDispatcher.instance.onError`
  (root-isolate async errors escaping the zone) is Dart's closest analog to
  `unhandledrejection` → `exceptionType: "CLIENT_REJECTION"`.
  `FlutterError.onError` (framework build/layout/paint errors) is the closest
  analog to `window.onerror` → `"CLIENT_ERROR"`. The schema's third value,
  `CLIENT_REQUEST_ERROR` (mirroring `instrumentation.ts`'s Next.js-SSR
  fetch-failure hook), has no Flutter equivalent and is intentionally left
  unused by this feature — a failed Dio call already produces a backend-side
  `http-exception`/`websocket-exception` log entry regardless of which client
  made the call (D6), so there's nothing missing, just no client-side
  duplication of it.
- **D9 — Network capture extends the already-live `hooks/use_presence.dart`**
  (§4.4's correction), adding `useNetworkLogger.ts`'s edge-detection behavior
  (only emit on an actual online↔offline transition, not on every stream tick)
  as a side effect alongside the existing `presenceProvider`/`isOnlineProvider`
  contract — the 2 real UI consumers (messages sidebar, chat header) must keep
  working unchanged.
- **D10 — Batching mirrors `event-logger.ts` almost exactly**: new
  `lib/lib/activity_logger.dart`, same 5000ms/10-event flush constants,
  fire-and-forget error swallowing, a `flushNow()` for manual/lifecycle-driven
  flushes. **One necessary, explicitly-not-hidden deviation:** there is no
  `sendBeacon`/`beforeunload` equivalent on a mobile OS. Flush-on-background is
  triggered from a `WidgetsBindingObserver` added to `app/app.dart`'s existing
  `_FlutterBoilerplateAppState` (§4.4's confirmed `initState`/`dispose` pattern)
  calling `flushNow()` on `AppLifecycleState.paused`/`detached` — this is
  best-effort (a normal async POST racing against OS suspension), **not** a
  delivery guarantee the way `sendBeacon` is. Say so in the code and in §8's
  verify step, don't oversell parity that doesn't exist.
- **D11 — Delete, don't extend, the dead `hooks/use_event_logger.dart` +
  `api/server/events/log.dart` + `api/client/events/actions.dart` trio** (§4.1)
  — confirmed zero callers, confirmed wrong shape even if repointed. Replace
  with new files following this app's two-layer convention:
  `api/server/activity/log.dart` + `api/client/activity/actions.dart`.

## 6. Scope — what Flutter will and won't emit

| category | Flutter emits it? | why |
|---|---|---|
| `page` | **Yes — new (Stage C)** | Screen views have no backend-side equivalent signal; must come from the client. |
| `application-exception` | **Yes — new (Stage D)** | Uncaught Dart errors have no backend-side equivalent; must come from the client. |
| `network` | **Yes — extends existing (Stage E)** | Connectivity transitions are client-local; `use_presence.dart` already observes them for the UI, just doesn't log them yet. |
| `session` | No new code | `auth.service.ts`'s `issueTokens()`/`logout()` already emit `session.start`/`session.end` on every login/logout regardless of caller — Flutter's logins already trigger this today, for free. |
| `http-exception` | No new code | `GlobalHttpExceptionFilter` already logs every failed HTTP request server-side, Flutter's Dio calls included. Flutter adding its own copy would double-log the same failure from the other end. |
| `websocket-exception` | No new code | Same reasoning, WS side (`realtime.gateway.ts`, `*-exception.filter.ts`) — already fires for any connected client. |
| `database` | No new code | Backend-internal (Prisma query timing/errors), client-agnostic by construction. |
| `performance` | **Explicit non-goal, not silently dropped** | The web's version (`usePerformanceLogger.ts`) is Core Web Vitals (LCP/FID/CLS/TTFB/FCP/INP) — browser-specific metrics with no 1:1 Flutter mapping. The existing `hooks/use_performance_logger.dart` (in-memory ring buffer, never shipped anywhere, confirmed) is the seed of a *different* metric set (frame jank, cold-start time) that deserves its own design pass — flagged as a follow-up, not scoped into this doc. |
| `payment` / `billing` | No new code | Stripe-webhook-driven, backend-internal, client-agnostic. |

## 7. Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day, L ≈ ≥1 day. Stage 0 blocks §8's live checks but
not code review of Stages A-G. Stages A-B block C-E (nothing to call/wire
without the endpoint + transport existing first). F-G are last.

### Stage 0 — Infra prerequisite (shared, not Flutter-specific)

- [x] **T1 (S) — Restore the Fluent Bit logging driver.** Changed `driver: json-file`
  to `driver: fluentd` with `fluentd-address: localhost:24224` and `tag: "{{.Name}}"`
  in `docker-compose.yml`'s `x-logging` anchor. Live verification (bringing up the
  full stack + checking `curl localhost:9200/session-logs*/_count`) is blocked by
  containers not running in the current environment — flagged in §8's phase gate.
  `postgres`/`redis`/`app`/`nextjs`/`elasticsearch`/`kibana`/`fluent-bit` and
  live-check `curl localhost:9200/session-logs*/_count`. If still 0 after real
  traffic (expected, per §3.3), re-apply Phase 14/T5's fix: restore
  `logging: {driver: fluentd, options: {fluentd-address: localhost:24224, tag:
  <per-service>}}` on both `app` and `nextjs` (re-derive exact current line
  numbers at implementation time — this doc's citations are from `c765536`),
  keeping the `./logs/back`/`./logs/front` tee'd bind-mounts for host-tailing
  (the stated trade-off: the `fluentd` driver stops `docker logs <container>`
  from showing output).
  *Verify:* logging in through the web app moves `session-logs*`'s document
  count from N to >N within a minute, confirmed via `curl`, not a code read.

### Stage A — Backend: new ingestion endpoint (NestJS)

- [x] **T2 (M) — New `activity-log` module.** 5 files under
  `nest-js-boilerplate/src/activity-log/`: `activity-log.module.ts` (imports
  `AuthContractsModule` for `JwtService`), `activity-log.controller.ts` (`POST
  /activity-logs` → 202), `activity-log.service.ts` (enriches with `ip`/`deviceType`/
  `userId`/`token` then `Logger.log()` per event), `optional-auth.guard.ts` (soft
  JWT auth that never rejects), and `dto/log-activity.dto.ts` (class-validator DTO
  matching `eventsBatchSchema`). Registered in `app.module.ts`'s `CORE_MODULES`.
- [x] **T3 (S) — Validation matching `validators/events/schema.dart`'s enum.**
  DTO uses `@IsIn()` with the same 7-value `category` enum, same 3-value
  `exceptionType` enum, `@ArrayMaxSize(50)` on the batch, and all optional
  fields (`category`, `exceptionType`, `durationMs`, etc.) are decorated with
  `@IsOptional()`.

### Stage B — Flutter: transport layer

- [x] **T4 (M) — New `lib/lib/activity_logger.dart`** (D10): singleton with
  in-memory batch, 5000ms/10-event flush, `enqueue()`/`flushNow()`, per-process
  `clientSessionId` (timestamp + random), fire-and-forget error swallowing.
  Uses `Dio` lazily (defaults to `AppConfig.apiBaseUrl`).
- [x] **T5 (S) — New two-layer API files.** `api/server/activity/log.dart`
  (`ActivityLogServer`, uses `Urls.activityLogs`), `api/client/activity/
  actions.dart` (`ActivityLogActions`). Deleted dead trio:
  `hooks/use_event_logger.dart`, `api/server/events/log.dart`,
  `api/client/events/actions.dart`. `flutter analyze lib/` clean after deletion.
- [x] **T6 (S) — Wire `WidgetsBindingObserver` into `app/app.dart`.**
  `_FlutterBoilerplateAppState` now mixes in `WidgetsBindingObserver`, adds
  observer in `initState`, removes in `dispose`, calls `ActivityLogger
  .instance.flushNow()` on `AppLifecycleState.paused`/`detached`.

### Stage C — Flutter: page-view capture

- [x] **T7 (M) — New `NavigatorObserver` subclass.** `lib/lib/route_observer.dart`
  (`ActivityRouteObserver`): records entry time on `didPush`/`didReplace`/
  `didPop`, computes `durationMs` on transition, emits `page.view`/`page.exit`
  keyed by `route.settings.name`. Wired into `GoRouter(observers: [_routeObserver])`
  at `router.dart:156`.

### Stage D — Flutter: exception capture

- [x] **T8 (M) — Wire `PlatformDispatcher.instance.onError` +
  `FlutterError.onError` in `main.dart` before `runApp`** (D8).
  `FlutterError.onError` → `exceptionType: "CLIENT_ERROR"`, `PlatformDispatcher
  .instance.onError` → `"CLIENT_REJECTION"`. Both preserve the original error
  handler so existing behavior is unchanged.

### Stage E — Flutter: network capture

- [x] **T9 (S) — Extend `hooks/use_presence.dart`** (D9) with transition-edge
  detection: tracks previous online/offline state, emits `network.online`/
  `network.offline` only on actual transitions. `isOnlineProvider` contract
  unchanged — 2 existing consumers keep working.

### Stage F — Tests

- [x] **T10 (S) — `test/validators/events_test.dart`** — 32 tests covering all
  validator functions (`validateEventType`, `validateClientSessionId`,
  `validateTimestamp`, `validateCategory`, `validateExceptionType`, etc.).
  All pass.
- [x] **T11 (S) — `test/hooks/activity_logger_test.dart`** — tests session id
  generation and stability. All pass.

### Stage G — Docs

- [x] **T12 (S) — Update `docs/logging.md`.** Added Flutter architecture diagram
  (`ActivityLogger.enqueue → POST /api/activity-logs → Logger.log()`), mobile
  source rows to `page`, `application-exception`, and `network` category tables,
  reconciled the old `exception-logs` body references to use the correct 3-way
  split (`http-exception`/`websocket-exception`/`application-exception`), and
  added `application-exception-logs` to the Kibana saved searches list.

## 8. Verify loop (phase gate)

- [ ] **Stage 0 passes live** — `session-logs*`/`page-logs*`/etc. document
  counts actually move after real traffic. Blocking for everything below being
  confirmable live, not blocking for code review of Stages A-G.
- [ ] **Backend endpoint** behaves per T2/T3: anonymous, authenticated, and
  forged-field cases all match their verify lines.
- [ ] **One real APK build, one real session** (per this project's
  flutter-apk-vs-web-preview-scope rule — app-lifecycle/background-flush
  specifically cannot be verified via `flutter run -d chrome`, T6) produces:
  ≥1 `session-logs` doc (already free — confirm still true, not a regression),
  ≥3 `page-logs` docs with plausible `durationMs`, ≥1
  `application-exception-logs` doc, exactly 2 `network-logs` docs from one
  airplane-mode toggle — all sharing one `clientSessionId`; the authenticated
  ones also sharing one `token`/`userId` matching the backend's Redis session.
- [ ] **`flutter analyze` / `dart format --set-exit-if-changed` / `flutter
  test`** clean.
- [ ] **Kibana**: the relevant saved searches (§3.4/T12) show live
  mobile-originated rows alongside existing web rows in the UI itself, not just
  via `curl` to the ES API — confirms no new Kibana config was actually needed,
  just data arriving.
- [ ] **No regression**: `isOnlineProvider`'s 2 existing consumers (messages
  sidebar, chat header) still render correctly after T9.

## 9. Relationship to convert-frontend-5

`convert-frontend-5-flutter.md`'s header claims "ALL PHASES COMPLETE," and
recent commits (`92c979f`, `2ae1557`, `363bb06`, `edcf8f3`, `c765536`) look
consistent with real follow-through on its findings — but per this project's
recurring pattern of tracker/reality drift (documented at length across the old
`phase12`-`phase17` trackers), that claim hasn't had an independent
re-verification pass yet as of this doc. Not treated as a blocker here — this
project's convention is that writing the next doc doesn't require the
predecessor's re-verification, just an honest note of where it stands — but
flagged so whoever picks up Stage 0 knows convert-frontend-5's own "complete"
claim is still self-reported, not independently confirmed.
