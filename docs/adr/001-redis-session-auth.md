# ADR 001: Redis-backed session authentication with compound key

**Status:** Accepted (implemented Phases 2-3, revised in enhancements1)

## Context

The boilerplate needs an authentication system that supports:
- Instant session revocation (no waiting for JWT expiry)
- Tier-based RBAC (FREE/BASIC/MEDIUM/PREMIUM)
- Multi-device session management
- Fail-closed behavior when Redis is unreachable
- Zero Postgres reads on the hot path

Traditional JWT-only auth can't revoke individual sessions. Traditional session stores
(Postgres `sessions` table) add a query per guarded request. This system uses a hybrid
approach: short-lived JWTs for stateless verification + Redis for session state.

## Decision

Use a **four-token compound key** stored in Redis:

- `accessToken` — JWT (HS256, 15min TTL) for stateless verification
- `refreshToken` — opaque, Postgres-backed (30d TTL) for session renewal
- `rbacToken` — opaque (15min, mirrors access) for tier authorization
- `deviceToken` — opaque (1y) for device binding and rotation detection
- `userToken` — opaque (15min, non-httpOnly) for WebSocket auth

All four are combined into a single Redis HASH key:
```
sess:{sha256(access)}:{deriveRbac(rbac)}:{sha256(device)}:{deriveUser(user)}
```

The RBAC and user token derivations are **date-bound** (HMAC-SHA256 with today's date),
forcing a daily midnight cutoff that requires a silent refresh — preventing long-lived
stale sessions.

## Consequences

- **Positive:** Instant revocation (delete the Redis key), tier changes propagate
  within 15min, device clamping at any granularity
- **Positive:** Session hydration happens once at login — subsequent requests read
  from Redis with zero Postgres queries
- **Negative:** Redis is a single point of failure (mitigated by fail-closed 503,
  AOF persistence, and the refresh-fallback path)
- **Negative:** Four-token protocol is complex — the BFF bridge must forward all four
  as headers, and every WebSocket client must present all four on connect
- **Negative:** Full session invalidation on deploy of the compound-key format
  (breaking change documented in AUTH.md)

## When to deviate

- For a single-server app with <100 users, plain JWT with a blocklist is simpler
- For an API-only service (no browser), drop the cookie ceremony and use Bearer tokens
- For an app that never needs revocation, drop Redis entirely and use long-lived JWTs
