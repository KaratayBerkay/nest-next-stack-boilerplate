# Authorization — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/authorization/`](../../../../nest-js-boilerplate/src/authorization/)

No REST controller — this module is GraphQL-only.

## GraphQL

Resolvers: [`admin.resolver.ts`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts),
[`audit-log.resolver.ts`](../../../../nest-js-boilerplate/src/authorization/audit-log.resolver.ts).
**Auth:** `SessionAuthGuard` on both resolver classes (see
[identity-access/auth](../auth/README.md)) — every entry below additionally needs the specific
`@Roles()`/`@MinTier()` gate listed per entry; a 401 (guard rejection, no session) applies to all of
them and isn't repeated per entry.

### Who am I

**Kind:** GraphQL Query · **`whoAmI: String!`**
**Source:** [`admin.resolver.ts#L125-128`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts)
**Auth:** any authenticated user — no `@Roles()`, deliberately demonstrating the "no required roles"
path through `RolesGuard`.
**Response:** `"{email}:{role}"`, plain string.
**Used by:** no caller found on either platform — demo fixture, not a bug (see
[README.md](./README.md#adminresolver-demo-pipeline-vs-real-admin-actions)).

### Admin stats (demo)

**Kind:** GraphQL Query · **`adminStats: String!`**
**Source:** [`admin.resolver.ts#L130-134`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts)
**Auth:** `@Roles(ADMIN, SUPERADMIN)`.
**Response:** the literal string `"top-secret-admin-stats"`.
**Used by:** no caller found on either platform — role-gate demo fixture, not a bug.

### Set a user's tier

**Kind:** GraphQL Mutation · **`setUserTier(userId: String!, tier: SubscriptionTier!): Boolean!`**
**Source:** [`admin.resolver.ts#L136-172`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts)
**Auth:** `@Roles(ADMIN, SUPERADMIN)`.
**Behavior:** no-ops (`return false`) if the target doesn't exist or outranks the actor
(`isTargetRoleGteActor`) — an admin cannot re-tier a superadmin. On success: updates
`user.subscriptionTier` + emits an outbox audit event inside one `$transaction`, then
`tokenStore.rewriteFieldsForUser` (every live Redis session for that user gets the new tier without
re-login) and `realtime.updateUserTier` (live socket push).
**Errors:** none thrown — invalid target silently returns `false` rather than a GraphQL error.
**Used by:** Frontend [`views/admin/PageContent.tsx`](../../../../next-js-boilerplate/src/views/admin/PageContent.tsx)
via `POST /api/admin/set-tier` (web-only BFF route, `SET_USER_TIER_MUTATION`); Mobile
[`api/server/admin/set_tier.dart`](../../../../flutter-boilerplate/lib/api/server/admin/set_tier.dart)
(direct GraphQL). Both back the [`v1/admin`](../../../frontend/v1/admin/page.md)
page/[screen](../../../mobile/v1/admin/screen.md) (see [README.md § Used by](./README.md#used-by)).

### Set a user's status

**Kind:** GraphQL Mutation · **`setUserStatus(userId: String!, status: UserStatus!, reason: String):
Boolean!`**
**Source:** [`admin.resolver.ts#L174-204`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts)
**Auth:** `@Roles(ADMIN, SUPERADMIN)`.
**Behavior:** same target/actor role check as `setUserTier`. On success: updates `user.status`, emits
an outbox audit event (includes `reason` in the summary if provided), then unconditionally
`tokenStore.revokeAllForUser` + `realtime.closeAllSocketsForUser` — every session and socket for that
user is killed immediately, not just updated.
**Errors:** none thrown — invalid target silently returns `false`.
**Used by:** ⚠ **nobody** — see [README.md § Known issues](./README.md#known-issues)
([BE-007](../../../issues.md#be-007)).

### Premium stats (demo tier gate)

**Kind:** GraphQL Query · **`premiumStats: PremiumStatsPayload!`**
**Source:** [`admin.resolver.ts#L206-216`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts)
**Auth:** `SessionAuthGuard` + `TierGuard`, `@MinTier(BASIC)`.
**Response:** `{ totalUsers, activeUsers, revenue }` — real Postgres counts, `revenue` is a fabricated
`totalUsers * 9.99`.
**Used by:** [`v1/premium`](../../../frontend/v1/premium/page.md) (billing-usage territory):
[`views/premium/PremiumPageView.tsx`](../../../../next-js-boilerplate/src/views/premium/PremiumPageView.tsx).
Mobile: [`v1/premium`](../../../mobile/v1/premium/screen.md)'s live `page_view.dart`
(`premiumStatsProvider`) — see that screen's own known-issues for the dead-parallel-implementation
caveat ([MOB-022](../../../issues.md#mob-022)) affecting the other four tier-view files.

### Growth stats (demo tier gate)

**Kind:** GraphQL Query · **`growthStats: GrowthStatsPayload!`**
**Source:** [`admin.resolver.ts#L218-233`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts)
**Auth:** `SessionAuthGuard` + `TierGuard`, `@MinTier(MEDIUM)`.
**Response:** `{ totalUsers, newUsersLast7Days, totalPosts, totalFriendships }` — real Postgres
aggregates (posts filtered `deletedAt: null`, friendships filtered `status: ACCEPTED`).
**Used by:** [`v1/premium`](../../../frontend/v1/premium/page.md):
[`views/premium/GrowthStatsSection.tsx`](../../../../next-js-boilerplate/src/views/premium/GrowthStatsSection.tsx),
[`api/server/premium/growth-stats.ts`](../../../../next-js-boilerplate/src/api/server/premium/growth-stats.ts).
Mobile: [`v1/premium`](../../../mobile/v1/premium/screen.md)'s live `page_view.dart`
(`growthStatsProvider`), same [MOB-022](../../../issues.md#mob-022) caveat as
[Premium stats](#premium-stats-demo-tier-gate) above.

### Reset a user's MFA

**Kind:** GraphQL Mutation · **`resetMfa(userId: String!): Boolean!`**
**Source:** [`admin.resolver.ts#L235-261`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts)
**Auth:** `@Roles(SUPERADMIN)` — the only `SUPERADMIN`-only entry in this module.
**Behavior:** target/actor role check, then delegates to
[`MfaService.resetMfa`](../mfa/README.md#adminresolverresetmfa-vs-the-users-own-disable) (strips MFA factors
+ backup codes, **no TOTP code required** — contrast with the user's own `disableMfa`). Returns
`false` without emitting anything if the target didn't have MFA enabled. On success: emits an outbox
audit event and `tokenStore.revokeAllForUser` (every session for that user is force-logged-out, since
their auth posture just changed).
**Used by:** ⚠ **nobody** — see [README.md § Known issues](./README.md#known-issues)
([BE-007](../../../issues.md#be-007)).

### List audit logs

**Kind:** GraphQL Query · **`auditLogs(where: AuditLogWhereInput, orderBy:
[AuditLogOrderByWithRelationInput!], take: Int, skip: Int): [AuditLog!]!`**
**Source:** [`audit-log.resolver.ts#L17-36`](../../../../nest-js-boilerplate/src/authorization/audit-log.resolver.ts)
**Auth:** `@Roles(ADMIN, SUPERADMIN)`.
**Response:** raw `AuditLog` rows (generated Prisma GraphQL type — see
[`schema.prisma`](../../../../nest-js-boilerplate/prisma/schema.prisma)'s `AuditLog` model), `actor`
relation included. `take` capped at 100 (default 50 if omitted), default order `createdAt desc`.
**Used by:** Frontend [`views/admin/audit-logs/PageContent.tsx`](../../../../next-js-boilerplate/src/views/admin/audit-logs/PageContent.tsx)
via `GET /api/admin/audit-logs`; Mobile
[`api/server/admin/audit_logs.dart`](../../../../flutter-boilerplate/lib/api/server/admin/audit_logs.dart).
Both back [`v1/admin/audit-logs`](../../../frontend/v1/admin/audit-logs/page.md)
(and [mobile](../../../mobile/v1/admin/audit-logs/screen.md)).

### Count audit logs

**Kind:** GraphQL Query · **`auditLogCount(where: AuditLogWhereInput): Int!`**
**Source:** [`audit-log.resolver.ts#L38-44`](../../../../nest-js-boilerplate/src/authorization/audit-log.resolver.ts)
**Auth:** `@Roles(ADMIN, SUPERADMIN)`.
**Used by:** same as [List audit logs](#list-audit-logs) — pagination total.

## Where the audit trail actually lands

`setUserTier`/`setUserStatus`/`resetMfa` don't write `AuditLog` rows directly — they call
`this.outbox.emit({aggregateType, aggregateId, eventType, action, actorId, summary, before, after},
tx)` inside the same `$transaction` as the domain write (the
[transactional outbox pattern](../../../architecture.md#transactional-outbox--reliable-event-emission)).
A background worker,
[`AuditLogProcessor`](../../../../nest-js-boilerplate/src/outbox/audit-log.processor.ts), later
relays each `OutboxEvent` into a real `AuditLog` row (`aggregateType`→`entityType`,
`aggregateId`→`entityId`) and exports it to Elasticsearch. Full detail on the outbox/relay mechanism
itself belongs to [`platform-core/outbox`](../../platform-core/outbox/README.md) — not duplicated
here.
