# 02 — Backend (NestJS) enhancements

The backend covers essentially the whole of docs.nestjs.com (see
`docs/backend/progress/nestjs-feature-checklist.md` — no ⬜ items remain). What's left
is productionizing beyond the docs, plus a few known warts observed in the running
container on 2026-07-02.

## P1 — Known warts (from live container logs) (S each)

- [ ] **`TimeoutNegativeWarning: -1783000727042 is a negative number`** at boot — some
      scheduled task computes a fire time in the past (epoch-ms subtraction bug,
      likely in `tasks/` or `project-tasks/`). Node clamps it to 1 ms, so whatever it
      is runs immediately and possibly hot-loops.
- [ ] **Duplicate OpenAPI DTO**: `"CreateCatDto" is defined multiple times with
      different schemas` — @nestjs/swagger says this becomes a hard error in its next
      major. Rename one or use `@ApiExtraModels` with custom names.
- [ ] **Kafka consumer first-boot race**: on a fresh broker the `frontend-events`
      consumer fails once with "This server does not host this topic-partition"
      before auto-creation catches up. Pre-create topics (an init service or
      `admin.createTopics()` on boot) or add retry-with-backoff before the "will not
      be indexed" giveup path.

## P1 — Backlog inherited from the pre-monorepo TODO (file itself is missing — see 05)

`docs/backend/README.md` references these as the standing backlog:

- [x] **Social auth providers** (M) — Google/GitHub OAuth implemented directly (PKCE
      Authorization Code flow, not Passport). See `oauth/` and `AuthService.loginWithOAuth()`.
- [x] **Layered tokens + RBAC in Redis** (L) — role/permission model with Redis-backed
      session/permission cache; the `authorization/` module is the seam. ([phase2.md](../progress/archive/phase2.md))
- [ ] **Secure-by-env SSR cookies** (S) — cookie `secure`/`sameSite` flags derived from
      env instead of hardcoded (pairs with frontend BFF cookie options).
- [ ] **Load testing** (M) — k6 or autocannon profiles for the hot paths (auth,
      GraphQL, gRPC), with the Fastify-perf variant compared; document baselines.

## P1 — Observability parity with the frontend (M)

The frontend ships OpenTelemetry (`@vercel/otel` + instrumentation hook); the backend
has **no OTel at all** (checked deps 2026-07-02) — so distributed traces stop at the BFF.

- [ ] `@opentelemetry/sdk-node` + auto-instrumentations (http, graphql, prisma, ioredis,
      kafkajs); propagate context from the frontend's traces.
- [ ] Prometheus `/metrics` (prom-client) or OTel metrics exporter; keep it off the
      public port.
- [ ] Decide the trace backend (Jaeger/Tempo service in a compose `observability`
      profile) — today only logs reach ELK.

## P2 — Nice to have

- [ ] **Prisma seed script** (`prisma db seed`) so a fresh stack has demo users/data —
      today the DB starts empty and every demo needs manual registration.
- [x] **Dev mail sink** — Mailpit added to compose (profile: `mail`/`all`, SMTP on 1025,
      web UI on 8025). Set `SMTP_HOST=mailpit` in dev to capture outgoing email locally.
- [ ] **GraphQL persisted queries / depth+complexity budget review** — complexity
      module exists; wire limits to env and document them.
- [ ] **Outbox relay metrics** — the outbox pattern is implemented; expose lag/failure
      counters (pairs with the metrics item above).
- [ ] **`docker-compose` healthcheck for the gRPC port** — only HTTP `/health` is
      probed today.
