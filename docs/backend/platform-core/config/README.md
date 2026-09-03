# Config (backend)

**Source:** [`nest-js-boilerplate/src/config/`](../../../../nest-js-boilerplate/src/config/) ·
**Category:** [Platform / Core](../README.md) · **Interface docs:** none (internal — no REST/GraphQL/WS
surface of its own)

## What this module owns — one real file, two demo-only ones

This directory has no `config.module.ts` at all — its files split cleanly into one that's genuinely
live and two that are self-contained recipe code, proven only by their own isolated test:

| File | Live in the real app? | Role |
|---|---|---|
| [`env.validation.ts`](../../../../nest-js-boilerplate/src/config/env.validation.ts) | **Yes** | `validationSchema`/`validationOptions`, imported directly into `AppModule`'s real `ConfigModule.forRoot({isGlobal: true, validationSchema, validationOptions})` — see [`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts). Every var it declares `.required()` aborts boot with a clear Joi error if missing; `allowUnknown: true` tolerates the many env vars this app uses that aren't listed here. |
| [`database.config.ts`](../../../../nest-js-boilerplate/src/config/database.config.ts) | No | A `registerAs('database', ...)` namespaced-config demo (the docs.nestjs.com pattern for typed config slices). |
| [`config-demo.service.ts`](../../../../nest-js-boilerplate/src/config/config-demo.service.ts) | No | Demonstrates both documented ways to read namespaced config: typed injection via `@Inject(databaseConfig.KEY)` + `ConfigType<...>`, and the stringly-typed `ConfigService.get('database.host')` escape hatch. |

The real `ConfigModule.forRoot()` call in `AppModule` has **no `load` array** — so `databaseConfig`'s
namespace is never actually registered, and `@Inject(databaseConfig.KEY)` would fail to resolve if
`ConfigDemoService` were ever instantiated through the app's real DI graph. It never is: there's no
module wrapping it, and `grep -rln "ConfigDemoService\|databaseConfig"` outside this directory returns
nothing. [`config.spec.ts`](../../../../nest-js-boilerplate/src/config/config.spec.ts) proves both
demo pieces work by building its **own**, fully isolated `Test.createTestingModule` (with its own
`ConfigModule.forRoot({load: [databaseConfig], ...})`) — the same shape this repo's
`implement-nestjs-feature` skill produces elsewhere (see `CROSS-002` (resolved — fixed 2026-09-03: already structural-only — `ProjectTasksModule`/`TeamMembersModule` live in `DEMO_MODULES`, not in the always-on core) for
a prior instance of this exact pattern, in `project-tasks`/`team-members`). `env.validation.ts`'s Joi
schema itself is exercised the same way, plus for real every time the app boots.

## What `env.validation.ts` actually enforces

Beyond the unconditionally-required basics (`NODE_ENV`, `PORT`, `DATABASE_URL`, `REDIS_HOST`,
`REDIS_PORT`, `JWT_SECRET`, `CSRF_SECRET`), a few rules are conditional or worth flagging explicitly:

- `COOKIE_SECRET` and `ENCRYPTION_KEY` are required **only** in production (`Joi.when('NODE_ENV', {is:
  'production', then: Joi.required()})`) — both are optional in dev/test, so a missing
  `ENCRYPTION_KEY` locally degrades silently rather than failing fast (the comment on this schema calls
  this out explicitly: "missing values silently degrade without validation").
- `MXROUTE_*` vars accept an empty string (`.allow('')`) as equivalent to unset — matching
  [`mail`](../mail/README.md)'s `MxrouteAccountsService.configured` check, and needed so e2e test setup
  can force the "not configured" state even when a real `.env` has them populated.
- `MAX_DEVICES_PER_USER`/`MAX_SAME_IP_SESSIONS` default here (10 / 5) but are consumed by
  [identity-access/devices](../../identity-access/devices/README.md) and
  [identity-access/sessions](../../identity-access/sessions/README.md), not this module.
- `MESSAGE_STORAGE_MASTER_KEY` (added post-docs, 2026-08-28): optional, `min(16)` when present —
  the at-rest master key for stored message bodies
  ([wire-crypto](../../messaging-realtime/wire-crypto/README.md)'s `StorageCryptoService`); absent,
  the service derives a dev-fallback key from `ENCRYPTION_KEY` and warns at boot. 64-hex is used as
  raw key bytes; any other string is sha256'd first. On the deploy box it's supplied via the
  `vault-init` `.env.local` override — see
  [vault/README.md § Deploy-side note](../vault/README.md#deploy-side-note-vault-init-and-envlocal-overrides).

## Interfaces

None. Internal-only.

## Depends on

Nothing backend-internal.

## Used by

`AppModule`'s `ConfigModule.forRoot()` call (`env.validation.ts` only) — every other module that
injects `ConfigService` afterward is a consumer of the *validated* environment, not of this directory
directly.

## Known issues

None specific to this module — see the demo/real split above, which is the main thing worth knowing
before assuming any file here is live.
