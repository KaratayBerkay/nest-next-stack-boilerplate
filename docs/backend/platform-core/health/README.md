# Health (backend)

**Source:** [`nest-js-boilerplate/src/health/`](../../../../nest-js-boilerplate/src/health/) ·
**Category:** [Platform / Core](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

Standard container/orchestrator health probes, built on `@nestjs/terminus`. Two routes, deliberately
different in what they check — see [endpoints.md](./endpoints.md) for the split rationale (liveness
vs. readiness). Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly. See
[`health.module.ts`](../../../../nest-js-boilerplate/src/health/health.module.ts).

Neither route requires auth — a load balancer or Kubernetes kubelet polling these has no session to
present, so gating them the normal way would make health checks always fail. Both routes are also
excluded from the app's own request logging
([`logging.module.ts`](../../../../nest-js-boilerplate/src/logging/logging.module.ts)'s `exclude`
list) since they fire constantly and would otherwise drown real traffic in the log stream.

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| REST controller | [`health.controller.ts`](../../../../nest-js-boilerplate/src/health/health.controller.ts) | [endpoints.md](./endpoints.md) |

## Depends on

[`prisma`](../prisma/README.md) (`PrismaHealthIndicator` from `@nestjs/terminus`, pinging `PrismaService`),
[`redis`](../redis/README.md) (`RedisHealthIndicator`, this module's own file, pinging `REDIS_CLIENT`).

## Used by

External infrastructure only (Docker Compose healthchecks, a reverse proxy, or a Kubernetes
liveness/readiness probe config) — not called by the frontend or mobile app themselves.

## Known issues

None specific to this module.
