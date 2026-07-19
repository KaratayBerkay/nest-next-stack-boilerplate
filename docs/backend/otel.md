# OpenTelemetry (OTel) — backend tracing

## Current state

- `@opentelemetry/*` packages are installed (`api`, `sdk-node`, `auto-instrumentations-node`,
  `exporter-metrics-otlp-http`, `sdk-metrics`, `resources`, `semantic-conventions`).
- `initOpenTelemetry()` in `src/telemetry/otel-setup.ts` bootstraps the NodeSDK with
  auto-instrumentations for HTTP, GraphQL, Prisma, ioredis, and kafkajs.
- Activated by `OTEL_ENABLED=true` env var (default off — no collector deployed, so an
  unconditional start spams failed OTLP exports every export interval).
- `shutdownOpenTelemetry()` is called on `SIGTERM` in `main.ts`.

## Parity gap

Frontend traces (via `@vercel/otel`) stop at the BFF. The backend has OTel wired but:

1. **No OTLP collector in compose** — traces/metrics are exported to
   `http://localhost:4318` (default) but there's no Tempo/Jaeger/Grafana service
   receiving them. Add an `observability` compose profile with an OTel collector
   + Tempo (or similar).
2. **Trace context propagation** — frontend `traceparent` headers must flow through
   the BFF proxy into backend requests. Verify with one CI assertion that a
   frontend-generated traceparent reaches the backend's Prisma/HTTP spans.
3. **Unified metrics** — metric reader (`PeriodicExportingMetricReader`) is
   configured but only auto-instrumentation metrics are collected; add
   application-level counters (e.g. outbox relay lag, auth attempts, Kafka
   consumer lag).

## Verification

```bash
OTEL_ENABLED=true pnpm start:dev
# verify: OTel diagnostic logs show "OpenTelemetry initialized"
# verify: curl -s http://localhost:9464/metrics  (if prometheus exporter added)
```

End-to-end: boot the full compose stack with an observability profile, hit an
endpoint from the frontend, then confirm the trace appears in Tempo/Jaeger with
both frontend and backend spans in one waterfall.
