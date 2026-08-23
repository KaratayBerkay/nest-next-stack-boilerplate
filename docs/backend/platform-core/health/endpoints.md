# Health — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/health/`](../../../../nest-js-boilerplate/src/health/)

## REST

Base path: `/health` (see `@Controller('health')` in
[`health.controller.ts`](../../../../nest-js-boilerplate/src/health/health.controller.ts)).
**Auth:** none — see [README.md](./README.md#what-this-module-owns) for why.

### Liveness probe

**Kind:** REST · **`GET /health`**
**Source:** [`health.controller.ts#L25-L31`](../../../../nest-js-boilerplate/src/health/health.controller.ts)
**Checks:** heap memory only (`MemoryHealthIndicator.checkHeap`, 512MB limit) — no external
dependency. "Is the process itself healthy?" A failure here means the process should be restarted, not
that traffic should stop routing to it (there's nothing external to wait on recovering).
**Response:** Terminus's standard `HealthCheckResult` shape (`{status, info, error, details}`), `200`
if healthy, `503` otherwise.
**Used by:** Infra only (container orchestrator liveness probe) — see [README.md](./README.md#used-by).

### Readiness probe

**Kind:** REST · **`GET /health/ready`**
**Source:** [`health.controller.ts#L35-L43`](../../../../nest-js-boilerplate/src/health/health.controller.ts)
**Checks:** Postgres (`PrismaHealthIndicator.pingCheck`), Redis
([`RedisHealthIndicator.pingCheck`](../../../../nest-js-boilerplate/src/redis/redis-health.indicator.ts)),
and the same heap check as liveness. "Can this instance actually serve requests?" — a load balancer or
k8s should stop routing here while an external dependency is unreachable, distinct from restarting the
process outright.
**Response:** same `HealthCheckResult` shape; `200` only if all three checks pass, `503` if any fail.
**Used by:** Infra only — see [README.md](./README.md#used-by).
