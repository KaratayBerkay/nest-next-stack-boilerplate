# Local development prerequisites

To run `pnpm test` / `pnpm test:e2e` outside of Docker, the following environment
variables must point at localhost (or your local infra) instead of compose service
names:

```env
# PostgreSQL (default: compose service name "postgres")
DATABASE_URL=postgresql://nest:nest@localhost:5433/nest?schema=public

# Redis (default: compose service name "redis")
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# Auth secrets (generate with: openssl rand -hex 32)
JWT_SECRET=change-me-dev-only-jwt-secret
TOKEN_DERIVATION_SECRET=change-me-dev-only-jwt-secret
ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000

# Cookie / CSRF
COOKIE_SECRET=change-me-dev-only-cookie-secret
CSRF_SECRET=change-me-dev-only-csrf-secret

# Optional: prevent IP-strict errors when your IP changes between requests
AUTH_IP_STRICT=false
```

With these set, `pnpm test` (unit) and `pnpm test:e2e` (integration) should run.
Infra-shaped failures (Postgres/Redis unreachable) are still expected if those
services aren't running locally — environment-shaped failures (missing vars)
will not occur.
