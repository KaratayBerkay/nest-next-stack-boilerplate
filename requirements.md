# Environment requirements

Which env vars this stack needs, where they live, and how to produce the ones
that must be generated rather than just typed in.

## Secret source: Vault

All secrets live in HashiCorp Vault at `https://vault.eys.gen.tr`. The
`vault-init` container fetches them on startup and writes one env file per
service into `.vault-envs/<service>.env`. Each `docker-compose.yml` service
reads its own file via `env_file: ./.vault-envs/<service>.env`.

| Path | Tracked in git? | Role |
| --- | --- | --- |
| `.vault-envs/backend.env` | No (gitignored) | Backend (NestJS) — read by `app` and `migrate` services |
| `.vault-envs/frontend.env` | No (gitignored) | Frontend (Next.js) — read by `nextjs` service at runtime; `NEXT_PUBLIC_*` vars also merged into root `.env` for build args |
| `.vault-envs/postgres.env` | No (gitignored) | Postgres credentials |
| `.vault-envs/redis-commander.env` | No (gitignored) | Redis Commander login |
| `.vault-envs/minio.env` | No (gitignored) | MinIO root credentials |
| `.vault-envs/elasticsearch.env` | No (gitignored) | Elasticsearch config |
| `.vault-envs/kafka.env` | No (gitignored) | Kafka config |
| `.vault-envs/kibana.env` | No (gitignored) | Kibana config |
| `.vault-envs/mongo.env` | No (gitignored) | Mongo config |
| `.vault-envs/rabbitmq.env` | No (gitignored) | RabbitMQ config |

**Setup:** ensure root `.env` has `VAULT_TOKEN`, then run:
```
docker compose run --rm vault-init
```
This populates all `.vault-envs/*.env` files and merges `NEXT_PUBLIC_*` vars
into `.env` for the next `docker compose up --build`.

## Backend — essential variables

These need a real (non-placeholder) value for the backend to be secure/correct
in anything beyond local dev. All are stored in Vault under
`secret/data/secret/production/backend`.

| Variable | Purpose | Generated? |
| --- | --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` (`.vault-envs/postgres.env`) | Database credentials | No — pick a strong password |
| `JWT_SECRET` | Signs access/refresh JWTs | **Yes** |
| `TOKEN_DERIVATION_SECRET` | HMAC-SHA256 key for deriving compound Redis session keys | **Yes** |
| `ENCRYPTION_KEY` | AES-256-GCM key, encrypts MFA TOTP secrets at rest | **Yes** (64 hex chars) |
| `COOKIE_SECRET` | Signs cookies (`cookie-parser`) | **Yes** |
| `CSRF_SECRET` | HMAC key for the CSRF double-submit token | **Yes** |
| `APP_URL` | Browser-reachable backend origin (OAuth callbacks land here) | No — your real domain |
| `FRONTEND_URL` | Browser-reachable frontend origin (OAuth redirects, email links) | No — your real domain |
| `COOKIE_DOMAIN` | Root domain so auth cookies reach all subdomains (e.g. `.example.com`) | No |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web Push signing keypair + contact email | **Yes** (keypair) |

## Backend — optional / feature-gated

Safe to leave unset — the feature they gate just won't be available. All have
working defaults or a no-op fallback.

| Variable(s) | Feature | Notes |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID`/`_SECRET`, `GITHUB_*`, `LINKEDIN_*`, `TWITCH_*`, `X_*`, `HUGGING_FACE_*` | Social login (one pair per provider) | A provider is only enabled once its client id is set. Get credentials from each provider's developer console. Register the callback as `<APP_URL>/auth/oauth/<provider>/callback`. |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Outbound email via real SMTP | Takes priority over `RESEND_API_KEY` when set. **Always connects on port 465 with implicit TLS** — this is hardcoded in `mail.transport.ts`. |
| `RESEND_API_KEY` | Outbound email via Resend (fallback if `SMTP_HOST` unset) | From resend.com. If neither this nor `SMTP_HOST` is set, mail just logs to console. |
| `MAIL_FROM` / `MAIL_REPLY_TO` | From/reply-to address for outbound mail | Defaults to a placeholder Resend address |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` / `MINIO_BUCKET` | Object storage (uploads) | Dev defaults `minioadmin`/`minioadmin` — change for anything beyond local dev |
| `KAFKA_BROKER` | Frontend event indexing pipeline | Off by default (`KAFKA_BROKER=disabled`); the `kafka` compose profile must also be started |
| `LOG_LEVEL` | Logging verbosity | Defaults are fine |

## Frontend — essential variables

`.vault-envs/frontend.env` holds the browser-facing values. `NEXT_PUBLIC_*` vars
are baked into the client bundle at `next build` time via `ARG`/`ENV` in the
Dockerfile, sourced from `docker-compose.yml` `args:` interpolation (which
reads them from root `.env`, which vault-init populates).

| Bundled variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Browser-reachable frontend origin |
| `NEXT_PUBLIC_REALTIME_WS_URL` | Single realtime WebSocket endpoint on the backend |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Must match backend's `VAPID_PUBLIC_KEY` — same keypair, both sides |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key |

**Important:** because these are inlined at image build time (not read at
container start), changing any of them requires a rebuild:
`docker compose up -d --build nextjs`.

## How to produce the generated variables

| Variable | Command | Notes |
| --- | --- | --- |
| `JWT_SECRET` | `openssl rand -hex 32` | |
| `TOKEN_DERIVATION_SECRET` | `openssl rand -hex 32` | Can reuse `JWT_SECRET`'s value in a pinch (code falls back to it) |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` | Produces 64 hex chars = 32 bytes, required for AES-256-GCM |
| `COOKIE_SECRET` | `openssl rand -hex 32` | |
| `CSRF_SECRET` | `openssl rand -hex 32` | |
| `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` | Prints both keys together — keep them as a pair |
| Database/MinIO/RabbitMQ passwords | `openssl rand -base64 24` | Plain credentials, not derived keys |

Rotating any of `JWT_SECRET` / `TOKEN_DERIVATION_SECRET` / `COOKIE_SECRET` /
`CSRF_SECRET` invalidates every currently-issued session/cookie/CSRF token —
all logged-in users get signed out the moment the `app` container picks up the
new value. Plan rotations accordingly.
