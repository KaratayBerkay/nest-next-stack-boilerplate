# 05 — Docs maintenance (stale / broken after the monorepo merge)

The `docs/` tree was copied from the two standalone repos; many references predate the
merge. Verified against the tree on 2026-07-02.

## P0 — Broken references (S)

- [ ] **Pre-monorepo relative paths**: `docs/frontend/README.md` and `STATUS.md` link
      the backend as `../../nest-js` — the directory here is `nest-js-boilerplate`.
      Sweep all of `docs/` for `nest-js`/`next-js` path links and fix.
- [ ] **`docs/backend/README.md` references files that don't exist in this copy**:
      `STATUS.md`, `TODO.md`, `progress/README.md`,
      `research/claude-code-ecosystem-2026.md`, `research/nestjs-stack-2026-gotchas.md`,
      plus `../.claude/` and `../CLAUDE.md` paths that moved. Either bring those files
      over from the original repo or trim the index to what exists (only
      `DESIGN_GUIDE.md`, `progress/nestjs-feature-checklist.md`, `research/logger.md`,
      `research/build-and-docker.md` are present).
- [ ] **The backend backlog lives only in a dead link** — the "social auth, RBAC in
      Redis, secure-by-env cookies, load testing" TODO is referenced but the file is
      missing. It has been reconstructed into [02-backend.md](02-backend.md); recover
      the original if it has more detail.
- [ ] `docs/frontend/README.md` says "the whole `docs/` folder is gitignored" — no
      longer true in the monorepo; delete the note.

## P1 — Content drift (S each)

- [ ] **`docs/frontend/STATUS.md` self-contradicts**: the dashboard says 58/~60
      verified, but the "✅ Completed & verified (0) — _Nothing yet_" section was never
      updated from the scaffold days. Rewrite that section or delete it in favor of
      the dashboard.
- [ ] **Kafka port change**: compose now publishes Kafka to the host on **29092**
      (in-network stays `kafka:9092`). Update `prod/backend/.env.production.example`
      (`KAFKA_BROKER=localhost:9092`) and any doc that mentions host port 9092.
- [ ] **Document the 2026-07-02 compose fixes** somewhere durable (root README or a
      `docs/backend/research/compose-stack.md` companion to `build-and-docker.md`):
      - `dockerfile:` paths are context-relative → `../prod/docker/...`
      - fluentd log driver resolves addresses on the **host** → `localhost:24224` + async
      - backend requires `JWT_SECRET`/`ENCRYPTION_KEY`, reads `REDIS_HOST`/`REDIS_PORT`
        (not `REDIS_URL`), and needs `MINIO_*` in-network endpoints
      - `mc alias set` replaced the removed `mc config host add`
      - Next standalone binds IPv4-only → healthcheck must hit `127.0.0.1`
      - migrations run via the new `migrate` one-shot service (Dockerfile `migrate`
        target, invoked as `node_modules/.bin/prisma` — `pnpm exec` self-installs and
        fails as non-root)
      - `nest-js-boilerplate/logs/` must be writable by uid 1000
- [ ] **Root README** is one line — see [01-stack-integration.md](01-stack-integration.md);
      once written, make `docs/README.md`-style indexes point at it.

## P2 — Structure

- [ ] Add a `docs/README.md` top-level index (backend / frontend / agents / skills /
      todo) so the monorepo docs have one entry point.
- [ ] Decide whether `docs/agents/` + `docs/skills/` (Claude Code ecosystem docs)
      should move next to the actual `.claude/` assets they describe, or stay — either
      way link them from the index.
- [ ] Progress checklists are frozen artifacts of the "implement the docs" phase —
      mark them as archived (banner at top) so future readers don't mistake them for
      the live backlog; the live backlog is now `docs/todo/`.
