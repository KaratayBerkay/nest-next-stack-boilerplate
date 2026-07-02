# Frontend event logging — Kafka pipeline

## Problem

The Next.js boilerplate needs client-side telemetry (page views, errors, user actions)
shipped to a durable backend so operators can answer "what happened in the browser?"
alongside backend audit logs.

## What exists

### Frontend
- **OpenTelemetry** via `@vercel/otel` (`src/instrumentation.ts`): server-side spans + errors,
  stored in-memory for the observability demo. **No client/browser telemetry.**
- **No structured event logger.** No batching, no transport to backend.

### Backend
- **Kafka** (`apache/kafka:3.9.0`, KRaft, `docker compose --profile kafka up -d`):
  single-node, PLAINTEXT, port `9092`. Already in compose, used only for e2e broker tests.
- **Elasticsearch** (`docker compose --profile logging up -d`): `audit-logs` index for backend
  audit, plus `app-logs` via Fluent Bit. The `FrontendEventConsumer` writes to a new
  `frontend-events` index.
- **`ElasticsearchService`** (`src/outbox/elasticsearch.service.ts`): fire-and-forget index
  helper that never throws — safe to call from any consumer.

### Event schema (shared)
`src/lib/events.schema.ts` defines `FrontendEvent` validated with Zod:
```typescript
interface FrontendEvent {
  eventType: string;       // "page.view" | "error" | "action.click" | ...
  clientSessionId: string; // UUID per browser session, persisted in sessionStorage
  timestamp?: string;      // ISO 8601, added client-side
  userId?: string;
  url?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}
```

## Architecture

```
Browser
  │ capture: error, unhandledrejection, page.view
  │ batched (5s / 10 events)
  ▼
POST /api/events            ← Next.js Route Handler (BFF)
  │ validates with Zod
  │
  ▼
kafkajs producer             ← server-only (src/lib/kafka.ts)
  │
  ▼
Kafka topic: frontend-events  ← durable buffer (compose --profile kafka)
  │
  ▼
FrontendEventConsumer         ← NestJS OnModuleInit service
  │ uses ElasticsearchService
  ▼
ES index: frontend-events     ← Kibana data view
```

### Design decisions

| Decision | Choice | Rationale |
|---|---|---|
| Browser → Kafka directly? | **No — always through BFF** | Never expose Kafka credentials to the browser. BFF validates + enriches before publish. |
| Batching | **5s interval or 10 events, whichever comes first** | Reduces BFF load; one Kafka message per batch. |
| Fire-and-forget on client | **Yes** | Errors are captured but never thrown to the user. |
| Session ID | **`crypto.randomUUID()`, persisted in `sessionStorage`** | Survives page reloads within a tab; lost on tab close (expected). |
| Unload guarantee | **`navigator.sendBeacon`** | Batched events flush synchronously on `beforeunload` (no `fetch` race). |
| Kafka retry on failure | **None on the BFF** | Best-effort only. If Kafka is down, the client batch is dropped (frontend events are telemetry, not business data). |
| Consumer group | `frontend-events-indexer` | Single consumer; auto-commit offsets. |

## Runbook

```bash
# 1. Start infrastructure
docker compose --profile kafka up -d          # Kafka
docker compose --profile logging up -d         # ES + Kibana

# 2. Start NestJS backend (consumer connects automatically)
cd ../nest-js-boilerplate && pnpm start:dev

# 3. Start Next.js frontend
cd ../next-js-boilerplate && pnpm dev

# 4. Generate events
open http://localhost:3000                     # triggers page.view

# 5. Verify in Elasticsearch
curl 'localhost:9200/frontend-events/_search?pretty'

# 6. Kibana
open http://localhost:5601                     # create data view: frontend-events*
```

## Testing

The pipeline is best tested end-to-end (Kafka + ES running):
1. Open the frontend → triggers `page.view`
2. `FrontendEventConsumer` connects to Kafka and indexes into ES
3. Query `frontend-events` index for the session

Unit coverage:
- `src/lib/events.schema.ts` — Zod validates the schema (`events.schema.test.ts`)
- `src/lib/event-logger.ts` — subscribe/unsubscribe pattern (`event-logger.test.ts`)

## Architecture note — interim deviation from target

This in-app producer/consumer pair (`kafkajs` in both Next.js and NestJS) is an
**interim deviation** from the target architecture described in `docs/logging.md`
(which keeps Kafka and ES clients out of both apps by relaying logs through a
Fluent Bit shipper/indexer sidecar). The `FRONTEND_EVENTS_CONSUMER_ENABLED=false`
config gate on the backend consumer is the migration path: when Phase 2 replaces
the in-app consumer with a Fluent Bit → ES pipeline, set the flag to `false` and
remove the `kafkajs` dependency from the backend.

