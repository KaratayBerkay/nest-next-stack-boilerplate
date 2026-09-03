# Sessions — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/sessions/`](../../../../nest-js-boilerplate/src/sessions/)

No REST controller — this module is GraphQL-only.

## GraphQL

Resolver: [`sessions.resolver.ts`](../../../../nest-js-boilerplate/src/sessions/sessions.resolver.ts) ·
**Auth:** `SessionAuthGuard` on the whole resolver class (see
[identity-access/auth](../auth/README.md)); every entry acts on `@CurrentUser()`'s own sessions. A 401
(guard rejection) applies to all four and isn't repeated per entry.

### List my sessions

**Kind:** GraphQL Query · **`mySessions: [SessionInfo!]!`**
**Source:** [`sessions.resolver.ts#L79-107`](../../../../nest-js-boilerplate/src/sessions/sessions.resolver.ts)
**Response (`SessionInfo`):** `{ sessionId, deviceId, ip?, userAgent?, issuedAt?, deviceType?,
trusted? }`. `sessionId` is a one-way hash, not the raw credential — see
[README.md](./README.md#sessionid-is-hashed-not-encrypted). `deviceType`/`trusted` are enrichment from
a best-effort `Device` lookup (`Prisma.device.findMany`) — a device-lookup failure is logged and
swallowed, never fails the whole list (source comment: "F9").
**Used by:** Frontend [settings/sessions](../../../frontend/v1/settings/sessions/page.md) via
[api.md § List my sessions](../../../frontend/v1/settings/sessions/api.md#list-my-sessions-bff-route); Mobile
[settings/sessions screen](../../../mobile/v1/settings/sessions/screen.md).

### Revoke a session

**Kind:** GraphQL Mutation · **`revokeSession(sessionId: ID!): Boolean!`**
**Source:** [`sessions.resolver.ts#L109-123`](../../../../nest-js-boilerplate/src/sessions/sessions.resolver.ts)
**Request:** the *hashed* `sessionId` from a `mySessions` row, not a raw token.
**Behavior:** `TokenStoreService.revokeSessionBySessionId` deletes the matching Redis session key; on
success also `RealtimeGateway.closeSocketsForSession` (any open WebSocket tied to that session is
force-closed, not just left to fail its next HTTP call).
**Response:** `true` if a session was found and revoked, `false` otherwise (no error thrown for an
already-gone session — idempotent from the caller's perspective).
**Used by:** same as [List my sessions](#list-my-sessions) — the "Revoke" action per row.

### Revoke all other sessions

**Kind:** GraphQL Mutation · **`revokeAllOtherSessions: Boolean!`**
**Source:** [`sessions.resolver.ts#L125-138`](../../../../nest-js-boilerplate/src/sessions/sessions.resolver.ts)
**Behavior:** lists all sessions, filters out the *caller's own current* `sessionId`
(`user.sessionId`, from the guard-attached JWT claims — not the hashed id), revokes + force-closes
sockets for every remaining one in parallel (`Promise.all`).
**Response:** `false` if there were no other sessions to revoke (current session is the only one),
`true` otherwise.
**Used by:** same page — the "Log out all other sessions" action.

### Trust the current device

**Kind:** GraphQL Mutation · **`trustCurrentDevice: Boolean!`**
**Source:** [`sessions.resolver.ts#L140-152`](../../../../nest-js-boilerplate/src/sessions/sessions.resolver.ts)
**Behavior:** step-up first (`BE-030`, resolved 2026-09-03): the mutation consumes the one-shot
Redis marker (`mfa:fresh:<hash(sessionId)>`, 5-minute TTL) that `verifyLoginMfa`'s token issuance
leaves behind — i.e. it only works for a session that passed the second factor moments ago, which
is exactly the login-flow follow-up both clients make. Any other session (including a hijacked one)
gets `403 EX_AUTH_MFA_STEP_UP_REQUIRED` (`auth.errors.mfaStepUpRequired`); before this, plain
`SessionAuthGuard` was the only gate, so any authenticated session could quietly mark its device
trusted and skip MFA on every future login. Then finds the `Device` row backing the caller's
*current* session (matched by `session.sessionId === user.sessionId`) and sets `trusted: true`.
Returns `false` if the current session has no associated `deviceId` (shouldn't normally happen
post-login, but not asserted).
**Used by:** ⚠ **not** the sessions settings page on either platform — the login MFA-challenge "remember
this device" flow only. See
[README.md § `trustCurrentDevice`](./README.md#trustcurrentdevice--a-sessions-module-mutation-with-an-auth-flow-only-caller)
for the full explanation and exact call sites.
