# Environment requirements

Which env vars this stack needs, where they live, and how to produce the ones
that must be generated rather than just typed in.

## Which env files are actually active

Every compose service reads its own env file via Compose's `env_file:` —
there is no single shared `.env` anymore. This replaced an earlier layout
where a single root `.env` fed all services via `${VAR}` interpolation, and a
completely unwired `prod/backend/`/`prod/frontend/` pair of leftover files
sat next to it doing nothing (both were deleted — nothing referenced them).

| Path | Tracked in git? | Role |
| --- | --- | --- |
| `prod/app.env` | No (gitignored) | **Active.** Read by `docker-compose.yml`'s `app` and `migrate` services (`env_file:`). |
| `prod/app.env.example` | Yes | Template for the file above — the fullest reference of what the backend reads, with comments. |
| `prod/nextjs.env` | No (gitignored) | **Active.** Read by the `nextjs` service two ways: `env_file:` (runtime) and `COPY`'d directly into the image at build time, where Next.js's own env loading reads it natively (see below) — no `--env-file` flag or Compose interpolation involved. |
| `prod/nextjs.env.example` | Yes | Template for the file above. |
| `prod/services/<name>.env` | Only if it holds no secret (see below) | **Active.** One file per infra service (`postgres`, `redis`, `rabbitmq`, `nats`, `mqtt`, `kafka`, `mongo`, `elasticsearch`, `kibana`, `fluent-bit`, `mailpit`, `minio`), read via that service's `env_file:`. |
| `prod/services/<name>.env.example` | Yes | Tracked reference, only exists for the services that hold a real credential (`postgres`, `rabbitmq`, `mongo`, `minio`) — the rest (`redis`, `kafka`, etc.) have no secret at all and are tracked directly under their plain name. |

**Setup:** copy every `.example` to its real name before first run (see
Quickstart in `README.md`) — `docker compose up` hard-errors if an `env_file:`
target doesn't exist.

**Cross-file duplication, on purpose:** a few values are needed under two
different names in two different files (Compose's `env_file:` only injects
vars into that one container, it doesn't compose values across files). Keep
these in sync if you rotate them:
- `prod/app.env`'s `DATABASE_URL` embeds `prod/services/postgres.env`'s user/password/db.
- `prod/app.env`'s `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY`/`MINIO_BUCKET` mirror `prod/services/minio.env`'s `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD`/`MINIO_BUCKET`.
- `prod/nextjs.env`'s `NEXT_PUBLIC_VAPID_PUBLIC_KEY` mirrors `prod/app.env`'s `VAPID_PUBLIC_KEY` — same keypair, both sides.

Ports are no longer configurable via env at all — they're hardcoded literals
directly in `docker-compose.yml`'s `ports:` (e.g. `"5432:5432"`), since
Compose can only resolve host port bindings via its own `${VAR}`
interpolation, not via `env_file:`, and keeping one interpolation source
around just for ports would have defeated the point of per-service files.
Edit `docker-compose.yml` directly if you need to remap a port.

## Backend — essential variables

These need a real (non-placeholder) value for the backend to be secure/correct
in anything beyond local dev. All are read by the `app` service in
`docker-compose.yml` from `prod/app.env`, except `POSTGRES_*` which lives in
`prod/services/postgres.env` (and is also embedded in `prod/app.env`'s
`DATABASE_URL` — see the cross-file duplication note above).

| Variable | Purpose | Generated? |
| --- | --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` (`prod/services/postgres.env`) | Database credentials | No — pick a strong password |
| `JWT_SECRET` | Signs access/refresh JWTs | **Yes** |
| `TOKEN_DERIVATION_SECRET` | HMAC-SHA256 key for deriving compound Redis session keys | **Yes** |
| `ENCRYPTION_KEY` | AES-256-GCM key, encrypts MFA TOTP secrets at rest | **Yes** (64 hex chars) |
| `COOKIE_SECRET` | Signs cookies (`cookie-parser`) | **Yes** |
| `CSRF_SECRET` | HMAC key for the CSRF double-submit token | **Yes** |
| `APP_URL` | Browser-reachable backend origin (OAuth callbacks land here) | No — your real domain |
| `FRONTEND_URL` | Browser-reachable frontend origin (OAuth redirects, email links). Also set as `NEXT_PUBLIC_APP_URL` on the backend for legacy reasons, and independently as `prod/nextjs.env`'s own `NEXT_PUBLIC_APP_URL` for the frontend build | No — your real domain |
| `COOKIE_DOMAIN` | Root domain so auth cookies reach all subdomains (e.g. `.example.com`). Leave empty for host-only cookies on a single origin. Must match `prod/nextjs.env`'s `COOKIE_DOMAIN` | No |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web Push signing keypair + contact email | **Yes** (keypair) |

## Backend — optional / feature-gated

Safe to leave unset — the feature they gate just won't be available. All have
working defaults or a no-op fallback.

| Variable(s) | Feature | Notes |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID`/`_SECRET`, `GITHUB_*`, `LINKEDIN_*`, `TWITCH_*`, `X_*`, `HUGGING_FACE_*` | Social login (one pair per provider) | A provider is only enabled once its client id is set. Get credentials from each provider's developer console (URLs are in `prod/app.env.example`'s OAuth section). Register the callback as `<APP_URL>/auth/oauth/<provider>/callback`. |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Outbound email via real SMTP | Takes priority over `RESEND_API_KEY` when set. **Always connects on port 465 with implicit TLS** — this is hardcoded in `mail.transport.ts`, not configurable, so there's no `SMTP_PORT`/`SMTP_SECURE` to set. Get these from your mail provider (mxroute, etc. — must support port 465/implicit TLS). |
| `RESEND_API_KEY` | Outbound email via Resend (fallback if `SMTP_HOST` unset) | From resend.com. If neither this nor `SMTP_HOST` is set, mail just logs to console (dev no-op). |
| `MAIL_FROM` / `MAIL_REPLY_TO` | From/reply-to address for outbound mail | Defaults to a placeholder Resend address |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` / `MINIO_BUCKET` (in `prod/app.env`); `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` / `MINIO_BUCKET` (in `prod/services/minio.env`) | Object storage (uploads) | Same credentials, different var names per file — see the cross-file duplication note above. Dev defaults `minioadmin`/`minioadmin` — change for anything beyond local dev |
| `KAFKA_BROKER` | Frontend event indexing pipeline | Off by default in this deploy (`KAFKA_BROKER=disabled`); the `kafka` compose profile must also be started |
| `LOG_LEVEL` | Logging verbosity | Defaults are fine |

`AUTH_IP_STRICT` and `LOG_FILE` are read by the app's own config code but are
**not** forwarded by `docker-compose.yml` (no such key in the `app`/`migrate`
`env_file:` — anything not in `prod/app.env` never reaches the container, no
matter what your shell has exported). Setting either in `prod/app.env` currently
has no effect; wiring them up would be a `docker-compose.yml` change, not an
env one.

Everything in `prod/services/*.env` (ports aside, which are now hardcoded in
`docker-compose.yml` — see above) is dev-infra credential overrides for
services this deployment doesn't currently use — safe to ignore unless you
turn on the matching compose profile.

## Frontend — essential variables

`prod/nextjs.env` holds its own copies of the browser-facing values (there is no
derivation from the backend file anymore — each file is self-contained by
design, see the cross-file duplication note above). `NEXT_PUBLIC_*` vars are
baked into the client bundle at `next build` time.

The `nextjs` service's build `context:` in `docker-compose.yml` is the repo
root (not `next-js-boilerplate/`) specifically so `prod/docker/frontend/Dockerfile`
can `COPY prod/nextjs.env` directly into the image as `.env.production`, which
Next.js's own env loading (`@next/env`) reads natively during the build — the
same mechanism that makes a local `.env.production` work, just populated by
`COPY` instead of sitting on disk already. This means there is no Compose
`${VAR}` interpolation and no `--build-arg`/`--env-file` involved at all for
the frontend build; a missing or incomplete `prod/nextjs.env` fails the build
immediately with a clear error from the Dockerfile itself (a `COPY` failure if
the file doesn't exist, or a `grep` check if a required var is blank).

| Bundled variable (in `prod/nextjs.env`) | Notes |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Browser-reachable frontend origin |
| `NEXT_PUBLIC_REALTIME_WS_URL` | Single realtime WebSocket endpoint on the backend |
| `NEXT_PUBLIC_MINIO_PUBLIC_URL` | Browser-reachable object-storage origin |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Must match `prod/app.env`'s `VAPID_PUBLIC_KEY` — same keypair, both sides |

**Important:** because these are inlined at image build time, not read at
container start, changing any of them in `prod/nextjs.env` requires a rebuild —
`docker compose up -d --build nextjs` (or `make rebuild SERVICE=nextjs`) — a
plain restart keeps serving the stale baked-in values.

## How to produce the generated variables

| Variable | Command | Notes |
| --- | --- | --- |
| `JWT_SECRET` | `openssl rand -hex 32` | |
| `TOKEN_DERIVATION_SECRET` | `openssl rand -hex 32` | Can reuse `JWT_SECRET`'s value in a pinch (code falls back to it), but prefer a separate one |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` | Produces 64 hex chars = 32 bytes, required for AES-256-GCM |
| `COOKIE_SECRET` | `openssl rand -hex 32` | |
| `CSRF_SECRET` | `openssl rand -hex 32` | |
| `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` | Prints both keys together — keep them as a pair, don't mix with an old keypair |
| Database/MinIO/RabbitMQ passwords | `openssl rand -base64 24` (or any password manager) | Plain credentials, not derived keys — any sufficiently random string works |

Rotating any of `JWT_SECRET` / `TOKEN_DERIVATION_SECRET` / `COOKIE_SECRET` /
`CSRF_SECRET` invalidates every currently-issued session/cookie/CSRF token —
all logged-in users get signed out the moment the `app` container picks up the
new value. Plan rotations accordingly.
