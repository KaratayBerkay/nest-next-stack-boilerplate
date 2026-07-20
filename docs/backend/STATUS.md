# Backend Status — Recipe Module Map

> A quick-reference map of every module under `nest-js-boilerplate/src/`:
> **production-canonical** vs **reference-only (demo)** vs **e2e-only**.
> Last updated: 2026-07-20

## Canonical stack

**Prisma** is the canonical/production ORM. All real product code uses Prisma
(`PrismaService`, `@prisma/client`, `prisma/migrations/`).

| Area | Module | Mounted | Provenance |
|---|---|---|---|
| Auth | `auth/` | ✅ app | Production — Redis sessions, JWT, OAuth, MFA, RBAC |
| Authorization | `authorization/` | ✅ app | Production — RolesGuard, TierGuard, SessionAuthGuard |
| Users | `users/`, `profile/` | ✅ app | Production |
| Billing | `billing/`, `billing/stripe/` | ✅ app | Production — Stripe + wallet tier management |
| Messaging | `messaging/` | ✅ app | Production — DM with Redis friends check |
| Realtime | `realtime/`, `ws/`, `ws-adapter/` | ✅ app | Production — WebSocket with auth + presence |
| Notifications | `notification/`, `push-notification/` | ✅ app | Production |
| Social | `post/`, `comment/`, `reactions/`, `friends/` | ✅ app | Production |
| Outbox | `outbox/` | ✅ app | Production — transactional outbox + audit log |
| Mail | `mail/` | ✅ app | Production — templates via BullMQ |
| MFA | `mfa/` | ✅ app | Production |
| Devices/Sessions | `devices/`, `session/`, `sessions/` | ✅ app | Production |
| API Keys | `api-keys/` | ✅ app | Production |

## Infrastructure (production)

| Module | Mounted | Purpose |
|---|---|---|
| `redis/` | ✅ Global | Redis clients + health indicator |
| `prisma/` | ✅ Global | Prisma service module |
| `caching/` | ✅ app | Cache-aside service (ioredis) |
| `config/` | ✅ Global | Env validation via Joi + `@nestjs/config` |
| `throttle/` | ✅ app | Rate-limit controller + Redis-backed global throttle |
| `csrf/` | ✅ Global | Double-submit cookie CSRF guard |
| `security/` | ✅ app | Middleware chain (helmet CSP in prod) |
| `health/` | ✅ app | Liveness + readiness probes |
| `logging/` | ✅ Global | Pino structured logging |
| `telemetry/` | ✅ app | OpenTelemetry metrics |
| `common/` | ✅ Global | Crypto, dataloader, exceptions, validators |
| `cookies/`, `cookies-ssr/` | ✅ Global | Cookie helpers |
| `cors/` | ✅ app | CORS config |
| `interceptors/`, `pipes/`, `filters/` | ✅ Global | NestJS lifecycle |

## Recipe modules — reference-only

These implement docs.nestjs.com features for reference. **Not imported** by the
running application — each is exercised only by its own isolated e2e spec.

| Module | Docs reference | Status |
|---|---|---|
| `mikro-orm/` | [MikroORM](https://docs.nestjs.com/recipes/mikro-orm) | Reference-only |
| `sequelize/` | [Sequelize](https://docs.nestjs.com/recipes/sequelize) | Reference-only |
| `typeorm/` | [TypeORM](https://docs.nestjs.com/recipes/typeorm) | Reference-only |
| `mongoose/` | [Mongoose](https://docs.nestjs.com/recipes/mongodb) | Reference-only |
| `federation/` | [Apollo Federation](https://docs.nestjs.com/graphql/federation) | Reference-only |
| `microservices/` | [Microservices](https://docs.nestjs.com/microservices/basics) | Reference-only |
| `grpc/` | [gRPC](https://docs.nestjs.com/microservices/grpc) | Reference-only |
| `custom-transport/` | [Custom transport](https://docs.nestjs.com/microservices/custom-transport) | Reference-only |
| `mqtt/`, `rabbitmq/`, `nats/` (broker-transports) | [Broker transports](https://docs.nestjs.com/microservices/basics) | Reference-only |
| `versioning/` | [Versioning](https://docs.nestjs.com/techniques/versioning) | e2e-only, not mounted |
| `mvc/` | [MVC](https://docs.nestjs.com/techniques/mvc) | Reference-only |
| `fastify-perf/` | [Fastify](https://docs.nestjs.com/techniques/performance) | Reference-only |
| `openapi/` | [OpenAPI](https://docs.nestjs.com/openapi/introduction) | Reference-only |
| `graphql-other/`, `extensions/`, `field-middleware/` | GraphQL extras | Reference-only |
| `cqrs/` | [CQRS](https://docs.nestjs.com/recipes/cqrs) | Reference-only |
| `als/` | [ALS](https://docs.nestjs.com/recipes/async-local-storage) | Reference-only |
| `sse/`, `streaming/` | SSE/streaming | Reference-only |
| `passport-auth/` | [Passport](https://docs.nestjs.com/recipes/passport) | Reference-only |

## Demo modules (mountable, gated)

| Module | Gate | Status |
|---|---|---|
| `project-tasks/` | `LOAD_DEMO_MODULES` flag | Demo — FK-depth demo with per-user scope gap |
| `plugins/`, `providers/`, `complexity/` | Dev-only | Feature demos |
| `interfaces/` | `LOAD_DEMO_MODULES` | Module composition demo |
| `openapi/` | `LOAD_DEMO_MODULES` | Swagger/OpenAPI demo |

## Notes

- **Prisma is canonical.** The four alternate ORMs (MikroORM, Sequelize, TypeORM, Mongoose)
  exist only as reference implementations — they are never imported by the production graph.
- **Demo gate:** `LOAD_DEMO_MODULES === 'true' \|\| NODE_ENV === 'development'`
  guards mountable demo modules in `app.module.ts:199-204`.
- **Kafka consumer** (`frontend-event.consumer.ts`) is off by default
  (`FRONTEND_EVENTS_CONSUMER_ENABLED=false`); Kafka itself runs under the `kafka` compose profile.
- **The transactional outbox** (`outbox/`) is the single source of truth for audit logs
  and durable notifications — side-effects should emit through `OutboxService.emit()`.
