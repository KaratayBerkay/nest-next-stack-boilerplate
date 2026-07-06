# nest-next-stack-boilerplate

Monorepo combining a **NestJS** backend (GraphQL/REST/gRPC/WS) with a **Next.js** 16
frontend (App Router, SSR/CSR, BFF proxy) and full infrastructure (Postgres, Redis, Kafka,
RabbitMQ, NATS, MQTT, Mongo, MinIO, ELK) — all orchestrated via Docker Compose.

## Quickstart

Every service reads its own env file via Compose's `env_file:` — none are
committed (they hold credentials), so create them from their `.example`
counterparts first:

```bash
make setup
docker compose up -d --build --profile all
```

No `--env-file` flag is ever needed, for any command — including builds.
`Makefile` is just an optional convenience wrapper (`make setup` for the copy
step above, `PROFILE=`/`SERVICE=` shortcuts); everything also works with
plain `docker compose`.

First-run notes:
- `nest-js-boilerplate/logs/` must be writable by uid 1000 (`chmod 777 nest-js-boilerplate/logs` or `chown 1000`).
- The `migrate` and `minio-setup` services run once and exit — check their logs if the app won't start.
- Default credentials are **dev-only** (user `nest` / password `nest`; MinIO `minioadmin`/`minioadmin`). Override in the copied `.env` files for production — see `requirements.md` for what each variable does and how to generate the secrets.

## How the frontend build gets its public env vars

`NEXT_PUBLIC_*` values are inlined into the browser bundle at `next build`
time. Rather than pass these as `--build-arg` (which would need Compose to
interpolate `${VAR}` before any container exists, requiring an explicit
`--env-file` on every build), the `nextjs` service's build `context:` is the
repo root, and `prod/docker/frontend/Dockerfile` `COPY`s `prod/nextjs.env` in
directly — Next.js's own env loading (`@next/env`) reads it natively during
the build, the same way it would read a local `.env.production`. Zero
Compose-level interpolation, so zero `--env-file` requirement anywhere.

If `prod/nextjs.env` doesn't exist or is missing a required value, the build
fails fast with a clear error from the Dockerfile itself (a `COPY` failure or
a custom `grep` check) — not a Compose error, and not a buried Zod validation
error deep inside `next build`.

`Makefile` targets (`make up` / `make build` / `make rebuild` / `make down` /
`make logs` / `make ps`) are plain `docker compose` underneath, plus
`PROFILE=all` (or `tools`/`brokers`/`kafka`/`mongo`/`mail`) and
`SERVICE=<name>` shortcuts, e.g. `make rebuild SERVICE=nextjs`. Use them or
call `docker compose` directly — both work identically now.

## Service / port table

| Service | Host port | In-network | Notes |
|---|---|---|---|
| **Backend (NestJS)** | `3000` | `app:3000` | HTTP + GraphQL + REST |
| **gRPC** | `5050` | `app:5050` | |
| **Frontend (Next.js)** | `3200` | `nextjs:3100` | BFF proxy, WS gateway |
| **Messaging WS** | `3003` | `messaging-ws:3003` | Chat WebSocket server |
| Postgres | `5432` | `postgres:5432` | |
| Redis | `6379` | `redis:6379` | |
| **Kafka** (profile) | `29092` | `kafka:9092` | Host uses `localhost:29092` |
| RabbitMQ (profile) | `5672` | `rabbitmq:5672` | mgmt console `15672` |
| NATS (profile) | `4222` | `nats:4222` | monitor `8222` |
| MQTT (profile) | `1883` | `mqtt:1883` | |
| Mongo (profile) | `27017` | `mongo:27017` | |
| Elasticsearch | `9200` | `elasticsearch:9200` | |
| Kibana | `5601` | `kibana:5601` | |
| MinIO | `9000` | `minio:9000` | console `9001` |
| fluent-bit forward | `24224` | `fluent-bit:24224` | |

## Compose profile matrix

| Profile | Includes |
|---|---|
| `core` (default) | postgres, redis, migrate, app, nextjs, elasticsearch, kibana, fluent-bit, minio, minio-setup |
| `brokers` | + rabbitmq, nats, mqtt |
| `kafka` | + kafka |
| `mongo` | + mongo |
| `all` | brokers + kafka + mongo |

## Docs

- [Backend docs](docs/backend/README.md) — NestJS architecture, design guide, research
- [Auth flow](docs/backend/AUTH.md) — Redis-backed sessions: token triple, compound
  key, instant revocation, tier RBAC. Guarded requests fail closed (503) when Redis is
  down; `JWT_ACCESS_TTL` drives the Redis session TTL, and `AUTH_IP_STRICT=true`
  rejects requests whose IP differs from the one captured at login (default: warn only)
- [Frontend docs](docs/frontend/README.md) — Next.js routes, BFF proxy, testing
- [Todo / roadmap](docs/todo/README.md) — current phase and backlog

## Project structure

```
├── docker-compose.yml          # Root orchestration (all services)
├── Makefile                    # Optional convenience wrapper (PROFILE=/SERVICE=, make setup)
├── .dockerignore                     # Scopes the nextjs build's repo-root context
├── nest-js-boilerplate/        # NestJS backend
├── next-js-boilerplate/        # Next.js frontend
├── prod/
│   ├── app.env(.example)              # Backend (NestJS) env — env_file: for `app`/`migrate`
│   ├── nextjs.env(.example)           # Frontend (Next.js) env — env_file: (runtime) + COPY'd into the build
│   ├── docker/
│   │   ├── backend/Dockerfile.prod
│   │   └── frontend/Dockerfile               # Build context is the repo root — see its comments
│   └── services/                     # One env file per infra service (postgres, redis, kafka, ...)
│       ├── postgres.env(.example)    # gitignored real file + tracked example
│       └── redis.env, kafka.env, ...  # no secrets — tracked directly
└── docs/                       # Documentation
```
