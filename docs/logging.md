# Structured Event Logging (Phase 14 / Phase 16)

> **2026-07-25 — routing changed from per-category to per-source.** Indices are
> now `mobile-logs` / `web-logs` / `backend-logs` — one per producer, every
> category mixed together inside each — instead of one index per category
> shared across producers. The old category-based indices below (`session-logs`,
> `page-logs`, etc.) are **frozen**: they keep their historical data but no
> longer receive new writes. See §Index Reference (current) and §Fluent Bit
> Routing for the new scheme; the rest of this doc (event types, field names)
> is still accurate, just no longer tells you *which index* a given event ends
> up in.

## Index Reference (current — source-based)

| ES index | producer | contains |
|---|---|---|
| `mobile-logs` | Flutter, via `POST /activity-logs` | Everything the mobile app reports: `page`, `application-exception`, `network` — identified by the `origin: "mobile"` field `ActivityLogService` stamps on every event it logs |
| `web-logs` | Next.js (browser + its own BFF routes) | Everything the web app's own server process logs: `page`, `application-exception`, `network`, plus its own request/response logging — identified by Docker's `frontend*` tag, no per-record marker needed since Next.js only ever serves the browser app |
| `backend-logs` | NestJS, everything else | Every category the backend logs on its own regardless of which client triggered it: `session`, `http-exception`, `websocket-exception`, `database`, `performance`, `payment`, `billing`, backend-originated `network` (rate-limiting/CSRF), messaging/WS gateway activity, and generic framework/request logging with no `category` at all |

A record's `category`/`event` fields (§Categories & Event Types below) still tell
you *what* happened; the index it lands in now tells you *who* reported it, not
what kind of thing it was.

### Index Reference (historical — frozen, pre-2026-07-25 data only)

| ES index | category / source | description |
|---|---|---|
| `session-logs` | `session` | Backend session lifecycle, WebSocket connect/auth/disconnect |
| `http-exception-logs` | `http-exception` | HTTP error responses (4xx, 5xx) |
| `websocket-exception-logs` | `websocket-exception` | WebSocket errors, connection losses, device IP changes |
| `application-exception-logs` | `application-exception` | Browser-side exceptions |
| `page-logs` | `page` | Frontend page navigation (view, exit) |
| `network-logs` | `network` | Rate limits, CSRF failures, connectivity changes |
| `database-logs` | `database` | Slow queries, query errors |
| `performance-logs` | `performance` | Backend slow requests, frontend Core Web Vitals |
| `payment-logs` | `payment` | Payment events (Pino stdout → Fluent Bit → ES) |
| `billing-logs` | `billing` | Billing events (Pino stdout → Fluent Bit → ES) |
| `app-logs` | (no category — backend fallback) | All backend records without a matching category |
| `frontend-logs` | (no category — frontend fallback) | All frontend records without a matching category |

Events flow Pino → stdout → Fluent Bit → ES from the backend (NestJS), frontend (Next.js), and mobile (Flutter). Kafka/`frontend-events` remains only for events with no `category`.

**Mobile (Flutter)** cannot participate in stdout capture directly (no container stdout). Instead, Flutter sends batched events to a dedicated NestJS endpoint `POST /activity-logs` (see §Architecture), which enriches them server-side and logs via the same Pino → Fluent Bit pipeline. Note the real route is `/activity-logs`, not `/api/activity-logs` — the latter was a real bug in the Flutter client fixed the same day this routing change landed.

## Architecture

```
Backend (NestJS), all its own activity — session, exceptions, database,
performance, payment, billing, rate limiting, messaging/WS gateway, generic
request logging:
  Logger.log({ category, event, ... })   ← no `origin` field
    ↓
  Pino → stdout → Docker fluentd driver (tag: "app") → Fluent Bit port 24224
    ↓
  rewrite_tag: origin=mobile? no (falls through) → tag "backend"
    ↓
  backend-logs

Mobile (Flutter) — the ONE path that also runs through the same NestJS
process, since Flutter has no server of its own:
  ActivityLogger.enqueue → batch (5s / 10 events)
    ↓
  POST /activity-logs (NestJS — not /api/activity-logs, no Next.js involved)
    ↓
  OptionalAuthGuard (soft-resolve userId/sessionId if token present)
    ↓
  ActivityLogService enriches (ip, deviceType from platform hint) AND stamps
  origin: "mobile" — the ONE field that distinguishes this from the rest of
  the backend's own logging, sharing the same "app" Docker tag
    ↓
  Logger.log({ origin: "mobile", category, event, ... }) per event
    ↓
  Pino → stdout → Docker fluentd driver (tag: "app") → Fluent Bit
    ↓
  rewrite_tag: origin=mobile? yes → tag "mobile"
    ↓
  mobile-logs

Frontend (Next.js) — its own server process, own Docker tag, no per-record
marker needed since it only ever serves the browser app:
  useEventLogger → POST /api/events
    ↓
  BFF enriches (userId, sessionId, ip, deviceType)
    ↓
  category present? → Pino → stdout → Docker fluentd driver (tag: "frontend")
                        ↓
                      Fluent Bit → web-logs (direct match, no rewrite needed)
  no category?      → Kafka (frontend-events topic, unchanged)
```

**Why `origin` and not `source`:** Docker's fluentd log driver already injects
its own top-level `source` field (`stdout`/`stderr`) into every record before
Fluent Bit ever sees it. A same-named field from the application payload
collides and silently loses — confirmed by a live test where every
activity-log event landed with `source: "stdout"` instead of the intended
value, routing everything to `backend-logs` regardless of what
`ActivityLogService` actually logged. `origin` doesn't collide with anything
Docker or Fluent Bit inject.

## Categories & Event Types

### `session` — session-logs

| event | source | fields |
|---|---|---|
| `session.start` | `auth.service.ts` — `issueTokens()` | `token`, `userId`, `ip`, `deviceId`, `deviceType`, `userAgent`, `issuedAt` |
| `session.end` | `auth.service.ts` — `logout()` | `token`, `userId`, `sessionDurationMs`, `reason` |
| `session.ip_change` | `session-auth.guard.ts` — `canActivate()` | `token`, `userId`, `oldIp`, `newIp`, `userAgent`, `deviceType` |
| `session.ua_change` | `session-auth.guard.ts` — `canActivate()` | `token`, `userId`, `userAgent`, `deviceType` |
| `ws.connect` | `realtime.gateway.ts` — `connection` | `ip`, `userAgent`, `deviceType` |
| `ws.auth_success` | `realtime.gateway.ts` — `handleAuth()` | `token`, `userId`, `socketId` |
| `ws.auth_fail` | `realtime.gateway.ts` — `handleAuth()` | `reason`, `userId` (if known) |
| `ws.disconnect` | `realtime.gateway.ts` — `close` | `token`, `userId`, `socketId` |
| `ws.heartbeat_timeout` | `realtime.gateway.ts` — heartbeat interval | `token`, `userId`, `socketId` |

### `database` — database-logs

| event | source | fields |
|---|---|---|
| `db.query_slow` | `PrismaService` — Prisma `$on('query')` | `query`, `durationMs`, `params` |
| `db.query_error` | `PrismaService` — Prisma `$on('error')` | `errorMessage` |

### `performance` — performance-logs

| event | source | fields |
|---|---|---|
| `perf.slow_request` | `PerformanceInterceptor` (NestJS) | `method`, `path`, `durationMs`, `statusCode`, `ip`, `userAgent`, `deviceType` |
| `perf.page_lcp` | `usePerformanceLogger` (frontend — `useReportWebVitals`) | `url`, `value`, `rating` |
| `perf.page_fid` | `usePerformanceLogger` (frontend) | `url`, `value`, `rating` |
| `perf.page_cls` | `usePerformanceLogger` (frontend) | `url`, `value`, `rating` |
| `perf.page_ttfb` | `usePerformanceLogger` (frontend) | `url`, `value`, `rating` |
| `perf.page_fcp` | `usePerformanceLogger` (frontend) | `url`, `value`, `rating` |
| `perf.page_inp` | `usePerformanceLogger` (frontend) | `url`, `value`, `rating` |

### `network` — network-logs

| event | source | fields |
|---|---|---|
| `network.rate_limited` | `HttpThrottlerGuard` (NestJS), events Route Handler (Next.js) | `ip`, `path`, `method`, `userAgent`, `deviceType` |
| `network.csrf_fail` | `CsrfGuard` (NestJS) | `ip`, `path`, `method`, `userAgent`, `deviceType` |
| `network.offline` | `useNetworkLogger` (web frontend) | `url` |
| `network.online` | `useNetworkLogger` (web frontend) | `url` |
| `network.offline` | `hooks/use_presence.dart` — Flutter connectivity transition (D9) | `clientSessionId`, `category`, `event` |
| `network.online` | `hooks/use_presence.dart` — Flutter connectivity transition (D9) | `clientSessionId`, `category`, `event` |

### `application-exception` — application-exception-logs

| event | source | fields |
|---|---|---|
| `exception.unhandled` | `GlobalHttpExceptionFilter` (NestJS) | `httpStatus` (5xx), `path`, `method`, `ip`, `userAgent`, `deviceType`, `errorMessage`, `stack` |
| `exception.handled` | `GlobalHttpExceptionFilter` | `httpStatus` (4xx), `path`, `method`, `ip`, `userAgent`, `deviceType`, `errorMessage` |
| `exception.websocket` | `AllWsExceptionsFilter` | `socketId`, `ip`, `userAgent`, `deviceType`, `errorMessage`, `stack` |
| `exception.ws_handled` | `CustomWsExceptionFilter` | `socketId`, `ip`, `userAgent`, `deviceType`, `detail` |
| `connection-loss` | `realtime.gateway.ts` — close handler | `token`, `userId`, `code`, `reason` |
| `device-change` | `DeviceIpMiddleware` | `deviceId`, `previousIp`, `newIp` |
| `exception` (frontend) | `useEventLogger.ts` | `url`, `exceptionType`, `message`, `stack` |
| `CLIENT_REQUEST_ERROR` | `instrumentation.ts` — `onRequestError` | `route`, `message` |
| `application-exception.framework_error` | `FlutterError.onError` in `main.dart` (D8) | `exceptionType: "CLIENT_ERROR"`, `metadata.exception`, `metadata.stack`, `clientSessionId` |
| `application-exception.unhandled_error` | `PlatformDispatcher.instance.onError` in `main.dart` (D8) | `exceptionType: "CLIENT_REJECTION"`, `metadata.exception`, `metadata.stack`, `clientSessionId` |

### `page` — page-logs (frontend + mobile)

| event | source | fields |
|---|---|---|
| `page.view` | `useEventLogger.ts` — web client hook | `url`, `category`, `event`, `page` |
| `page.exit` | `useEventLogger.ts` — route change / unmount | `url`, `category`, `event`, `page`, `durationMs` |
| `page.view` | `ActivityRouteObserver` — Flutter `NavigatorObserver` (D7) | `page` (route `name:`), `clientSessionId`, `category`, `event` |
| `page.exit` | `ActivityRouteObserver` — Flutter `NavigatorObserver` (D7) | `page` (route `name:`), `clientSessionId`, `category`, `event`, `durationMs` |

## Querying in Kibana

**As of 2026-07-25**, the examples below query the old, now-frozen
category-indices — still correct for historical (pre-2026-07-25) data, but
new data won't show up there. For current data, query the source index
(`mobile-logs` / `web-logs` / `backend-logs`) and add a `category`/`event`
filter, e.g. the first example below becomes:

```json
// All session events for a specific user (current data)
GET backend-logs/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "category": "session" } },
        { "term": { "userId": "usr_abc123" } }
      ]
    }
  }
}
```

```json
// All session events for a specific user
GET session-logs/_search
{
  "query": { "term": { "userId": "usr_abc123" } }
}

// Exception events in the last hour
GET application-exception-logs/_search
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "@timestamp": { "gte": "now-1h" } } },
        { "term": { "category": "exception" } }
      ]
    }
  }
}

// Page exits with duration > 30s (slow pages)
GET page-logs/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "event": "page.exit" } },
        { "range": { "durationMs": { "gt": 30000 } } }
      ]
    }
  }
}

// Connection losses (abnormal WS close codes)
GET websocket-exception-logs/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "event": "connection-loss" } },
        { "range": { "code": { "gt": 1001 } } }
      ]
    }
  }
}

// Device IP changes
GET websocket-exception-logs/_search
{
  "query": { "term": { "event": "device-change" } }
}

// Rate-limited requests (debugging 429s)
GET network-logs/_search
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "@timestamp": { "gte": "now-24h" } } },
        { "term": { "event": "network.rate_limited" } }
      ]
    }
  }
}

// CSRF failures (potential CSRF attacks or misconfigured clients)
GET network-logs/_search
{
  "query": { "term": { "event": "network.csrf_fail" } }
}

// Connectivity issues experienced by users
GET network-logs/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "event": "network.offline" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}

// Slow database queries (>500ms) in the last hour
GET database-logs/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "event": "db.query_slow" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}

// Database query errors
GET database-logs/_search
{
  "query": { "term": { "event": "db.query_error" } }
}

// Slow backend requests (>1s) in the last hour
GET performance-logs/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "event": "perf.slow_request" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}

// Poor Core Web Vitals (LCP > 2500ms or CLS > 0.1)
GET performance-logs/_search
{
  "query": {
    "bool": {
      "filter": [
        { "terms": { "event": ["perf.page_lcp", "perf.page_cls"] } },
        { "range": { "@timestamp": { "gte": "now-24h" } } }
      ]
    }
  }
}
```

**Current saved searches (2026-07-25):** `mobile-logs-search`, `web-logs-search`,
`backend-logs-search` — these are the ones with live, current data. Imported via
`kibana-saved-objects.ndjson`'s `POST /api/saved_objects/_import` (also confirmed,
while adding these 3, that this file had never actually been imported into Kibana
before at all — the pre-existing category saved searches only became real objects
in Kibana as a side effect of this same import).

**Historical saved searches (frozen data only):** `session-logs-search`,
`application-exception-logs-search`, `page-logs-search`, `network-logs-search`,
`database-logs-search`, `performance-logs-search`. Data views: `session-logs*`,
`application-exception-logs*`, `page-logs*`, `network-logs*`, `database-logs*`,
`performance-logs*`, `app-logs*`, `frontend-logs*`.

## Kafka / Frontend-Events Pipeline

Frontend events *without* a `category` field still flow through Kafka as a durable buffer:

```
Client → POST /api/events → enrich → category? → no → publishEvent("frontend-events") → Kafka
```

Category-bearing events (`session`, `page`, `exception`) are logged via Pino directly
(stdout → Fluent Bit → ES) instead, matching the backend's pipeline. This avoids Kafka
as a dependency for observability data and keeps the critical path simple.

## ES Index Template

The file `docker/elasticsearch/index-template-structured-logs.json` defines the mapping for
`session-logs*`, `http-exception-logs*`, `websocket-exception-logs*`, `application-exception-logs*`,
`page-logs*`, `network-logs*`, `database-logs*`, `performance-logs*`, `payment-logs*`, `billing-logs*`,
and (as of 2026-07-25) `mobile-logs*`, `web-logs*`, `backend-logs*` indices. Key decisions:
- All string fields (`token`, `userId`, `deviceType`, `origin`, etc.) are mapped as `keyword` (not
  `text`) so they are aggregatable and sortable in Kibana.
- `errorMessage`, `stack`, `detail` are `text` for full-text search.
- `metadata` is `enabled: false` (opaque blob stored but not indexed).
- `ip` is mapped to the `ip` field type for CIDR-range queries.

**This template was never actually registered with the cluster before
2026-07-25** — confirmed via `GET _index_template`, which showed no template
matching these patterns despite the file existing and being documented here.
The old category indices have been relying on ES's default dynamic mapping
this whole time, not this template. Registered for the first time as part of
the source-based routing change; harmless for the old (already-created,
frozen) indices, and now actually applies to any new index matching these
patterns, including the 3 new ones.

Apply via:

```bash
curl -X PUT "localhost:9200/_index_template/structured-logs" \
  -H "Content-Type: application/json" \
  -d @docker/elasticsearch/index-template-structured-logs.json
```

## Fluent Bit Routing (current — source-based)

`frontend*`-tagged records (Next.js) go straight to `web-logs` via a single
`[OUTPUT] Match frontend*` block — no rewrite needed, since Next.js only ever
serves the browser app.

`app*`-tagged records (NestJS — including everything `ActivityLogService`
logs on Flutter's behalf) need splitting, since mobile shares this container's
Docker tag with the backend's own logging. This is **two separate
`[FILTER] Name rewrite_tag` blocks**, not one filter with two `Rule` lines:

```
[FILTER]
    Name          rewrite_tag
    Match         app*
    Rule          $origin ^(mobile)$ mobile false
    Emitter_Name  re_emit_app_mobile

[FILTER]
    Name          rewrite_tag
    Match         app*
    Rule          $service ^(.*)$ backend false
    Emitter_Name  re_emit_app_backend
```

**Why two filters, not one filter with two `Rule` lines:** tried that first —
`Rule $origin ^(mobile)$ mobile false` followed by `Rule $service ^(.*)$
backend false` in the *same* filter block. Confirmed live that every `app*`
record ended up tagged `backend` regardless of whether the mobile rule also
matched — multiple `Rule` lines in one `rewrite_tag` filter did not behave as
first-match-wins the way the old single-rule-per-filter category routing did.
Two sequential filters sidestep the question entirely: filter 1 consumes
(`Keep=false`) anything with `origin=mobile`; only records that did *not*
match filter 1 are still tagged `app*` by the time filter 2's catch-all runs,
so it only ever sees genuine backend-internal records. Not fully root-caused
*why* the single-filter version behaved that way — flagging as unresolved
Fluent Bit behavior, not asserting a definitive explanation.

`messaging-ws*` (WS gateway activity) folds into `backend-logs` via its own
direct `[OUTPUT]` match, same reasoning as `frontend*` — it's unambiguously
backend-internal, no splitting needed.

Records get `service: nest-boilerplate` / `service: next-js-boilerplate`
(added by `modify` filters, unchanged from before) regardless of which of the
3 new indices they end up in — that field alone was never enough to
distinguish mobile from backend-internal, since both share the `app*` tag;
`origin` is what actually does the splitting.

### Fluent Bit Routing (historical — how the frozen category indices got there)

Two `[FILTER] Name rewrite_tag` blocks (one matching the raw `app` tag, one
matching `frontend`) inspected each record's `category` field and rewrote the
tag to the matching index via the rule `$category
^(session|page|http-exception|websocket-exception|application-exception|network|database|performance|payment|billing)$
$1`. Retired as of 2026-07-25 in favor of the source-based scheme above — the
old indices still exist with their historical data, just no active routing
writes to them anymore.
