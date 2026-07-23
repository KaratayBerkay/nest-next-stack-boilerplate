# nest-next-stack-boilerplate

Monorepo combining a **NestJS** backend (GraphQL/REST/gRPC/WS) with a **Next.js** 16
frontend (App Router, SSR/CSR, BFF proxy) and full infrastructure (Postgres, Redis, Kafka,
RabbitMQ, NATS, MQTT, Mongo, MinIO, ELK) — all orchestrated via Docker Compose.

## Quickstart

Every service reads its own env file via Compose's `env_file:` — none are
committed (they hold credentials), so create them from their `.example`
counterparts first:

```bash
make up
# or with a profile: make up PROFILE=all
# or plain compose: docker compose run --rm vault-init && docker compose up -d --build
```

No `--env-file` flag is ever needed, for any command — including builds.
`Makefile` handles vault-init automatically on `make up` and `make rebuild`;
everything also works with plain `docker compose`.

First-run notes:
- `nest-js-boilerplate/logs/` must be writable by uid 1000 (`chmod 777 nest-js-boilerplate/logs` or `chown 1000`).
- The `migrate` and `minio-setup` services run once and exit — check their logs if the app won't start.
- Default credentials are **dev-only** (user `nest` / password `nest`; MinIO `minioadmin`/`minioadmin`). Override in the copied `.env` files for production — see `requirements.md` for what each variable does and how to generate the secrets.

## How the frontend build gets its public env vars

`NEXT_PUBLIC_*` values are inlined into the browser bundle at `next build`
time. The `nextjs` Dockerfile uses `ARG`/`ENV` for these values; the compose
`args:` section picks them from the root `.env` file (automatically read by
Compose). Vault-init populates root `.env` with `NEXT_PUBLIC_*` vars from the
frontend vault entry before each build.

If a required `NEXT_PUBLIC_*` var is missing, the build fails with a clear
Compose error: `Run vault-init first: docker compose run --rm vault-init`.

`Makefile` targets (`make up` / `make build` / `make rebuild` / `make down` /
`make logs` / `make ps`) are plain `docker compose` underneath, plus
`PROFILE=all` (or `tools`/`brokers`/`kafka`/`mongo`/`mail`) and
`SERVICE=<name>` shortcuts, e.g. `make rebuild SERVICE=nextjs`. Use them or
call `docker compose` directly — both work identically now.

## Service / port table

| Service | Host port | In-network | Notes |
|---|---|---|---|
| **Backend (NestJS)** | `3000` | `app:3000` | HTTP + GraphQL + REST, WebSocket gateway on `/ws` |
| **gRPC** | `5050` | `app:5050` | |
| **Frontend (Next.js)** | `3200` | `nextjs:3100` | BFF proxy, WS client |
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

## Flutter (mobile) APK

A Flutter app lives at `flutter-boilerplate/` — a 1:1 mobile conversion of the Next.js frontend.

```bash
# First build (slow — compiles from source)
docker compose --profile flutter build flutter

# Run (builds APK + serves on port 8082)
docker compose --profile flutter up flutter

# Rebuild without Docker image rebuild (faster iteration)
docker compose --profile flutter up --no-build flutter

# Download from http://localhost:8082/app-release.apk
```

For fastest iteration, build locally:

```bash
cd flutter-boilerplate && flutter build apk --release
```

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
├── .vault-envs/                # Secrets fetched by vault-init (gitignored)
│   ├── backend.env, frontend.env, postgres.env, ...
├── docker/
│   ├── vault-init/
│   │   └── entrypoint.sh             # Fetches secrets from Vault, merges NEXT_PUBLIC_* into .env
├── scripts/
│   └── setup.mjs               # Quickstart: prerequisites → vault-init → compose up → migrations
└── docs/                       # Documentation
```
