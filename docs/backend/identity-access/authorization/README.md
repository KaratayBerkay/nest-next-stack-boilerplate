# Authorization (backend)

**Source:** [`nest-js-boilerplate/src/authorization/`](../../../../nest-js-boilerplate/src/authorization/) ·
**Category:** [Identity & Access](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

Not a settings-facing "auth preferences" module — this is the RBAC/tier-guard **infrastructure**
(`@Roles()`/`RolesGuard`, `@MinTier()`/`TierGuard`, `TIER_RANK`) plus two GraphQL resolvers that are
genuinely **admin tooling**: user tier/status management and audit-log browsing. Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly (not
demo-gated), even though several of its own queries are explicitly self-described as demonstrations
(see below). See
[`authorization.module.ts`](../../../../nest-js-boilerplate/src/authorization/authorization.module.ts),
whose own doc comment states the intent plainly: *"RBAC (role-based access control) from the
Authorization docs: a `@Roles()` decorator plus a `RolesGuard`... Additionally, tier-based access via
`@MinTier()` + `TierGuard`."*

| File | Owns |
|---|---|
| [`roles.decorator.ts`](../../../../nest-js-boilerplate/src/authorization/roles.decorator.ts), [`roles.guard.ts`](../../../../nest-js-boilerplate/src/authorization/roles.guard.ts) | `@Roles(...UserRole[])` metadata + the guard that reads it via `Reflector` and compares to `req.user.role`. No `@Roles()` on a handler/class = open to any authenticated user. |
| [`min-tier.decorator.ts`](../../../../nest-js-boilerplate/src/authorization/min-tier.decorator.ts), [`tier.guard.ts`](../../../../nest-js-boilerplate/src/authorization/tier.guard.ts), [`tier-rank.ts`](../../../../nest-js-boilerplate/src/authorization/tier-rank.ts) | `@MinTier(SubscriptionTier)` metadata + the guard comparing `TIER_RANK[req.user.tier]` against the required rank. `TIER_RANK` is the single source of truth for tier ordering (`FREE=0 < BASIC=1 < MEDIUM=2 < PREMIUM=3`), also re-exported as `MIN_TIER_FOR_VIP` and consumed by [messaging](../../messaging-realtime/messaging/README.md)'s room-tier gate. |
| [`admin.resolver.ts`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts) | 7 GraphQL operations, a mix of real admin actions and pipeline demos — see below. |
| [`audit-log.resolver.ts`](../../../../nest-js-boilerplate/src/authorization/audit-log.resolver.ts) | `auditLogs`/`auditLogCount` — read access to the `AuditLog` table. |

## `AdminResolver`: demo pipeline vs. real admin actions

The class's own doc comment says it "demonstrates the RBAC pipeline" — and reading each operation's
real frontend/mobile usage (grepped across both apps, not inferred) shows a genuine three-way split:

| Operation | Real behavior | Actual UI consumer |
|---|---|---|
| `whoAmI` | returns `"{email}:{role}"`, no `@Roles()` | **none found** — explicitly a "no required roles" pipeline demo |
| `adminStats` | returns a hardcoded string, `@Roles(ADMIN, SUPERADMIN)` | **none found** — role-gate demo only |
| `premiumStats` / `growthStats` | real Postgres aggregates, `@MinTier(BASIC)` / `@MinTier(MEDIUM)` | [`v1/premium`](../../../frontend/v1/premium/page.md) page (web + [mobile](../../../mobile/v1/premium/screen.md)) |
| `setUserTier` | real: updates `subscriptionTier`, rewrites every live Redis session for that user, emits an outbox event | [`v1/admin`](../../../frontend/v1/admin/page.md) page (web + [mobile](../../../mobile/v1/admin/screen.md)) — see below |
| `setUserStatus` | real: updates `status` (e.g. ban/suspend), revokes every session + force-closes sockets | **none found on either platform** — see Known issues |
| `resetMfa` | real, `@Roles(SUPERADMIN)` only: strips a target user's MFA factors/backup codes without requiring their TOTP code | **none found on either platform** — see Known issues |

`whoAmI`/`adminStats`/`premiumStats`/`growthStats` are exactly what the class doc comment says they
are — don't read "no UI consumer" as a bug for those four, they're pedagogical fixtures analogous to
this repo's `implement-nestjs-feature` pattern of working through the NestJS docs feature-by-feature.
`setUserTier`, `setUserStatus`, and `resetMfa` are not — they mutate real user state and are gated by
real roles, which makes their consumer story (below) worth being precise about.

### `setUserTier` / `setUserStatus` / `resetMfa` in detail

- **`setUserTier`**: looks up the target, rejects if the target's role outranks the actor's (an admin
  can't touch a superadmin), writes the new tier inside a `$transaction` alongside an
  `outbox.emit(...)` audit event, then calls `tokenStore.rewriteFieldsForUser` (so every one of the
  target's *live* Redis sessions gets the new tier immediately — see
  [auth/README.md § Revocation](../auth/README.md#revocation) for why this makes tier changes
  effective without forcing a re-login) and `realtime.updateUserTier` (push notice over any open
  sockets).
- **`setUserStatus`**: same actor/target role check, updates `status`, then unconditionally
  `tokenStore.revokeAllForUser` + `realtime.closeAllSocketsForUser` — a status change (e.g. a ban)
  kills every active session and socket for that user immediately, unlike a tier change.
- **`resetMfa`**: `SUPERADMIN`-only. Delegates to
  [`MfaService.resetMfa`](../mfa/README.md#adminresolverresetmfa-vs-the-users-own-disable), which is a
  different code path from the user's own `disableMfa` (no TOTP code required — see
  [mfa/README.md](../mfa/README.md)).

All three write an audit trail via `this.outbox.emit({...}, tx)` **inside** the same `$transaction`
as the domain write — the [transactional outbox pattern](../../../architecture.md#transactional-outbox--reliable-event-emission),
not a direct `prisma.auditLog.create()` call. ⚠ See [Known issues](#known-issues) — the resolver also
contains a private `createAuditLog` method that bypasses this pattern entirely and is never called.

## Used by

| App | Page / Screen | Which operations |
|---|---|---|
| Frontend | [`views/admin/PageContent.tsx`](../../../../next-js-boilerplate/src/views/admin/PageContent.tsx), [`views/admin/audit-logs/PageContent.tsx`](../../../../next-js-boilerplate/src/views/admin/audit-logs/PageContent.tsx) — route `v1/admin`, `v1/admin/audit-logs` | `setUserTier`, `auditLogs`, `auditLogCount` |
| Mobile | [`views/admin/page_view.dart`](../../../../flutter-boilerplate/lib/views/admin/page_view.dart), [`views/admin/audit_logs/page_view.dart`](../../../../flutter-boilerplate/lib/views/admin/audit_logs/page_view.dart) | same three |

The `/admin` vertical is fully documented on both platforms — see
[`v1/admin/page.md`](../../../frontend/v1/admin/page.md) and
[`v1/admin/screen.md`](../../../mobile/v1/admin/screen.md) for the actual consumer detail (including
each platform's admin-role gate, and the `CROSS-039` (resolved — fixed 2026-09-03: web now checks the admin role server-side too (Next `admin/layout.tsx`, TanStack route loader data) and denies before rendering; the in-component check stays as defense in depth) client-side/router-level
enforcement gap between them). This module's own docs happened to land ahead of the page docs that
consume it, same relationship as [`csrf`](../csrf/README.md) or
[`wire-crypto`](../../messaging-realtime/wire-crypto/README.md) being documented before every page
that indirectly depends on them.

`premiumStats`/`growthStats` are consumed by
[`v1/premium`](../../../frontend/v1/premium/page.md) (billing-usage territory):
[`views/premium/GrowthStatsSection.tsx`](../../../../next-js-boilerplate/src/views/premium/GrowthStatsSection.tsx).

## Depends on

`AuthModule` (guards chain on `SessionAuthGuard`), `RealtimeModule` (`setUserTier`/`setUserStatus`
push live socket updates), `MfaModule` (`resetMfa` delegates to `MfaService`). Exports `RolesGuard`
and `TierGuard` for any other module to compose (`RolesGuard`/`TierGuard` are the general-purpose
primitives; `admin.resolver.ts`/`audit-log.resolver.ts` are this module's own consumers of them, not
its raison d'être).

## Known issues

- ⚠ **Dead code**: `AdminResolver.createAuditLog()`
  ([`admin.resolver.ts#L105-123`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts))
  is a byte-for-byte duplicate of
  [`AuditLogProcessor.createAuditLog()`](../../../../nest-js-boilerplate/src/outbox/audit-log.processor.ts#L53-71)
  (same `P2003`-retry-with-null-actor logic, same log message) — but nothing in `admin.resolver.ts`
  ever calls it; every real mutation in the file correctly uses `outbox.emit()` instead. Logged as
  `BE-006` (resolved).
- ⚠ **`setUserStatus` has no UI on either platform** — confirmed via `grep -rn "setUserStatus"`
  across both `next-js-boilerplate/src` and `flutter-boilerplate/lib`: zero matches outside the
  resolver itself. A real, working, role-gated ban/suspend mutation with nothing to trigger it. Logged
  as `BE-007` (resolved).
- ⚠ **`resetMfa` has no UI on either platform** — same check, same result. (Flutter's
  `_resetMfa()` in `views/auth/login/page_content.dart` is an unrelated local function that clears
  local MFA-challenge form state during login — a naming coincidence confirmed by reading it, not a
  caller of this mutation.) Logged as `BE-007` (resolved) alongside `setUserStatus`.
