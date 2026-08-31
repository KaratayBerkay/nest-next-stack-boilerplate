# Logging (backend)

**Source:** [`nest-js-boilerplate/src/logging/`](../../../../nest-js-boilerplate/src/logging/) ·
**Category:** [Platform / Core](../README.md) · **Interface docs:** none (internal — no REST/GraphQL/WS
surface of its own)

## What this module owns

Replaces Nest's built-in console `Logger` with **Pino** (`nestjs-pino`) app-wide: structured JSON,
off the hot path, automatic per-request access logs, secret redaction, and request-id correlation.
Existing `new Logger(Foo.name)) call sites elsewhere in the app keep working unchanged — `main.ts`
bridges them onto Pino via `app.useLogger(app.get(Logger))` right after the Nest app is created. Wired
into [`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly.
See [`logging.module.ts`](../../../../nest-js-boilerplate/src/logging/logging.module.ts).

## `buildPinoHttpOptions()` — what every request log line gets

[`logging.config.ts`](../../../../nest-js-boilerplate/src/logging/logging.config.ts) is exported as a
pure function (not inlined into the module) specifically so a proof test can exercise the exact
`genReqId`/`customProps`/`redact` behavior the real app runs, without booting Nest.

- **Console output**: pretty-printed single-line text in dev (`pino-pretty`), raw JSON to stdout in
  production.
- **Optional file sink**: when `LOG_FILE` is set, the same JSON lines are also appended to that path —
  this is the file Fluent Bit tails and ships to Elasticsearch (the `logging` Docker Compose profile).
  Unset in plain local dev → console only.
- **Request id**: `genReqId` calls [`request-context.ts`](../../../../nest-js-boilerplate/src/logging/request-context.ts)'s
  `getRequestId()` rather than letting `pino-http` mint its own — see below for why that matters.
- **GraphQL operation name**: `customProps` regex-extracts the operation name from `/graphql` request
  bodies (`extractGraphqlOperation`) so different mutations (login vs. refresh vs. `me`) are
  distinguishable in the log backend — deliberately reads only the operation name, never variables or
  credentials.
- **Redaction**: `req.headers.authorization`, `req.headers.cookie`, and `res.headers["set-cookie"]` are
  stripped (`remove: true`, not just masked) so bearer tokens/session cookies can never reach the log
  backend even by accident.
- **Health-check exclusion**: `GET /health` and `GET /health/ready` are excluded from the automatic
  per-request log — see [health](../health/README.md), they fire constantly and would otherwise drown
  real traffic.

## `request-context.ts` — one correlation id, three places

[`request-context.ts`](../../../../nest-js-boilerplate/src/logging/request-context.ts)'s
`requestContextMiddleware` is the very first middleware `main.ts` registers (before Helmet, before
cookie-parser) — it mints (or honors an inbound `x-request-id`/`x-correlation-id` header from an
upstream gateway) one id per request and stashes it in `AsyncLocalStorage`, echoing it back as an
`x-request-id` response header. Everything downstream in the same async context reads the *same* id
via `getRequestId()`: this module's own `genReqId` (so the Pino log line's `req.id` matches), and
[`outbox`](../outbox/README.md)'s `OutboxService.emit()` (so `AuditLog.requestId`/`correlationId`
match too). The result: one id lets you join a Pino log line, its HTTP response header, and the
resulting audit-log row for the same request, across three otherwise-unrelated systems.
`getRequestId()` is safe to call from anywhere (boot code, a cron tick, a BullMQ worker) — it just
returns `undefined` outside an HTTP request's async context rather than throwing.

## Interfaces

None. Internal-only.

## Depends on

Nothing backend-internal.

## Used by

Every module in the app, transitively — any `new Logger(...)` call is bridged onto this module's Pino
instance once `main.ts` installs it. Not enumerated per-caller.

## Known issues

- `CROSS-037` (resolved) (INFO) — both `logging.module.ts` and `request-context.ts` carry
  doc comments pointing at `docs/backend/research/logger.md` ("See `docs/backend/research/logger.md`
  for why the built-in logger was rejected…" / "…the correlation gap called out in
  `docs/backend/research/logger.md`"). That file doesn't exist in the current repo — it was one of the
  pre-rewrite docs removed in this effort's Phase 0 commit (confirmed: `git log --all -- docs/backend/research/logger.md`
  shows no history beyond the initial commit and the Phase 0 rewrite commit that deleted the whole old
  `docs/` tree). Unlike `CROSS-004` (resolved)/`CROSS-005` (resolved)
  (a surviving doc actively misleading a reader about current behavior), this is just a dangling
  pointer inside a code comment — low-stakes, but worth a maintainer knowing the referenced rationale
  doc no longer exists rather than chasing a 404.
