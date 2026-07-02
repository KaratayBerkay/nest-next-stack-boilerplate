# Phase 1 — Foundations (P0 quick wins)

> Execution tracker for the first phase of the [stack roadmap](../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-02 · Completed 2026-07-02 · Status: **done** (verified against the running stack)

Scope: the P0 items from [todo/01-stack-integration.md](../todo/01-stack-integration.md)
and the P0 slice of [todo/05-docs-maintenance.md](../todo/05-docs-maintenance.md) —
no test infra, no CI, no backend code changes (those are Phases 2–4).

## Tasks

- [x] **1. Root `README.md`**
  - [x] Stack overview: what the monorepo is (NestJS backend + Next.js frontend + full infra), link to `docs/`
  - [x] Quickstart: `docker compose --profile all up -d --build`, first-run notes (`nest-js-boilerplate/logs/` must be writable by uid 1000)
  - [x] Service/port table: backend `3000` + gRPC `5050` · frontend `3200` · Postgres `5432` · Redis `6379` · **Kafka host `localhost:29092` / in-network `kafka:9092`** · RabbitMQ `5672`/mgmt `15672` · NATS `4222` · MQTT `1883` · Mongo `27017` · Elasticsearch `9200` · Kibana `5601` · MinIO `9000`/console `9001` · fluent-bit forward `24224` · messaging WS `3003` (after task 3)
  - [x] Compose profile matrix: core (default) / `brokers` / `kafka` / `mongo` / `all`
- [x] **2. Root `.env.example`**
  - [x] Every `${VAR:-default}` `docker-compose.yml` reads: `JWT_SECRET`, `ENCRYPTION_KEY` (64 hex chars), `POSTGRES_USER/PASSWORD/DB/PORT`, `MINIO_ROOT_USER/PASSWORD`, `MINIO_BUCKET`, `KAFKA_PORT`, `RABBITMQ_*`, `MONGO_*`, `LOG_LEVEL`, `LOG_FILE`, port overrides (`APP_PORT`, `GRPC_PORT`, `FRONTEND_PORT`, `ELASTICSEARCH_PORT`, `KIBANA_PORT`, `FLUENT_FORWARD_PORT`, `MINIO_PORT`, `MINIO_CONSOLE_PORT`, `NATS_*`, `MQTT_PORT`, `REDIS_PORT`)
  - [x] Flag which defaults are dev-only (secrets, `nest`/`nest`, `minioadmin`)
  - [x] Link `prod/backend/.env.production.example` for the full backend var reference
- [x] **3. `messaging-ws` compose service** (`messaging-server.mjs`, port `3003`)
  - [x] `prod/docker/backend/Dockerfile.prod` runtime stage: `COPY --from=builder --chown=node:node /app/messaging-server.mjs ./`
  - [x] Fix found during verify (2026-07-02): `jsonwebtoken` and `pg-pool` were only **transitive** deps — pnpm's strict layout hides them from `/app/messaging-server.mjs`, crash-looping the container with `ERR_MODULE_NOT_FOUND`. Added both as direct deps in `nest-js-boilerplate/package.json`.
  - [x] `docker-compose.yml`: `messaging-ws` service reusing the `app` build, `command: ["node", "messaging-server.mjs"]`, env `MSG_PORT=3003`, `JWT_SECRET`, `DATABASE_URL`, port `3003:3003`, `depends_on` postgres healthy
  - [x] Confirm `nextjs`'s `NEXT_PUBLIC_MSG_WS_URL=ws://localhost:3003` reaches it from the browser
- [x] **4. Delete `ws-server.mjs`** (superseded by the NestJS WS gateway — decided 2026-07-02)
  - [x] First verify what `NEXT_PUBLIC_WS_URL` (currently `ws://localhost:3200`) actually targets — must keep pointing at the NestJS gateway path, not :3002
  - [x] Remove `nest-js-boilerplate/ws-server.mjs` + any `WS_PORT` / `:3002` references (scripts, docs, demos)
- [x] **5. Docs link repair** (P0 slice of [todo/05](../todo/05-docs-maintenance.md))
  - [x] Sweep `docs/` for pre-monorepo paths: `../../nest-js` → `../../nest-js-boilerplate`, `../../next-js` → `../../next-js-boilerplate`
  - [x] Trim `docs/backend/README.md` to files that exist (drop or restore: `STATUS.md`, `TODO.md`, `progress/README.md`, `research/claude-code-ecosystem-2026.md`, `research/nestjs-stack-2026-gotchas.md`)
  - [x] Fix `docs/frontend/STATUS.md` contradiction ("✅ Completed & verified (0) — Nothing yet" vs dashboard 58/~60)
  - [x] Remove stale "the whole `docs/` folder is gitignored" note in `docs/frontend/README.md`

## Definition of done / verify

- [x] `docker compose --profile all up -d --build` from a clean checkout (fresh volumes) → every service healthy, `migrate` + `minio-setup` exited 0, **including the new `messaging-ws`**
- [x] A WS client (e2e later; `wscat`/node one-liner now) connects to `ws://localhost:3003` — handshake OK; HTTP API answers 401 (auth required, server alive)
- [x] `git grep -n 'ws-server\|:3002\|WS_PORT'` → no live references (only unrelated `MSG_WS_PORT` and roadmap prose in `docs/todo/`)
- [x] All links in touched docs resolve (`docs/backend/README.md`, `docs/frontend/README.md`, `STATUS.md`, root `README.md`)
- [x] `.env.example` names match `docker-compose.yml` exactly (`grep -oE '\$\{[A-Z_]+' docker-compose.yml | sort -u` cross-check → identical sets)

## Phase queue (created when reached)

| Phase | Scope | Detail |
| --- | --- | --- |
| **1 (this)** | Foundations: README, .env.example, messaging-ws, delete ws-server, doc links | [todo/01](../todo/01-stack-integration.md), [todo/05](../todo/05-docs-maintenance.md) |
| 2 | Cross-stack e2e: `STACK=1` Playwright project against the compose stack (auth round-trip, refresh, SSR/CSR cookies, WS, messaging) | [todo/01](../todo/01-stack-integration.md) |
| 3 | Root CI: path-filtered app checks + compose smoke job + stack e2e | [todo/01](../todo/01-stack-integration.md) |
| 4 | Backend warts: negative-timer warning, duplicate `CreateCatDto`, Kafka first-boot race | [todo/02](../todo/02-backend.md) |
| 5 | Compose hardening (healthchecks, pins, log rotation) + frontend k8s manifests | [todo/04](../todo/04-devops.md) |
| 6 | Backlog: backend OTel/metrics, Web Push e2e, social auth, seed, publishing, backups | [todo/02](../todo/02-backend.md)–[05](../todo/05-docs-maintenance.md) |
