# Backend (`nest-js-boilerplate`)

NestJS API, GraphQL-first (Apollo, code-first schema at
[`src/schema.gql`](../../nest-js-boilerplate/src/schema.gql)), with a handful of REST controllers on
real feature modules. No REST API versioning exists — see
[../issues.md#cross-003](../issues.md#cross-003).

## Scope of this documentation

`nest-js-boilerplate/src` has ~150 top-level directories. Roughly **34 are real, always-on product
modules** (wired into `app.module.ts`'s `CORE_MODULES`, directly or transitively); the rest are
NestJS's own bundled official recipe/sample code (`grpc`, `mvc`, `mongoose`, `sequelize`, `typeorm`,
`mikro-orm`, GraphQL-federation samples, etc.) that ship gated behind `DEMO_MODULES`
(`LOAD_DEMO_MODULES=true`, or on by default whenever `NODE_ENV=development`) or aren't wired into
the app at all. Only the real modules get individual docs here — the rest are listed once in
[_reference/excluded-modules.md](./_reference/excluded-modules.md) (Phase 5).

**Read this before trusting a directory name:** `users/` is demo code with an explicit
"leaks passwordHash" warning in its own source — the real user/account module is `profile/`. Four
directories are demo-**modules** that nonetheless contain one real, always-on **file** each (gRPC's
hybrid transport, the global query-complexity plugin, the global rate-limit guard, the global perf
interceptor) — see [_reference/demo-gated-but-live.md](./_reference/demo-gated-but-live.md) (Phase 5)
and [../issues.md#be-001](../issues.md#be-001).

## Module index

Grouped into 5 categories (a documentation convenience — the source tree itself is flat). ✅ = has
docs; the rest land in later phases (see the repo's own phase tracker in
[docs/progress/](../../CHANGELOG.md) — not yet re-established at time of writing).

| Category | Modules | Status |
|---|---|---|
| [Identity & Access](./identity-access/) | auth, authorization, mfa, devices, sessions, api-keys, csrf | auth: 🟡 partial (session/token model only — full login/register/MFA/OAuth flows land in Phase 1) |
| [Social & Content](./social-content/) | profile, friends, post, comment, reactions, team-members, project-tasks | ⬜ Phase 2 |
| [Messaging & Realtime](./messaging-realtime/) | messaging, realtime, notification, push-notification, wire-crypto, upload | messaging ✅, realtime ✅, wire-crypto ✅ — notification/push-notification/upload ⬜ Phase 3 |
| [Billing & Usage](./billing-usage/) | billing (+stripe), usage | ⬜ Phase 4 |
| [Platform / Core](./platform-core/) | activity-log, outbox, mail, vault, prisma, redis, health, logging, config, telemetry, common/* | ⬜ Phase 5 |

## Reference

- [_reference/excluded-modules.md](./_reference/excluded-modules.md) — the ~68 confirmed
  recipe/orphaned directories, one line each (Phase 5)
- [_reference/demo-gated-but-live.md](./_reference/demo-gated-but-live.md) — the 4 file-level
  exceptions above (Phase 5)
- [_reference/generated-client.md](./_reference/generated-client.md) — `@generated/` note (Prisma
  client output, not documented file-by-file) (Phase 5)
