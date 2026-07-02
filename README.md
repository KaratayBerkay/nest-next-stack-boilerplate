# nest-next-stack-boilerplate

Monorepo combining a **NestJS** backend (GraphQL/REST/gRPC/WS) with a **Next.js** 16
frontend (App Router, SSR/CSR, BFF proxy) and full infrastructure (Postgres, Redis, Kafka,
RabbitMQ, NATS, MQTT, Mongo, MinIO, ELK) — all orchestrated via Docker Compose.

## Quickstart

```bash
docker compose --profile all up -d --build
```

First-run notes:
- `nest-js-boilerplate/logs/` must be writable by uid 1000 (`chmod 777 nest-js-boilerplate/logs` or `chown 1000`).
- The `migrate` and `minio-setup` services run once and exit — check their logs if the app won't start.
- Default credentials are **dev-only** (user `nest` / password `nest`; MinIO `minioadmin`/`minioadmin`). Override via `.env` for production.

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
├── nest-js-boilerplate/        # NestJS backend
├── next-js-boilerplate/        # Next.js frontend
├── prod/                       # Production Dockerfiles + env templates
│   ├── docker/
│   │   ├── backend/Dockerfile.prod
│   │   └── frontend/Dockerfile
│   └── backend/.env.production.example
└── docs/                       # Documentation
```
