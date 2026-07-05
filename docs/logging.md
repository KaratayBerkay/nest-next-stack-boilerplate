# Structured Event Logging (Phase 14 / Phase 16)

Three Kibana log categories — `session`, `exception`, `page` — each routed to a dedicated
Elasticsearch index via Fluent Bit `rewrite_tag`. Events flow Pino → stdout → Fluent Bit → ES
from both the backend (NestJS) and frontend (Next.js). Kafka/`frontend-events` remains only
for events with no `category`.

## Architecture

```
Backend (NestJS):
  Logger.log({ category, event, ... })
    ↓
  Pino → stdout → Docker fluentd driver → Fluent Bit port 24224
                                              ↓
                                  rewrite_tag by $category
                                    ╱    │    ╲
                              session exception page
                                │       │       │
                                ▼       ▼       ▼
                        session-logs  exception-logs  page-logs

Frontend (Next.js):
  useEventLogger → POST /api/events
    ↓
  BFF enriches (userId, sessionId, ip, deviceType)
    ↓
  category present? → Pino (stdout → Fluent Bit → ES)
  no category?      → Kafka (frontend-events topic)
```

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

### `exception` — exception-logs

| event | source | fields |
|---|---|---|
| `exception.unhandled` | `GlobalHttpExceptionFilter` | `httpStatus` (5xx), `path`, `method`, `ip`, `userAgent`, `deviceType`, `errorMessage`, `stack` |
| `exception.handled` | `GlobalHttpExceptionFilter` | `httpStatus` (4xx), `path`, `method`, `ip`, `userAgent`, `deviceType`, `errorMessage` |
| `exception.websocket` | `AllWsExceptionsFilter` | `socketId`, `ip`, `userAgent`, `deviceType`, `errorMessage`, `stack` |
| `exception.ws_handled` | `CustomWsExceptionFilter` | `socketId`, `ip`, `userAgent`, `deviceType`, `detail` |
| `connection-loss` | `realtime.gateway.ts` — close handler | `token`, `userId`, `code`, `reason` |
| `device-change` | `DeviceIpMiddleware` | `deviceId`, `previousIp`, `newIp` |
| `exception` (frontend) | `useEventLogger.ts` | `url`, `exceptionType`, `message`, `stack` |
| `CLIENT_REQUEST_ERROR` | `instrumentation.ts` — `onRequestError` | `route`, `message` |

### `page` — page-logs (frontend)

| event | source | fields |
|---|---|---|
| `page.view` | `useEventLogger.ts` — client hook | `url`, `category`, `event`, `page` |
| `page.exit` | `useEventLogger.ts` — route change / unmount | `url`, `category`, `event`, `page`, `durationMs` |

## Querying in Kibana

```json
// All session events for a specific user
GET session-logs/_search
{
  "query": { "term": { "userId": "usr_abc123" } }
}

// Exception events in the last hour
GET exception-logs/_search
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
GET exception-logs/_search
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
GET exception-logs/_search
{
  "query": { "term": { "event": "device-change" } }
}
```

Kibana saved searches: `session-logs-search`, `exception-logs-search`, `page-logs-search`
(imported via `kibana-saved-objects.ndjson`). Data views: `session-logs*`, `exception-logs*`,
`page-logs*`, `app-logs*`, `frontend-logs*`.

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
`session-logs*`, `exception-logs*`, `page-logs*` indices. Key decisions:
- All string fields (`token`, `userId`, `deviceType`, etc.) are mapped as `keyword` (not
  `text`) so they are aggregatable and sortable in Kibana.
- `errorMessage`, `stack`, `detail` are `text` for full-text search.
- `metadata` is `enabled: false` (opaque blob stored but not indexed).
- `ip` is mapped to the `ip` field type for CIDR-range queries.

Apply via:

```bash
curl -X PUT "localhost:9200/_index_template/structured-logs" \
  -H "Content-Type: application/json" \
  -d @docker/elasticsearch/index-template-structured-logs.json
```

## Fluent Bit Routing

Two `[FILTER] Name rewrite_tag` blocks in `fluent-bit.conf` (one matching the raw `app` tag,
one matching `frontend`) inspect each record's `category` field and rewrite the tag to
`session`/`exception`/`page` when it matches, via the `$category ^(session|exception|page)$ $1`
rule. The corresponding `[OUTPUT]` blocks then send rewritten records to the correct index.
Records without a `category` field keep their original tag (`app`, `frontend`,
`messaging-ws`) and route to the general indices.
