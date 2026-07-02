# Logging — options & decision

The repo currently uses NestJS's **built-in `Logger`** (`@nestjs/common`) for application
logs. That is **not acceptable** for this boilerplate. This doc lays out the realistic
options and a recommendation, split into the two layers that "logging" actually means:

1. **The logger** — what produces log records in-process (format, levels, context).
2. **The destination/transport** — where those records go and how they get there.

Don't conflate the two; you pick one from each layer.

---

## Why the built-in `Logger` is rejected

- **Unstructured.** Human-readable console text, not JSON — can't be queried, filtered, or
  indexed by a log backend without brittle regex parsing.
- **No correlation.** No request-id / trace-id woven through logs. We *have*
  `requestId`/`correlationId` columns on `AuditLog` (`prisma/schema.prisma:810`) but app logs
  aren't tagged with them, so you can't stitch a request's lines together.
- **Console-only.** Writes to stdout/stderr with no transport, no sampling, no async
  flushing, no shipping. In prod that's just container logs that scroll away.
- **Slow under load.** Synchronous string formatting on the event loop.
- **No per-env config.** Level/format aren't configurable; `main.ts` never calls `useLogger()`.

## What we already have (don't rebuild this)

This repo already ships a **domain audit trail** — a *separate* concern from app logging:

```
domain event → OutboxService → broker (BullMQ/Kafka) → AuditLogProcessor → Prisma `AuditLog`
```

`AuditLogProcessor` (`src/outbox/audit-log.processor.ts`) is the single place audit events
are persisted, with an `exportToSearch()` **no-op stub** already wired as the Elasticsearch
hook. `AuditLog` has `level` (`LogLevel` enum: TRACE…FATAL), actor, before/after JSONB, ip,
`requestId`, `correlationId`. Checklist item **#32 "Logging"** is 🔵 for exactly this.

⇒ **Audit logging is solved.** This doc is about the *application/diagnostic* log stream
(boot, requests, errors, jobs) — the thing the built-in `Logger` does today.

---

## Layer 1 — the logger

### Option A — Pino via `nestjs-pino`  ⭐ recommended

The de-facto standard for NestJS. Structured **JSON**, extremely fast (async, off the hot
path), auto HTTP request/response logging with a generated/propagated `req.id`, redaction of
secrets, child loggers per context.

```
pnpm add nestjs-pino pino pino-http
pnpm add -D pino-pretty            # dev: pretty console; prod stays JSON
```

- Replaces Nest's logger app-wide: `app.useLogger(app.get(Logger))` + `bufferLogs: true`.
- Drop-in: existing `new Logger(Foo.name)` call sites keep working through the Nest bridge.
- Gives us the **`requestId`/`correlationId`** we already model — feed `pino-http`'s `genReqId`
  from an incoming `x-request-id` / `x-correlation-id` header and the whole request's lines
  share it. Closes the correlation gap above.
- **Cost:** JSON logs are less pretty in raw `docker logs` (solved by `pino-pretty` in dev).

### Option B — Winston via `nest-winston`

Most flexible, huge transport ecosystem (files w/ rotation, HTTP, many SaaS). Choose this
**only if** you need to write to several destinations *from inside the process* without an
external collector. Trade-off: noticeably slower than Pino, more config surface.

```
pnpm add nest-winston winston
```

### Option C — built-in `Logger` + custom JSON transport

Keep `@nestjs/common` `Logger` but implement `LoggerService` to emit JSON. Minimal deps,
minimal features — no async flushing, no request logging, no redaction. Only worth it if we
deliberately want zero new dependencies. Not recommended.

### Option D — OpenTelemetry Logs (`nestjs-otel` + OTel SDK)

Vendor-neutral. Emit logs as OTLP alongside **traces + metrics**, correlated by `trace_id`,
exported to any OTel backend (Grafana stack, Datadog, Tempo/Loki, etc.). Best long-term
observability story, but heavier to stand up and overkill if we only want good logs today.
Viable path: **Pino now, add OTel exporter later** — they compose.

| Logger | Format | Speed | Req logging | Effort | Notes |
|---|---|---|---|---|---|
| **Pino** (`nestjs-pino`) | JSON | ★★★★★ | built-in | low | recommended default |
| Winston | JSON/any | ★★★ | manual | med | multi-transport in-proc |
| built-in + custom | JSON | ★★ | none | low | min deps, min features |
| OpenTelemetry | OTLP | ★★★★ | via instrumentation | high | unifies logs+traces+metrics |

---

## Layer 2 — where logs go (transport & backend)

**Guiding principle (12-factor):** the app writes structured logs to **stdout** and stays
dumb about destinations. A separate **collector** ships them. This keeps logging off the
request path and makes the backend swappable without code changes. Almost every option below
is "app → stdout → collector → backend."

### 1. stdout → log collector → backend  ⭐ recommended shape
App logs JSON to stdout; a sidecar/agent tails and forwards:
- **Vector**, **Fluent Bit**, or **Promtail** as the collector.
- Backend: **Grafana Loki** (cheap, label-based — great default), **Elasticsearch/Kibana**
  (rich full-text search), or **ClickHouse** (very high volume, cheap storage).
- ✅ Decoupled, resilient, no app changes to switch backends. ❌ One more moving part to run.

### 2. Kafka as the log pipeline
Logs flow through **Kafka** as a durable buffer, then a consumer indexes them into a backend
(ELK/ClickHouse/Loki). **We already run Kafka** as a compose profile
(`apache/kafka:3.9.0`, `docker compose --profile kafka up -d`) and already use it as the
outbox broker — so this is the most "native to this repo" heavy option.

Two ways to get logs into Kafka — **pick the collector, not the in-process path**:
- ✅ **app → stdout → Vector/Fluent Bit → Kafka → indexer.** Keeps logging async and
  decoupled; the collector handles batching/backpressure.
- ⚠️ **app → Kafka directly** (e.g. a `pino` Kafka transport / `pino-kafka`). Tempting since
  Kafka is already here, but it puts a network broker in the logging path: if Kafka is slow
  or down, you risk backpressure/lost logs, and you couple the app to broker availability.
  Use only with a worker-thread transport + local disk fallback.

When Kafka **is** worth it: very high log volume, multiple independent consumers of the log
stream (index + alert + archive to S3), or you want the *same* bus already carrying domain
events. For a boilerplate's app logs alone, it's usually over-engineered — **Loki/ELK via a
collector is simpler**. Reserve Kafka for the audit/event stream it already serves.

### 3. Managed / SaaS sink
`pino` → HTTP transport to **Better Stack (Logtail)**, **Axiom**, **Datadog**, **Grafana
Cloud**, **New Relic**. Zero infra to run; pay per GB. Good for getting shipped fast; watch
cost and data-residency.

### 4. Elasticsearch (ties into existing stub)
We already left `AuditLogProcessor.exportToSearch()` as the ES hook. If we stand up ES for
**audit** search, app logs can share the same cluster (`pino-elasticsearch` or via the
collector). One cluster, two indices (`app-logs-*`, `audit-*`). Reuses infra we half-planned.

| Backend | Best for | Cost | Runs where |
|---|---|---|---|
| **Loki + Grafana** | labels, cheap, k8s-native | $ | self-host / Grafana Cloud |
| **Elasticsearch/Kibana** | full-text search, audit | $$$ | self-host / Elastic Cloud |
| **ClickHouse** | huge volume, analytics | $$ | self-host |
| **Kafka → indexer** | durable buffer, fan-out | $$$ ops | **already in compose** |
| **SaaS** (Axiom/Datadog/Better Stack) | zero-ops, fast start | $$–$$$$ | managed |

---

## Recommendation

For this boilerplate:

1. **Logger: `nestjs-pino`** (structured JSON, request logging, `requestId`/`correlationId`
   propagation). Bridge the built-in `Logger` so existing call sites keep working.
2. **Transport: app → stdout → collector.** Default backend **Grafana Loki** for its
   low cost and simple ops; document **Kafka → ELK** as the heavy-duty alternative that
   **reuses the Kafka profile and the `exportToSearch` ES stub already in the repo**.
3. **Correlation:** generate/propagate `x-request-id` in `pino-http`, reuse the same id on
   `AuditLog.requestId`/`correlationId` so app logs and the audit trail line up.
4. **Later:** add an **OpenTelemetry** exporter to unify logs with traces/metrics — Pino
   composes with OTel, so this isn't a rewrite.

This keeps app logging and the existing audit pipeline as two clean layers, structured and
queryable, without putting a broker in the request hot path.

### Next steps (when we implement)
- [x] Add `nestjs-pino`; wire `app.useLogger` + `bufferLogs: true` in `main.ts`. → `src/logging/logging.module.ts`, `src/main.ts`.
- [x] `pino-http` `genReqId` from `x-request-id`/`x-correlation-id`; redact auth headers/cookies. → `src/logging/logging.config.ts` + `request-context.ts`.
- [x] Thread that id into `OutboxService` so `AuditLog.correlationId` matches app logs. → `OutboxService.emit` reads `getRequestId()`.
- [x] `pino-pretty` for dev, raw JSON for prod (gate on `NODE_ENV`). → `buildPinoHttpOptions`.
- [x] Pick a backend + collector; add a compose profile. → **Elasticsearch + Kibana**, collector **Fluent Bit**, `docker compose --profile logging`.
- [x] Proof test: assert a request emits a JSON log line carrying the request's id. → `test/logging.e2e-spec.ts` (3 tests) + `src/logging/logging.config.spec.ts` (file-sink wiring).
- [x] Flip checklist **#32 "Logging"** notes to cover the app-logger story, not just audit.

**Implemented 2026-06-20.** The app logger is now Pino, and the destination (Layer 2) is a
self-hostable **ELK** stack behind a compose profile.

## The chosen backend — Elasticsearch + Kibana (profile `logging`)

We picked **ES + Kibana** over Loki for full-text search and because it lets the audit trail's
`exportToSearch()` stub share one cluster later (`app-logs` + `audit-*` indices). The pipeline:

```
app (host)  ──writes JSON──►  logs/app.log  ──:ro bind mount──►  Fluent Bit
                                                                     │  tail+parse (pino_json)
                                                                     ▼
                                              Elasticsearch (index: app-logs)  ──►  Kibana :5601
```

- **App side:** set `LOG_FILE=logs/app.log` and Pino writes raw JSON to that file *in addition*
  to the console (`buildPinoHttpOptions`). ISO timestamps so ES maps `@timestamp` cleanly.
- **Collector:** `docker/fluent-bit/*.conf` tails the file and bulk-indexes into ES. Decoupled —
  if ES is down, Fluent Bit retries; the app never blocks (no broker in the request path).
- **Services:** `elasticsearch` (single-node, security off — **local dev only**), `kibana`,
  `fluent-bit`. All gated behind `profiles: [logging, all]`.

### Runbook
```bash
docker compose --profile logging up -d          # ES + Kibana + Fluent Bit
LOG_FILE=logs/app.log pnpm start:dev             # app writes the JSON file Fluent Bit tails
curl -H 'x-request-id: demo-1' localhost:3000/   # generate a log line
# query ES directly:
curl 'localhost:9200/app-logs/_search?q=correlationId:demo-1&pretty'
# or open Kibana → http://localhost:5601 → create data view `app-logs*`
```

### Remaining (optional)
- Wire `AuditLogProcessor.exportToSearch()` to index into the same ES cluster (`audit-*`),
  so the durable audit trail is searchable alongside app logs — "one cluster, two indices."
- For prod: enable ES security/TLS, set heap via `ES_JAVA_OPTS`, and add ILM retention.
