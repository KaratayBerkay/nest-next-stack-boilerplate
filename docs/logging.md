# Structured Event Logging (Phase 14)

Three Kibana log categories added in Phase 14 — `session`, `exception`, `page` — each routed
to a dedicated Elasticsearch index via Fluent Bit `rewrite_tag`.

## Architecture

```
NestJS Logger.log({ category, event, ... })
        │
        ▼
Pino (nestjs-pino) → stdout → Docker fluentd driver → Fluent Bit port 24224
                                                              │
                                              route_category.lua (rewrite_tag)
                                                         ╱    │    ╲
                                                   session   exception   page
                                                      │         │         │
                                                      ▼         ▼         ▼
                                              session-logs  exception-logs  page-logs
```

Fluent Bit's `route_category.lua` reads the `category` field and rewrites the tag so the
record lands in the correct index. Records without a `category` field keep their original
tag and go to `app-logs` / `frontend-logs` / `messaging-logs`.

## Categories & Event Types

### `session` — session-logs

Events:

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

Events:

| event | source | fields |
|---|---|---|
| `exception.unhandled` | `GlobalHttpExceptionFilter` | `httpStatus` (5xx), `path`, `method`, `ip`, `userAgent`, `deviceType`, `errorMessage`, `stack` |
| `exception.handled` | `GlobalHttpExceptionFilter` | `httpStatus` (4xx), `path`, `method`, `ip`, `userAgent`, `deviceType`, `errorMessage` |
| `exception.websocket` | `AllWsExceptionsFilter` | `socketId`, `ip`, `userAgent`, `deviceType`, `errorMessage`, `stack` |
| `exception.ws_handled` | `CustomWsExceptionFilter` | `socketId`, `ip`, `userAgent`, `deviceType`, `detail` |

### `page` — page-logs (frontend)

Events:

| event | source | fields |
|---|---|---|
| `page.view` | `useEventLogger.ts` — client hook | `url`, `userAgent` |
| `page.exit` | `useEventLogger.ts` — route change / unmount | `url`, `durationMs`, `userAgent` |
| `exception` | `useEventLogger.ts` — ErrorEvent/PromiseRejection | `url`, `message`, `filename`, `lineno`, `colno`, `stack` |

Frontend events are batched client-side and POSTed to `/api/events`, where the BFF enriches
them with `userId`, `sessionId` (via GraphQL `me` query), `ip`, and `deviceType` before
publishing to the `frontend-events` Kafka topic.

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
```

Kibana data views: `session-logs*`, `exception-logs*`, `page-logs*`, `app-logs*`, `frontend-logs*`.

## Kafka / Frontend-Events Pipeline

Frontend events flow through Kafka as a durable buffer:

```
Client → POST /api/events → graphqlFetch(me) → enrich (userId, sessionId, ip, deviceType)
                                                    ↓
                                              publishEvent("frontend-events")
                                                    ↓
                                              Kafka → consumer (future)
```

Kafka is **not** used as the primary log pipeline for backend Node.js logs — those go
directly stdout → Fluent Bit → Elasticsearch (see `docs/backend/research/logger.md`).
Frontend events use Kafka only because:
- They originate on the client and reach the backend via HTTP, so there is no stdout stream to tail.
- Kafka provides at-least-once delivery for event data that may drive analytics or audit.
- The Kafka profile already exists (`docker compose --profile kafka up -d`).

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
`messaging-ws`) and route to the general indices. (Fluent Bit's generic `lua` filter plugin
cannot rewrite tags — its callback contract is strictly `(code, timestamp, record)` — so tag
rewriting must go through the dedicated `rewrite_tag` filter, not a Lua script.)
