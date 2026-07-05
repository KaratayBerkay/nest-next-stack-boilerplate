# Environment requirements

Which env vars this stack needs, where they live, and how to produce the ones
that must be generated rather than just typed in.

## Which env file is actually active

This repo has env files in two places. **Only one of them is wired to the
running deployment** — the other is a reference/template set for a different
deployment shape that isn't currently used.

| Path | Tracked in git? | Role |
| --- | --- | --- |
| `.env` | No (gitignored) | **Active.** Read by root `docker-compose.yml` for both the `app` (backend) and `nextjs` (frontend) services — this is the one file that actually reaches the running containers. |
| `.env.example` | Yes | Template for the file above. Copy to `.env` and fill in. |
| `prod/backend/.env` | No (gitignored) | **Not wired to anything.** No `env_file:` or build arg in `docker-compose.yml` references it. Appears to be a leftover from an earlier deployment attempt. |
| `prod/backend/.env.example` | Yes | Full backend variable reference/documentation — every var the NestJS app reads, with comments. Not consumed at runtime; read this to know what a var does. |
| `prod/backend/.env.production.example` | Yes | A trimmed template marking which vars are **required** for a hardened prod deploy, if you ever run the backend outside this repo's `docker-compose.yml` (e.g. `docker run --env-file`). |
| `prod/backend/.env.fixed` | No (gitignored) | Stale working copy, contains at least one renamed/dead var (`TOKEN_LENGTH` instead of `TOKEN_DERIVATION_SECRET`). Not used. |
| `prod/frontend/.env` | No (gitignored) | **Not wired to anything**, same as the backend one. |
| `prod/frontend/.env.example` | Yes | Reference for frontend vars, for the same standalone-deploy scenario as `prod/backend/.env.production.example`. |
| `prod/frontend/.env.fixed` | No (gitignored) | Stale working copy, still has dead var names (`NEXT_PUBLIC_MSG_WS_URL`/`NEXT_PUBLIC_WS_URL` instead of `NEXT_PUBLIC_REALTIME_WS_URL`). Not used. |

**If you're running this stack via `docker compose up`, the only file to edit
is root `.env`.** The `prod/backend/.env.example` file is still the best single
place to look up what a given var does, since it has the most complete
comments — just don't expect editing `prod/backend/.env` itself to do anything.

## Backend — essential variables

These need a real (non-placeholder) value for the backend to be secure/correct
in anything beyond local dev. All are read by the `app` service in
`docker-compose.yml` from root `.env`.

| Variable | Purpose | Generated? |
| --- | --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database credentials | No — pick a strong password |
| `JWT_SECRET` | Signs access/refresh JWTs | **Yes** |
| `TOKEN_DERIVATION_SECRET` | HMAC-SHA256 key for deriving compound Redis session keys | **Yes** |
| `ENCRYPTION_KEY` | AES-256-GCM key, encrypts MFA TOTP secrets at rest | **Yes** (64 hex chars) |
| `COOKIE_SECRET` | Signs cookies (`cookie-parser`) | **Yes** |
| `CSRF_SECRET` | HMAC key for the CSRF double-submit token | **Yes** |
| `BACKEND_PUBLIC_URL` | Browser-reachable backend origin (OAuth callbacks land here) | No — your real domain |
| `FRONTEND_PUBLIC_URL` | Browser-reachable frontend origin (OAuth redirects, email links); also baked into the frontend bundle at image build time | No — your real domain |
| `COOKIE_DOMAIN` | Root domain so auth cookies reach all subdomains (e.g. `.example.com`). Leave empty for host-only cookies on a single origin | No |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web Push signing keypair + contact email | **Yes** (keypair) |

## Backend — optional / feature-gated

Safe to leave unset — the feature they gate just won't be available. All have
working defaults or a no-op fallback.

| Variable(s) | Feature | Notes |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID`/`_SECRET`, `GITHUB_*`, `LINKEDIN_*`, `TWITCH_*`, `X_*`, `HUGGING_FACE_*` | Social login (one pair per provider) | A provider is only enabled once its client id is set. Get credentials from each provider's developer console (URLs are in `prod/backend/.env.example`'s OAuth section). Register the callback as `<BACKEND_PUBLIC_URL>/auth/oauth/<provider>/callback`. |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Outbound email via real SMTP | Takes priority over `RESEND_API_KEY` when set. **Always connects on port 465 with implicit TLS** — this is hardcoded in `mail.transport.ts`, not configurable, so there's no `SMTP_PORT`/`SMTP_SECURE` to set. Get these from your mail provider (mxroute, etc. — must support port 465/implicit TLS). |
| `RESEND_API_KEY` | Outbound email via Resend (fallback if `SMTP_HOST` unset) | From resend.com. If neither this nor `SMTP_HOST` is set, mail just logs to console (dev no-op). |
| `MAIL_FROM` / `MAIL_REPLY_TO` | From/reply-to address for outbound mail | Defaults to a placeholder Resend address |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` / `MINIO_BUCKET` / `MINIO_PUBLIC_URL` | Object storage (uploads) | Has working dev defaults (`minioadmin`/`minioadmin`) — change for anything beyond local dev |
| `KAFKA_BROKER` | Frontend event indexing pipeline | Off by default in this deploy (`KAFKA_BROKER=disabled`); the `kafka` compose profile must also be started |
| `LOG_LEVEL` / `LOG_FILE` | Logging verbosity / optional file sink for the Fluent Bit → ELK pipeline | Defaults are fine |
| `AUTH_IP_STRICT` | Hard-401 on session IP mismatch instead of just logging it | Keep `false` unless you specifically want this |

Everything else in `.env.example` (`*_PORT` vars, `RABBITMQ_*`, `NATS_*`,
`MQTT_*`, `MONGO_*`) is dev-infra port/credential overrides for services this
deployment doesn't currently use — safe to ignore unless you turn on the
matching compose profile.

## Frontend — essential variables

The Next.js app itself reads no env file directly in this deployment; its
`NEXT_PUBLIC_*` vars are **derived from the backend vars above** and baked into
the client bundle at `next build` time (see `docker-compose.yml`'s `nextjs`
build args). There is nothing separate to fill in here as long as the backend
vars above are set — just be aware of the build-time-baking implication below.

| Bundled variable | Derived from | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | `FRONTEND_PUBLIC_URL` | |
| `NEXT_PUBLIC_REALTIME_WS_URL` | `REALTIME_WS_URL` (falls back to `ws://localhost:<APP_PORT>/ws`) | Single WebSocket endpoint |
| `NEXT_PUBLIC_MINIO_PUBLIC_URL` | `MINIO_PUBLIC_URL` | |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `VAPID_PUBLIC_KEY` | Must match the backend's private key — same keypair, both sides |

**Important:** because these are inlined at image build time, not read at
container start, changing any of the source vars in `.env` requires
`docker compose build nextjs && docker compose up -d nextjs` — a plain restart
keeps serving the stale baked-in values.

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
