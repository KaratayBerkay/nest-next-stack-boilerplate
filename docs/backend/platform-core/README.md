# Platform / Core

Cross-cutting infrastructure every other category depends on, but which owns no product feature of
its own: audit/event delivery, outbound mail, secrets, the ORM/cache/queue clients, health probes,
structured logging, config validation, tracing bootstrap, and a grab-bag of shared crypto/codec/util
helpers (`common/`). ✅ Complete (Phase 5).

| Module | Interfaces | Docs |
|---|---|---|
| [activity-log](./activity-log/) | REST controller | [README](./activity-log/README.md) · [endpoints](./activity-log/endpoints.md) |
| [outbox](./outbox/) | none (BullMQ worker + Kafka consumer, internal) | [README](./outbox/README.md) |
| [mail](./mail/) | none (BullMQ worker, internal) | [README](./mail/README.md) |
| [vault](./vault/) | none (internal, plus a pre-bootstrap loader) | [README](./vault/README.md) |
| [prisma](./prisma/) | none (internal, global service) | [README](./prisma/README.md) |
| [redis](./redis/) | none (internal, global clients) | [README](./redis/README.md) |
| [health](./health/) | REST controller | [README](./health/README.md) · [endpoints](./health/endpoints.md) |
| [logging](./logging/) | none (internal, Pino wiring) | [README](./logging/README.md) |
| [config](./config/) | none (internal, env validation) | [README](./config/README.md) |
| [telemetry](./telemetry/) | none (internal, OTel bootstrap) | [README](./telemetry/README.md) |
| [common](./common/) | none (internal, 7 shared-utility subdirs) | [README](./common/README.md) |

## How the pieces fit together

Every write that other categories care about auditing flows through **outbox**: a domain change and
its `OutboxEvent` row commit in the same Postgres transaction (see
[../../architecture.md § Transactional outbox](../../architecture.md#transactional-outbox--reliable-event-emission)),
a BullMQ-driven relay claims it, and `outbox`'s own `AuditLogProcessor` writes the durable `AuditLog`
row and indexes it into Elasticsearch. **mail** follows the same "never on the request path" shape
one layer down — `MailService.enqueue()` persists an `EmailMessage` and queues a send job; a separate
BullMQ worker (`MailProcessor`) drains it against a rotating pool of MXRoute mailboxes. **prisma** and
**redis** are the two `@Global()` data-layer providers nearly every other module in the app injects
directly; **redis** additionally re-exports `CacheAsideService`, a generic read-through cache helper
that — despite the name — physically lives in the *excluded*, unwired `caching/` directory (see
[_reference/excluded-modules.md#caching](../_reference/excluded-modules.md#caching)). **vault** loads
secrets into `process.env` once, before Nest even boots (`main.ts` calls it ahead of
`NestFactory.create()`) — a separate, DI-injectable `VaultService` also exists for on-demand reads but
currently has no caller anywhere in the app. **health**, **logging**, **config**, and **telemetry**
are the operational-readiness layer: liveness/readiness probes, structured Pino logging with
request-id correlation, Joi-validated startup config, and an opt-in OpenTelemetry bootstrap.

**common/** is different in kind from the other ten — not one feature but seven independent,
narrowly-scoped helper subdirectories (`cookies`, `crypto`, `dataloader`, `exceptions`, `id-codec`,
`token-codec`, `utils`) that other modules import piecemeal. Two of them — `id-codec` and
`token-codec` — implement the transport-boundary uuid/token encryption that
[identity-access/auth](../identity-access/auth/README.md),
[identity-access/sessions](../identity-access/sessions/README.md), and
[messaging-realtime/realtime](../messaging-realtime/realtime/README.md) already reference in passing
(as a forward-pointer to "Phase 5") — see [common/README.md](./common/README.md) for the real docs
those pointers resolve to.

## Known issues

- [BE-023](../../issues.md#be-023) (LOW) — `VaultService` (`vault/vault.service.ts`, `@Global()`
  provided) is never injected anywhere in the app; the only vault-secret path actually exercised is
  the unrelated standalone `loadVaultSecrets()` function called directly from `main.ts`.
- `CROSS-036` (resolved) (INFO) — `backend/README.md`'s "demo-gated-but-live" callout
  previously said four directories; a fifth (`exception-filters/`, the global `APP_FILTER`) was found
  verifying this phase — corrected here and in [_reference/demo-gated-but-live.md](../_reference/demo-gated-but-live.md).
- Full list: [issues.md](../../issues.md).
