# ADR 004: Tier-based RBAC with Redis cache

**Status:** Accepted (implemented Phase 3/17)

## Context

The application has a subscription model (FREE/BASIC/MEDIUM/PREMIUM) where:
- Higher tiers unlock features (resolvers, UI sections, API rate limits)
- Tier changes should propagate instantly without forcing re-login
- Admins can set any user's tier
- The frontend needs real-time awareness of the user's tier for UI gating

The NestJS Authorization docs demonstrate role-based guards (`@Roles()`). This project
extends that with a tier hierarchy orthogonal to the role system.

## Decision

Define two orthogonal authorization axes:

1. **Role** (`USER | ADMIN | SUPERADMIN`) — who you are (admin vs regular user)
2. **Tier** (`FREE | BASIC | MEDIUM | PREMIUM`) — what you've paid for

Tier enforcement uses `@MinTier(Tier)` decorator + `TierGuard`, which reads the user's
tier from the **Redis session cache** (not the JWT). This means:
- `setUserTier()` updates Postgres + rewrites all Redis session entries via the
  reverse index (`user:{userId}:sessions`)
- The tier change takes effect on the user's **next request** — the guard reads
  the updated Redis value
- The old RBAC token derivation fails → silent 401 → auto-refresh → new tier active

Frontend tier gating is **render-only** (`TierGate` component, `useMinTier` hook) —
every gated request is enforced server-side by `TierGuard`.

## Consequences

- **Positive:** Tier changes propagate instantly across all sessions/devices
- **Positive:** No Postgres query on the guard hot path (Redis HGETALL)
- **Positive:** Hierarchical comparison (`FREE < BASIC < MEDIUM < PREMIUM`) is simple
- **Negative:** Tier is cached in Redis with access-token TTL (15min default) — after
  a downgrade, the tier is stale for up to 15min unless actively rewritten
- **Negative:** The `rewriteFieldsForUser` Redis operation is O(n) in the number of
  active sessions for that user

## When to deviate

- For a non-commercial app, remove the tier system entirely
- For a flat subscription model (free vs paid), simplify to a boolean
- For real-time billing integration (Stripe webhooks), add a webhook handler that
  calls `setUserTier` on subscription changes
