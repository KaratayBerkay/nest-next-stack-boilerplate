# Prisma (backend)

**Source:** [`nest-js-boilerplate/src/prisma/`](../../../../nest-js-boilerplate/src/prisma/) ·
**Category:** [Platform / Core](../README.md) · **Interface docs:** none (internal — no REST/GraphQL/WS
surface of its own)

## What this module owns

The single `PrismaClient` instance every other module reads/writes Postgres through.
[`prisma.service.ts`](../../../../nest-js-boilerplate/src/prisma/prisma.service.ts)'s `PrismaService`
extends the generated `PrismaClient` directly (so every model delegate — `prisma.user.findMany()`,
etc. — is available on `this` with no wrapper indirection) and is `@Global()`-provided, so any module
can inject it without importing `PrismaModule`. Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly.

Two things worth knowing that aren't obvious from a generic Prisma setup:

- **Prisma 7 connects through a driver adapter**, not an inline datasource URL — `new PrismaPg({
  connectionString: ..., max: ... })` (`@prisma/adapter-pg`, node-postgres under the hood), with the
  connection string and pool size (`DATABASE_POOL_MAX`, default 20) both resolved from `ConfigService`
  at construction time.
- **Slow-query and error logging are wired at the Prisma level**, not left to a generic query logger —
  `$on('query', ...)` logs any query over 500ms as a structured `db.query_slow` event (own category,
  greppable independent of the app's other log lines), and `$on('error', ...)` logs Prisma-level query
  errors as `db.query_error`.

`onModuleInit`/`onModuleDestroy` call `$connect()`/`$disconnect()` respectively — the latter only
actually runs because `main.ts` calls `app.enableShutdownHooks()`, so a clean container shutdown
(SIGTERM/SIGINT) closes the Postgres connection pool instead of leaking it.

## Interfaces

None. Internal-only.

## Depends on

Nothing backend-internal — connects directly to Postgres via `DATABASE_URL`.

## Used by

Nearly every other backend module — `PrismaService` is the most widely-injected provider in the app.
Not enumerated per-caller here; see each feature module's own README for its specific model usage.

## Known issues

None specific to this module.
