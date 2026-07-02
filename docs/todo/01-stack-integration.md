# 01 — Stack integration (monorepo glue)

The two apps were built as siblings and merged into this monorepo; each is complete on
its own, but the integration layer is where "full stack" is still unfinished.

## P0 — Cross-stack e2e suite (M)

The frontend's own TODO (`docs/frontend/TODO.md` §16) has exactly two unchecked boxes,
both blocked on "requires running NestJS backend" — which the root compose stack now
provides:

- [ ] e2e: register → login → me → logout round-trip against the real backend
- [ ] e2e: `access_token` refresh flow
- [ ] New: SSR vs CSR cookie demos against the real backend (the project's stated
      headline use case — currently only proven against mocks)
- [ ] New: WebSocket demo against the real NestJS gateway (`NEXT_PUBLIC_WS_URL`)

**How:** a `test/e2e-stack/` folder (or a Playwright project in `next-js-boilerplate`
with `STACK=1` env gate) that assumes `docker compose up` is running; wire it into root
CI (see below). Reuse the existing Playwright config — don't build a new harness.

## P0 — Root README + root `.env.example` (S)

- `README.md` at the repo root is a single line. Write: what this stack is, quickstart
  (`docker compose --profile all up -d --build`), service/port table — note **Kafka is
  `localhost:29092` from the host, `kafka:9092` in-network** — profile matrix
  (`brokers`/`kafka`/`mongo`/`all`), and links into `docs/`.
- No `.env.example` at the root, yet compose reads ~20 `${VAR:-default}`s. Create one
  listing at minimum: `JWT_SECRET`, `ENCRYPTION_KEY` (64 hex chars), `POSTGRES_*`,
  `MINIO_ROOT_*`, `KAFKA_PORT`, port overrides. Mark which defaults are dev-only
  (`prod/backend/.env.production.example` already documents the full backend set —
  link to it rather than duplicating).

## P0 — Messaging + WS servers as compose services (S/M)

`nextjs` ships `NEXT_PUBLIC_MSG_WS_URL=ws://localhost:3003`, but nothing in compose runs
`nest-js-boilerplate/messaging-server.mjs` (`MSG_PORT=3003`). Same for
`ws-server.mjs` (`WS_PORT=3002`). In Docker these features silently fail.

- [ ] Add `messaging-ws` (and if still used, `ws-demo`) services — a slim `node:24`
      image running the `.mjs` directly is enough; or fold them into the backend image
      as alternate commands.
- [ ] Decide whether `ws-server.mjs` is still needed at all, or the NestJS WS gateway
      supersedes it — delete if dead.

## P1 — Root CI workflow (M)

`nest-js-boilerplate/.github/workflows/ci.yml` and the frontend twin exist, but the
monorepo root has none. Today's breakage (wrong `dockerfile:` paths, fluentd address,
missing env, broken `mc` command, unrunnable migrations) is exactly the class nothing
currently tests.

- [ ] Root workflow with path filters delegating to each app's checks.
- [ ] **Compose smoke job**: build both images, `docker compose up -d` (core profile),
      wait for `app` + `nextjs` healthy, curl `/health` and `/`, assert `migrate` and
      `minio-setup` exited 0. This alone would have caught every issue fixed on 2026-07-02.
- [ ] Run the cross-stack e2e suite (above) on top of that job.

## P1 — Dev-mode compose (M)

`prod/docker/backend/Dockerfile.dev` exists but nothing uses it; there is no hot-reload
container story (contributors must run pnpm locally against compose infra).

- [ ] Either: a `dev` profile (backend `start:dev` + frontend `next dev` with bind
      mounts), or `docker compose watch` with `develop.watch` sections.
- [ ] Document the hybrid alternative too: infra in compose, apps on the host — that's
      what the per-app docs currently assume.

## P2 — Shared contract/codegen pipeline (M)

Frontend has `src/generated/` and a `generate-i18n-types` script; backend generates its
GraphQL SDL and Prisma client. There is no single command that regenerates frontend
types from the backend schema, so the GraphQL contract can drift silently.

- [ ] One root-level `pnpm generate` (or make target) that: builds backend SDL → runs
      GraphQL codegen for the frontend → fails CI on uncommitted diff.
- [ ] Consider extracting shared DTO/event types (Kafka `frontend-events` payloads are
      informally shared today) into a small `packages/contracts` workspace.
