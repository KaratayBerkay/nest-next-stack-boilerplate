# API Keys (backend)

**Source:** [`nest-js-boilerplate/src/api-keys/`](../../../../nest-js-boilerplate/src/api-keys/) ·
**Category:** [Identity & Access](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

Long-lived, user-issued bearer credentials (`bp_<64-hex-chars>`) for programmatic API access —
create/list/revoke/rename, plus the guard that authenticates *incoming* requests carrying one. Wired
into `app.module.ts`'s `CORE_MODULES` directly. See
[`api-keys.module.ts`](../../../../nest-js-boilerplate/src/api-keys/api-keys.module.ts).

## Key lifecycle

- **Generate**: `randomBytes(32).toString('hex')` prefixed `bp_` (`ApiKeysService.generate`,
  [`api-keys.service.ts#L33-74`](../../../../nest-js-boilerplate/src/api-keys/api-keys.service.ts)).
  Only the first 8 characters (`keyPrefix`) and an Argon2 hash (`@node-rs/argon2`) of the full key are
  stored — **the full key is returned exactly once**, at creation, never again. Snapshots the caller's
  `role`/`tier` at creation time and an optional `expiresInDays` → `expiresAt`. Rejects a duplicate
  *name* for the same user (`409 EX_API_KEY_NAME_EXISTS`) — names, not keys, are the uniqueness
  constraint from the user's point of view.
- **Validate** (`ApiKeysService.validate`, used only by `ApiKeyGuard` below): looks up **all**
  enabled, non-expired, non-deleted keys sharing the presented key's 8-char prefix, then Argon2-verifies
  each candidate against the full key — a prefix isn't a lookup key on its own (multiple keys can share
  one), it's a fast pre-filter before the slow hash comparison. On match, re-reads the key owner's
  **live** `role`/`subscriptionTier` from Postgres (not the snapshot taken at creation) so a since-
  changed role/tier takes effect on the very next API-key call, and stamps `lastUsedAt`.
- **Revoke**: soft-delete (`enabled: false`, `deletedAt: now()`) — the row and its usage history
  survive, the key itself stops validating.
- **Update**: rename and/or toggle `enabled` — the only two mutable fields.

## `ApiKeyGuard` + `SessionAuthGuard` — deliberate guard ordering

Every resolver method is decorated `@UseGuards(ApiKeyGuard, SessionAuthGuard)` — **`ApiKeyGuard`
first**, and this order matters: it inspects `Authorization: Bearer bp_...` specifically. If the
header doesn't start with that prefix, it returns `true` unconditionally (not an API-key request, fall
through). If it does and validates, it manually attaches `req.user` and sets
`req._authenticatedByApiKey = true`; if it doesn't validate, it throws `401 EX_API_KEY_INVALID`
immediately, never reaching `SessionAuthGuard`. `SessionAuthGuard.canActivate()` explicitly checks that
same flag first
([`session-auth.guard.ts#L75-78`](../../../../nest-js-boilerplate/src/auth/session-auth.guard.ts)) and
short-circuits to `true`, skipping its own JWT/Redis session validation entirely — so a `bp_...` bearer
token authenticates through a completely different path than the cookie/JWT session model documented
in [identity-access/auth](../auth/README.md), sharing only the final `req.user` shape.

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| GraphQL resolver | [`api-keys.resolver.ts`](../../../../nest-js-boilerplate/src/api-keys/api-keys.resolver.ts) | [endpoints.md](./endpoints.md) |

## Depends on

`AuthModule` (`SessionAuthGuard`, for the *management* endpoints below — a caller managing their own
keys still authenticates the normal cookie/session way, `ApiKeyGuard` is for consumers of the issued
keys elsewhere in the API, not for this resolver's own callers in practice). Exports `ApiKeysService`
and `ApiKeyGuard` for any other module wanting to accept `bp_...` bearer auth.

## Used by

| App | Page / Screen | Calls |
|---|---|---|
| Frontend | [settings/api-keys](../../../frontend/v1/settings/api-keys/page.md) | `myApiKeys`, `createApiKey`, `revokeApiKey` |
| Mobile | [settings/api-keys](../../../mobile/v1/settings/api-keys/screen.md) | same three |

`updateApiKey` has a complete backend implementation and (on web) a complete BFF proxy
(`PATCH /api/api-keys/[id]`) — but **no caller on either platform**. See
[Known issues](#known-issues).

## Known issues

- ⚠ **`updateApiKey` (rename / enable-disable a key) is fully wired backend + BFF, dead from the UI
  down, on both platforms.** Web: `app/api/api-keys/[id]/route.ts`'s `PATCH` handler calls
  `UPDATE_API_KEY_MUTATION` correctly, but `api/client/api-keys/actions.ts`'s `useApiKeyActions()`
  exposes only `createApiKey`/`revokeApiKey` — no `api/server/api-keys/update.ts` file exists at all,
  and `grep -rn "updateApiKey" next-js-boilerplate/src` outside the route/GraphQL-string files returns
  nothing. Mobile: `grep -rn "updateApiKey" flutter-boilerplate/lib` returns **zero** matches anywhere
  — not even a BFF-equivalent stub, since mobile calls GraphQL directly. Logged as
  [CROSS-012](../../../issues.md#cross-012).
