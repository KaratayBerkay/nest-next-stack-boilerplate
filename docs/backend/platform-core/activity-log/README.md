# Activity log (backend)

**Source:** [`nest-js-boilerplate/src/activity-log/`](../../../../nest-js-boilerplate/src/activity-log/) ·
**Category:** [Platform / Core](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

A single fire-and-forget ingestion endpoint for **client-side** telemetry — page views, exceptions,
network errors, performance marks — sent by the frontend and mobile apps about their own runtime,
distinct from anything the backend logs about itself. `ActivityLogService.logEvents()` doesn't persist
to Postgres at all: each event is written straight into the app's structured Pino log stream (see
[logging](../logging/README.md)) under `origin: 'mobile'`, tagged with the caller's session/user id
when resolvable. Wired into [`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s
`CORE_MODULES` directly (not demo-gated). See
[`activity-log.module.ts`](../../../../nest-js-boilerplate/src/activity-log/activity-log.module.ts).

This is **one of two independent client-telemetry pipelines** in this codebase, and they don't share
infrastructure:

| | Caller | Transport | Lands in |
|---|---|---|---|
| **This module** | Mobile ([`flutter-boilerplate/lib/lib/activity_logger.dart`](../../../../flutter-boilerplate/lib/lib/activity_logger.dart)) | Direct REST, `POST /activity-logs` | Pino → `backend-logs` Elasticsearch index (live-confirmed: 52k+ docs) |
| [outbox](../outbox/README.md)'s `FrontendEventConsumer` | Web ([`next-js-boilerplate/src/lib/event-logger.ts`](../../../../next-js-boilerplate/src/lib/event-logger.ts), batched via `hooks/useEventLogger.ts` and friends) | BFF route `POST /api/events` → Kafka topic `frontend-events` | `outbox`'s consumer bulk-indexes straight into a `frontend-events` Elasticsearch index (bypasses Pino entirely) |

Neither app calls the other's endpoint — web never hits `POST /activity-logs`, mobile never publishes
to Kafka. Nothing in this repo currently queries both pipelines together; see
[outbox/README.md](../outbox/README.md#frontendeventconsumer--webs-half-of-the-split-telemetry-pipeline)
for the Kafka half.

## Auth is optional, not required

The controller is guarded by [`OptionalAuthGuard`](../../../../nest-js-boilerplate/src/activity-log/optional-auth.guard.ts),
not the usual `SessionAuthGuard` (see [identity-access/auth](../../identity-access/auth/README.md)) —
deliberately, since a client can legitimately want to log an event (e.g. a login-page exception)
*before* it has a session. The guard independently re-implements a full access-token verify +
rbac/user-token compound-key Redis lookup (mirroring `SessionAuthGuard`'s real logic, not delegating to
it) but **always returns `true`** — a failed or absent credential just leaves `req.user` unset (or
falls back to a JWT-only partial user) rather than rejecting the request. It reuses
[`common/id-codec`](../common/id-codec/README.md)'s `decryptId` and
[`common/token-codec`](../common/token-codec/README.md)'s `decryptTokenOrNull` to unwrap the same
encrypted rbac/user cookies every other guard in the app reads.

## A Fluentd trap worth knowing about

`ActivityLogService.logEvents()`'s own source comment flags a real, previously-hit bug class: the log
object must never use the key `source` — Docker's `fluentd` log driver already injects a top-level
`source` field (`stdout`/`stderr`) into every container log record, and that silently wins over an
application-level `source` field before Fluent Bit's routing rule ever sees it (confirmed live: every
activity-log event was mis-routed into `backend-logs` with `source:"stdout"` until this was renamed to
`origin`). Worth remembering before adding any new top-level field to a log call anywhere in this app,
not just here.

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| REST controller | [`activity-log.controller.ts`](../../../../nest-js-boilerplate/src/activity-log/activity-log.controller.ts) | [endpoints.md](./endpoints.md) |

## Depends on

`AuthContractsModule` (`auth/auth-contracts.module.ts`) — a lighter slice of
[identity-access/auth](../../identity-access/auth/README.md) exposing just `JwtService` and the
token-store/derivation services `OptionalAuthGuard` needs, without pulling in `AuthModule`'s full
controller/resolver surface.

## Used by

Cross-cutting client instrumentation, not tied to one page or screen — both apps call this from a
shared, app-wide logging hook/lib rather than from any single feature. Frontend does **not** call this
endpoint at all (see the table above); mobile's caller is
[`activity_logger.dart`](../../../../flutter-boilerplate/lib/lib/activity_logger.dart), invoked from
across the app's screens, not one screen in particular.

## Known issues

None specific to this module. See [outbox/README.md](../outbox/README.md#known-issues) for the
web-side half of the split-telemetry-pipeline picture.
