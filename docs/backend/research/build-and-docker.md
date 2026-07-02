# Build & Docker — how this app is compiled and packaged

How the boilerplate goes from TypeScript source to a runnable production image, the decisions
behind it, and the gotchas that shaped the Dockerfiles. NestJS itself has **no official Docker
page** — this is community best practice reconciled against our stack (Node 24, pnpm 11,
NestJS 11, **Prisma 7**, GraphQL code-first).

## The build pipeline

`pnpm run build` → `nest build`, which drives **`tsc`** with `tsconfig.build.json`
(`tsconfig.json` minus `test/`, `dist/`, `**/*spec.ts`). Key compiler settings:

- `target: ES2023`, `module/moduleResolution: nodenext` — emitted JS uses real ESM-style
  resolution, so **runtime imports need explicit `.js`** (already handled in source).
- `declaration: true`, `sourceMap: true`, `incremental: true` — `.d.ts` + maps + a
  `.tsbuildinfo` cache for faster local rebuilds.
- `outDir: ./dist` + `sourceRoot: src` (nest-cli) ⇒ output lands at **`dist/src/main.js`**
  (note the `src/` segment — see SWC note below).
- `nest-cli.json` `deleteOutDir: true` wipes `dist/` each build; `assets` copies
  `serve-static/public/**` into `dist`; the `@nestjs/graphql` plugin runs on `.gqlmodel.ts`.

### Two generators run before/around the compile
- **`prebuild`** (`prisma generate`) — regenerates the Prisma client + `src/@generated`
  (prisma-nestjs-graphql models) for local builds where there was no install step.
- GraphQL **code-first** writes the SDL to `src/schema.gql` **at boot** (not build time), so the
  runtime image needs a writable `src/` (the runtime stage `chown`s one — see below).

### SWC builder (alternative, not the default)
`pnpm build:swc` (`nest build -b swc`) compiles ~2886 files in ~750 ms vs tsc's ~30 s, but:
1. it **skips type-checking** (we keep tsc as the strict gate), and
2. the SWC builder strips `sourceRoot`, so output is `dist/main.js`, **not** `dist/src/main.js`
   — `start:prod` and the Dockerfile `CMD` would need the path adjusted.

⇒ Default build stays **tsc**. Details in checklist #103.

## Docker images

Two Dockerfiles, both `node:24-bookworm-slim`:

| File | Stages | Deps | Purpose |
| --- | --- | --- | --- |
| `Dockerfile.dev` | single | full (dev) | hot-reload (`start:dev`), watch via bind-mount |
| `Dockerfile.prod` | base → builder → runtime | pruned to prod | minimal runnable image |

Production image **content size ≈ 199 MB** — within the 150–200 MB range considered good for a
NestJS service (a naive "copy everything" image is 1 GB+).

### Production multi-stage flow
1. **base** — `corepack enable` (pnpm) + `openssl`/`ca-certificates` (Prisma 7's query engine
   needs them; slim ships neither).
2. **builder** — copy manifests + `prisma/` + `prisma.config.ts` first (layer cache), then
   `pnpm install --frozen-lockfile` with a **pnpm store cache mount**. Compile, then
   `pnpm prune --prod --ignore-scripts` to drop devDeps in place (keeps the generated Prisma
   client/engine).
3. **runtime** — `NODE_ENV=production`; copy only `node_modules`, `dist`, `package.json`,
   `prisma/`, `prisma.config.ts`, `proto/`, all `--chown=node:node`; run as **non-root `node`**;
   `EXPOSE 3000 5050`; `STOPSIGNAL SIGTERM` (Nest `enableShutdownHooks`); a `node`-based
   `HEALTHCHECK` against `/health` (no curl in slim).

### Best-practice checklist (all satisfied)
Multi-stage ✓ · runtime ships only dist + prod deps + runtime files ✓ · devDeps pruned ✓ ·
non-root user ✓ · manifests-before-source layer ordering ✓ · secrets via runtime env (never
baked) ✓ · `.dockerignore` (excludes `node_modules`, `dist`, `.git`, `docs`, `*.md`, `.env*`,
`/src/@generated`, `/src/schema.gql`) ✓ · healthcheck + graceful stop ✓.

## Gotchas / decisions

### Why `bookworm-slim`, not Alpine
The common advice is "use Alpine for size", but **Prisma 7's engine** needs glibc + OpenSSL;
Alpine is musl and requires the `linux-musl-openssl-3.0.x` binary target (historically fragile).
`node:24-bookworm-slim` is Prisma's officially recommended base, and at 199 MB Alpine wouldn't
meaningfully help. **Deliberate trade-off, not an oversight.**

### `prisma generate` ran twice — fixed
`pnpm install` fires **`postinstall`** (`prisma generate`) and `pnpm run build` fires
**`prebuild`** (`prisma generate` again) → two identical generations in the builder. Fix:
the prod builder invokes the compiler directly with **`pnpm exec nest build`** (bypasses the
`prebuild` hook). The install-time generate is kept (the client + `src/@generated` are fresh
against the same schema); `.dockerignore` excludes the host's `src/@generated`/`schema.gql` so
`COPY . .` can't stale them. `Dockerfile.dev` is unaffected — it has no build step (just
`postinstall`, then `start:dev`), so it only generates once.

> We can't simply `pnpm install --ignore-scripts`: native prod deps (`@node-rs/argon2`,
> `better-sqlite3`, `esbuild`) need their install scripts. Keeping `postinstall` + skipping
> `prebuild` is the safe path.

### Native devDeps need a build toolchain in the builder
`pnpm install` in the builder installs **all** deps (incl. devDeps) so the app can compile.
Two of them — `better-sqlite3` and `sqlite3` (approved in `pnpm-workspace.yaml`, used only by the
alt-ORM `:memory:` e2e tests) — are native node-gyp addons; when no prebuilt binary matches the
Node/platform they **compile from source**, which needs **Python + a C/C++ toolchain** that
`bookworm-slim` doesn't ship. Without it the build dies at `pnpm install` with
`gyp ERR! Could not find any Python installation to use`.

Fix: install `python3 make g++` in the **builder stage only** (`apt-get` right after
`FROM base AS builder`). It never reaches the runtime image — the runtime stage starts from a
clean `base`, and `pnpm prune --prod` drops these test-only devDeps anyway. (`tsc` itself only
needs the *types*, not the compiled binary, so the runtime never touches them.)

> History: this surfaced because the SQLite ORM deps were added with the alt-ORM feature
> *after* the Dockerfiles were first written, so the prod image silently stopped building until
> the next full rebuild.

### Prisma 7 needs a `DATABASE_URL` even to *generate*
`prisma generate` resolves `env('DATABASE_URL')` from `prisma.config.ts` and **fails if unset**,
even though it never connects. Both Dockerfiles pass a throwaway
`ARG DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public` scoped to the
build only — `ARG` is **not** persisted into the image; the real URL comes from `--env-file` at
runtime.

### `pnpm prune --prod --ignore-scripts`
Without `--ignore-scripts`, prune re-runs `postinstall` (`prisma generate`) **after** the
`prisma` CLI (a devDep) has just been removed → `prisma: not found`. The `--ignore-scripts`
flag avoids that.

### Writable `src/` at runtime
GraphQL code-first writes `src/schema.gql` on boot. The runtime stage does
`mkdir -p /app/src && chown node:node /app/src` so the non-root user can write it.

## Kubernetes

Reference manifests live in [`../../k8s/`](../../k8s/). The image and app are built to run there;
the decisions:

### Multi-target image
`Dockerfile.prod` now has a **`migrate`** target alongside the default app stage:
`base → builder → {migrate, pruner} → runtime`. The `builder` no longer prunes; `pruner`
(`FROM builder` + `pnpm prune --prod`) produces the prod-only `node_modules` for `runtime`, while
`migrate` keeps the **full** `node_modules` (including the `prisma` CLI, a devDep).
```bash
docker build -f Dockerfile.prod -t <repo>:<git-sha> .                    # app
docker build -f Dockerfile.prod --target migrate -t <repo>-migrate:<git-sha> .  # migrations
```

### Migrations as a Job, never on app start
`pnpm prune --prod` strips the `prisma` CLI from the runtime image, so migrations **cannot** run
from the app pod — and running them per-replica would race. Run `prisma migrate deploy` as a
one-shot **Job** (`k8s/migrate-job.yaml`, built from the `migrate` target) and wait for it before
rolling out the Deployment.

### Read-only root filesystem
The Deployment sets `readOnlyRootFilesystem: true`. The only thing the app wrote to disk was the
GraphQL SDL (`autoSchemaFile`); it now generates **in-memory when `NODE_ENV=production`** (writes
to `src/schema.gql` only in dev, for codegen). An `emptyDir` is mounted at `/tmp` for Node/Prisma
scratch. The image already runs as non-root `node` (uid 1000) → `runAsNonRoot`, drop `ALL` caps,
`seccompProfile: RuntimeDefault`.

### Probes (Terminus, #112)
`startupProbe`/`livenessProbe` → `GET /health`; `readinessProbe` → `GET /health/ready`
(Prisma DB ping + heap). A generous `startupProbe` covers the slow boot (Prisma connect + schema
build) so liveness can stay aggressive. **k8s ignores the Dockerfile `HEALTHCHECK`** and uses
these.

### Graceful shutdown
`enableShutdownHooks()` + `STOPSIGNAL SIGTERM` are in place. The Deployment adds a
`preStop: sleep 10` (drains in-flight LB traffic, since k8s removes the pod from Service endpoints
concurrently with SIGTERM) and `terminationGracePeriodSeconds: 40` (covers HTTP + BullMQ job
drain).

### Runtime tuning (env, overridable via ConfigMap)
- `NODE_OPTIONS=--max-old-space-size=N` — Node ignores cgroup memory limits for its V8 heap
  (silent `OOMKilled`); cap it ~75% of the pod memory limit. Default `384` assumes a ~512Mi pod.
- `UV_THREADPOOL_SIZE` — libuv pool for **argon2** hashing + fs/DNS (default 4); match the CPU
  limit for auth-heavy load.

### Config & secrets
`ConfigModule` + Joi validation **fail-fast** on missing/invalid env (`abortEarly:false`) → a
misconfigured pod crashloops loudly instead of serving broken. Non-secret env → ConfigMap;
`DATABASE_URL`/JWT/cookie/CSRF secrets/API keys → Secret. Nothing is baked into the image
(`ARG DATABASE_URL` is build-only; `.dockerignore` excludes `.env*`).

### Database scaling
Set `connection_limit` in `DATABASE_URL` so `replicas × limit ≤ Postgres max_connections`; add
PgBouncer when scaling out. Ensure `schema.prisma` `binaryTargets` matches the node arch
(`debian-openssl-3.0.x`; add `linux-arm64-openssl-3.0.x` for arm64 nodes / multi-arch images).

### Build/CI
Multi-arch via `docker buildx --platform linux/amd64,linux/arm64` (native deps + Prisma engines
must match arch); `--cache-to/--cache-from type=registry` for fast CI; tag with the **git SHA**
(immutable, rollback-able), not `:prod`/`:latest`.

## Commands
```bash
# Production image
docker build -f Dockerfile.prod -t nest-boilerplate:prod .
docker run --rm --network host --env-file .env.production nest-boilerplate:prod

# Dev image (watch mode)
docker build -f Dockerfile.dev -t nest-boilerplate:dev .
docker run --rm -it --network host --env-file .env \
  -v "$PWD/src:/app/src" -v "$PWD/test:/app/test" -v /app/node_modules \
  nest-boilerplate:dev

# Local build (tsc, strict type-check gate) → dist/src/main.js
pnpm run build && node dist/src/main.js   # == start:prod
# Fast build, no type-check → dist/main.js
pnpm build:swc
```

## References
- The Last Dockerfile You Need for NestJS — https://dawchihliou.github.io/articles/the-last-dockerfile-you-need-for-nestjs
- Node.js multi-stage Dockerfiles — https://oneuptime.com/blog/post/2026-01-06-nodejs-multi-stage-dockerfile/view
- Optimizing NestJS image size (multi-stage + Alpine) — https://oneuptime.com/blog/post/2026-02-17-how-to-optimize-docker-image-size-for-a-nestjs-application-using-multi-stage-builds-and-alpine-base-images-for-gke/view
- Stack version gotchas — [`nestjs-stack-2026-gotchas.md`](./nestjs-stack-2026-gotchas.md)
