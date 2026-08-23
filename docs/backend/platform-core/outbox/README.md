# Outbox (backend)

**Source:** [`nest-js-boilerplate/src/outbox/`](../../../../nest-js-boilerplate/src/outbox/) ·
**Category:** [Platform / Core](../README.md) · **Interface docs:** none (internal — no REST/GraphQL/WS
surface of its own)

## What this module owns

The transactional-outbox pattern this whole app's audit trail depends on — see
[../../architecture.md § Transactional outbox](../../../architecture.md#transactional-outbox--reliable-event-emission)
for the cross-cutting design rationale. `OutboxService.emit(event, tx)` writes an `OutboxEvent` row
**inside the caller's own Prisma transaction**, so the event can never exist without the domain write
it describes (or vice versa). A self-scheduled poller (`onModuleInit`'s `setInterval`, default every
`OUTBOX_POLL_MS=2000`) calls `relayPendingEvents()`, which:

1. Reclaims any row stuck in `PUBLISHING` for over 5 minutes (a process killed mid-relay).
2. Claims up to 100 `PENDING` rows via `SELECT ... FOR UPDATE SKIP LOCKED` (safe under multiple app
   instances — no two claim the same row).
3. Pushes each onto a BullMQ queue (`outbox`, Redis-backed) and marks it `PUBLISHED`; a broker failure
   releases the row back to `PENDING` with an incremented `attempts` counter, up to
   `OUTBOX_MAX_ATTEMPTS` (default 5) before it's marked `DEAD_LETTER` permanently.

`@Global()` and exports only `OutboxService` — any feature module can call `emit()` without importing
`OutboxModule` itself. Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly.

## `AuditLogProcessor` — the only place `AuditLog` rows are written

[`audit-log.processor.ts`](../../../../nest-js-boilerplate/src/outbox/audit-log.processor.ts)'s
`@Processor('outbox')` worker consumes the relayed BullMQ jobs, writes the durable `AuditLog` Postgres
row, and — same job, same handler — indexes an equivalent document into Elasticsearch's `audit-logs`
index (live-confirmed: 252 docs in this environment). A `P2003` foreign-key violation on `actorId` (the
acting user was deleted after the event was queued but before it was processed) is caught and retried
once with `actorId: null` rather than failing the job outright. ES indexing itself is fire-and-forget —
a failure is logged, never thrown, so a down Elasticsearch cluster can never block the audit-log
worker or cause an event to be lost/retried unnecessarily.

Note: `authorization/admin.resolver.ts` has its own private, unused `createAuditLog()` method that
duplicates this processor's logic byte-for-byte — dead code, not a second real writer. See
[BE-006](../../../issues.md#be-006) (documented in Phase 1,
[identity-access/authorization](../../identity-access/authorization/README.md)).

## `FrontendEventConsumer` — web's half of the split telemetry pipeline

[`frontend-event.consumer.ts`](../../../../nest-js-boilerplate/src/outbox/frontend-event.consumer.ts)
is a **Kafka** consumer (`kafkajs`, not BullMQ) — architecturally separate from the outbox/BullMQ flow
above, just co-located in this directory because it shares `ElasticsearchService`. It subscribes to
topic `frontend-events` and bulk-indexes each batch into an ES index of the same name. The producer
side is web-only: `next-js-boilerplate/src/app/api/events/route.ts` (`POST /api/events`) publishes to
this exact topic via `publishEvent()` (`next-js-boilerplate/src/lib/kafka.ts`), fed by a real, batched
client-side logger (`lib/event-logger.ts`, wired into `hooks/useEventLogger.ts`,
`usePerformanceLogger.ts`, `useNetworkLogger.ts`, and the root `error.tsx` boundary — genuinely used
app-wide, not dead code). See [activity-log/README.md](../activity-log/README.md#what-this-module-owns)
for the mobile-side equivalent, which is a completely different, unrelated pipeline (direct REST → Pino
logs, no Kafka involvement at all).

**Kafka itself is optional infrastructure in this repo** — the root `docker-compose.yml` gates the
`kafka` service behind `profiles: ["kafka", "all"]`, off by default (confirmed: not running in this
environment's `docker ps`, and no `frontend-events` index exists yet in the live Elasticsearch
cluster). `onModuleInit()` retries the initial connection up to 10 times with exponential backoff, then
logs an error and gives up gracefully — the app never crashes or blocks startup if Kafka is
unreachable, it just silently never indexes frontend events until Kafka becomes available. This is
consistent with the rest of this module's fire-and-forget-to-search posture, not a bug.

## Interfaces

None. Internal-only — a BullMQ worker (`AuditLogProcessor`) and a Kafka consumer
(`FrontendEventConsumer`), neither reachable via REST/GraphQL/WS.

## Depends on

`PrismaModule` (writes `OutboxEvent`/`AuditLog`), `ElasticsearchModule` (own submodule, `@Global()`,
wraps the `@elastic/elasticsearch` client), [logging](../logging/README.md) (`getRequestId()` — every
emitted event is stamped with the current request's correlation id so `AuditLog` rows join cleanly to
the Pino log lines for the same request).

## Used by (who calls `OutboxService.emit()`, and why)

Every module that needs a durable, transactionally-consistent audit trail entry — grep confirms real
callers across `authorization/admin.resolver.ts` (tier/status/MFA admin actions),
`auth/` (login/register/password-change flows), `billing/` (subscription lifecycle events), and others.
Not enumerated exhaustively here — this is infrastructure every feature category may call, not a
fixed consumer list; see each feature module's own README for its specific emitted event types.

## Known issues

None specific to this module.
