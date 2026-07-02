# Auth flow — Redis-backed sessions (layered tokens + tier RBAC)

> Implemented in phase 2 ([tracker](../progress/phase2.md)). Goal: a guarded request
> never touches Postgres — one Redis lookup resolves identity + authorization, and any
> session is revocable instantly.

## The token triple

Every login/register issues three tokens:

| Token | Kind | Lifetime | Delivery |
|---|---|---|---|
| `accessToken` | JWT (HS256) | 15m (`JWT_ACCESS_TTL`) | `Authorization: Bearer` or `access_token` / `__Secure-access_token` cookie |
| `rbacToken` | opaque random | 15m (mirrors access) | httpOnly cookie `rbac_token` / `__Secure-rbac_token`, or `x-rbac-token` header |
| `deviceToken` | opaque random | 1y | httpOnly cookie `device` / `__Secure-device`, or `x-device-token` header |

All three are also returned in the GraphQL `AuthPayload` body so API-only clients (and
the Next.js BFF, which re-issues them as its own httpOnly cookies) can use the header
fallbacks. Cookie names get the `__Secure-` prefix when `NODE_ENV=production`.

## Compound session key

On issue, the backend writes one Redis HASH under:

```
sess:{sha256(accessToken)}:{sha256(rbacToken)}:{sha256(deviceToken)}
```

- **Hashes, never raw tokens** — Redis contents (SCAN, monitoring, backups) are not
  usable as bearer credentials.
- Value: `userId`, `email`, `role`, `tier`, `deviceId`, `ip`, `userAgent`, `issuedAt`,
  `sessionId` (FK to the Postgres `Session` row).
- TTL = `JWT_ACCESS_TTL` (900s default) — entries self-expire in lockstep with the JWT,
  no cleanup job. **Changing `JWT_ACCESS_TTL` changes the Redis TTL too.**
- Reverse index `user:{userId}:sessions` (SET of live compound keys) enables
  logout-all, admin revocation, and in-place tier rewrites.

`SessionAuthGuard` (`src/auth/session-auth.guard.ts`) validates in order: JWT
signature/expiry (no I/O) → build compound key from the three presented tokens →
HGETALL → `payload.sub === hash.userId` sanity → attach
`req.user = { userId, email, role, tier }`. The `me` query is served entirely from
this snapshot (zero Prisma queries).

## Revocation semantics

- **Tamper any one token** → different compound key → miss → 401.
- **`redis-cli DEL <key>`** (or `TokenStoreService.revoke`) → next request 401s
  immediately; the client recovers via `refresh`.
- **`refresh`** revokes the presented compound key, then re-issues all three tokens
  (Postgres `Session` row rotates as before — it stays the 30d durable anchor).
- **`logout`** revokes the compound key + reverse-index entry alongside the Session
  delete.
- **Redis unreachable** → fail closed: guarded routes return 503, `/health/ready`
  degrades. Sessions survive a Redis restart (AOF persistence).
- **IP mismatch** vs the stored `ip` is tolerated by default (mobile/NAT churn);
  set `AUTH_IP_STRICT=true` to hard-reject with 401.

## Subscription-tier RBAC

`User.subscriptionTier` (`FREE | BASIC | MEDIUM | PREMIUM`, default `FREE`) is an
ordered hierarchy orthogonal to `UserRole`. Gate resolvers with:

```ts
@UseGuards(SessionAuthGuard, TierGuard)
@MinTier(SubscriptionTier.BASIC)
```

The guard reads the tier from **Redis, not the JWT**, so the admin mutation
`setUserTier(userId, tier)` (ADMIN/SUPERADMIN) updates Postgres **and** rewrites all
live sessions via the reverse index — an upgrade or downgrade applies on the target
user's next request, no re-login. `premiumStats` is the demo gated query.

## Known gap (phase 3)

The BFF's cookie-driven `refresh`/`logout` against a production-mode backend has never
worked: the BFF forwards unprefixed cookie names and doesn't echo the CSRF
double-submit token (`GET /csrf/token` → `x-csrf-token`). Guarded queries work because
`graphqlFetch` sends the `x-rbac-token`/`x-device-token` header fallbacks. The
cross-stack e2e suite (phase 3) covers fixing and locking down that flow.
