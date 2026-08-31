# Backend (`nest-js-boilerplate`)

NestJS API, GraphQL-first (Apollo, code-first schema at
[`src/schema.gql`](../../nest-js-boilerplate/src/schema.gql)), with a handful of REST controllers on
real feature modules. No REST API versioning exists — see
[../issues.md#cross-003](../issues.md#cross-003).

## Scope of this documentation

`nest-js-boilerplate/src` has 105 top-level directories (verified count 2026-08-29; was 104 before
the RTC phases added `rtc/`). **34 are real, always-on product modules** (33 at the original count,
+`rtc`) (wired into `app.module.ts`'s `CORE_MODULES`, directly or transitively); the rest are
NestJS's own bundled official recipe/sample code (`grpc`, `mvc`, `mongoose`, `sequelize`, `typeorm`,
`mikro-orm`, GraphQL-federation samples, etc.) that ship gated behind `DEMO_MODULES`
(`LOAD_DEMO_MODULES=true`, or on by default whenever `NODE_ENV=development`) or aren't wired into
the app at all. Only the real modules get individual docs here — the rest are listed once in
[_reference/excluded-modules.md](./_reference/excluded-modules.md).

**Read this before trusting a directory name:** `users/` is demo code with an explicit
"leaks passwordHash" warning in its own source — the real user/account module is `profile/`. The same
confusable-name trap recurs three more times in this codebase: `session/` (unwired) vs. `sessions/`
(real), `tasks/` (demo) vs. `project-tasks/` (real), and `cookies/` (demo) vs. `common/cookies/` (real)
— see [_reference/excluded-modules.md § Naming collisions](./_reference/excluded-modules.md#naming-collisions--verify-by-content-not-by-name).
Separately, five directories are demo-**modules** that nonetheless contain one real, always-on
**file** each (gRPC's hybrid transport, the global query-complexity plugin, the global rate-limit
guard, the global perf interceptor, and the global exception filter) — see
[_reference/demo-gated-but-live.md](./_reference/demo-gated-but-live.md) and
`BE-001` (resolved).

## Module index

Grouped into 5 categories (a documentation convenience — the source tree itself is flat). All five now
have docs (see the repo's own phase tracker in [docs/progress/](../../CHANGELOG.md) — not yet
re-established at time of writing).

| Category | Modules | Status |
|---|---|---|
| [Identity & Access](./identity-access/) | auth, authorization, mfa, devices, sessions, api-keys, csrf | ✅ Phase 1 |
| [Social & Content](./social-content/) | profile, friends, post, comment, reactions, team-members, project-tasks | ✅ Phase 2 |
| [Messaging & Realtime](./messaging-realtime/) | messaging, realtime, notification, push-notification, wire-crypto, upload, **rtc** (post-docs addition) | ✅ Phase 3 (+rtc) |
| [Billing & Usage](./billing-usage/) | billing (+stripe), usage | ✅ Phase 4 |
| [Platform / Core](./platform-core/) | activity-log, outbox, mail, vault, prisma, redis, health, logging, config, telemetry, common/* | ✅ Phase 5 |

## Reference

- [_reference/excluded-modules.md](./_reference/excluded-modules.md) — the 70 confirmed
  recipe/orphaned directories, one line each
- [_reference/demo-gated-but-live.md](./_reference/demo-gated-but-live.md) — the 5 file-level
  exceptions above
- [_reference/generated-client.md](./_reference/generated-client.md) — `@generated/` note (Prisma
  client output, not documented file-by-file)
