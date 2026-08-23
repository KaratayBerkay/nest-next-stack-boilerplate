# Telemetry (backend)

**Source:** [`nest-js-boilerplate/src/telemetry/`](../../../../nest-js-boilerplate/src/telemetry/) ·
**Category:** [Platform / Core](../README.md) · **Interface docs:** none (internal — no REST/GraphQL/WS
surface of its own)

## What this module owns

A single file, [`otel-setup.ts`](../../../../nest-js-boilerplate/src/telemetry/otel-setup.ts), wrapping
the OpenTelemetry Node SDK (`@opentelemetry/sdk-node` + `auto-instrumentations-node`) with auto-
instrumentation for HTTP, GraphQL, Prisma, ioredis, and kafkajs. Like [`vault`](../vault/README.md)'s
loader, this is **not a NestJS module at all** — `initOpenTelemetry()`/`shutdownOpenTelemetry()` are
plain functions called directly from `main.ts`, outside any DI container.

`initOpenTelemetry()` must run — and does — **before** `NestFactory.create()`, so every instrumented
library patches itself before any app module has a chance to construct an instance of it (Prisma's
client, ioredis connections, etc. all need to be instrumented at construction time to be traced at
all). `shutdownOpenTelemetry()` is registered on `SIGTERM` to flush any pending spans/metrics before
the process exits.

**Gated behind `OTEL_ENABLED`, off by default.** Unlike every other module in this category, this one
does nothing at all unless an operator opts in — `main.ts` only calls `initOpenTelemetry()` when
`process.env.OTEL_ENABLED === 'true'`. The comment at that call site is explicit about why: "with no
collector deployed, an unconditional start just spams failed OTLP exports every export interval."
Traces/metrics export via OTLP/HTTP to `http://localhost:4318` by default (`OTEL_EXPORTER_OTLP_ENDPOINT`
to override); filesystem instrumentation is explicitly disabled (too noisy for a NestJS app), as is the
winston/pino instrumentation (would double-log against this app's own [logging](../logging/README.md)
pipeline). A failed `sdk.start()` is caught and logged as a warning — the app continues without tracing
rather than failing to boot.

## Interfaces

None. Internal-only, and inert unless `OTEL_ENABLED=true`.

## Depends on

Nothing backend-internal — instruments other libraries by monkey-patching them at import time, not via
Nest DI.

## Used by

`main.ts` only (`initOpenTelemetry()` before `NestFactory.create()`, `shutdownOpenTelemetry()` on
`SIGTERM`). No other backend module references this directory.

## Known issues

None specific to this module.
