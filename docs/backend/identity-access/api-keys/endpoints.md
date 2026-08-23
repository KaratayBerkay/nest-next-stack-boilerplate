# API Keys — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/api-keys/`](../../../../nest-js-boilerplate/src/api-keys/)

No REST controller — this module is GraphQL-only. (`ApiKeyGuard` itself intercepts REST/GraphQL
requests *elsewhere* in the API that carry a `bp_...` bearer token; it has no route of its own.)

## GraphQL

Resolver: [`api-keys.resolver.ts`](../../../../nest-js-boilerplate/src/api-keys/api-keys.resolver.ts) ·
**Auth:** `@UseGuards(ApiKeyGuard, SessionAuthGuard)` on the whole class — see
[README.md § guard ordering](./README.md#apikeyguard--sessionauthguard--deliberate-guard-ordering).
Every entry acts on `@CurrentUser()`'s own keys. A 401 applies to all four and isn't repeated per
entry.

### List my API keys

**Kind:** GraphQL Query · **`myApiKeys: [ApiKeyType!]!`**
**Source:** [`api-keys.resolver.ts#L15-18`](../../../../nest-js-boilerplate/src/api-keys/api-keys.resolver.ts),
type [`api-keys.types.ts`](../../../../nest-js-boilerplate/src/api-keys/api-keys.types.ts)
**Response (`ApiKeyType`):** `{ id, name, keyPrefix, createdAt, lastUsedAt?, expiresAt?, enabled,
role, tier }` — never the full key or its hash. Ordered newest-first, soft-deleted keys excluded.
**Used by:** Frontend [settings/api-keys](../../../frontend/v1/settings/api-keys/page.md) via
[api.md § List my API keys](../../../frontend/v1/settings/api-keys/api.md#list-my-api-keys-bff-route); Mobile
[settings/api-keys screen](../../../mobile/v1/settings/api-keys/screen.md).

### Create an API key

**Kind:** GraphQL Mutation · **`createApiKey(name: String!, expiresInDays: Int): ApiKeyCreateResult!`**
**Source:** [`api-keys.resolver.ts#L20-32`](../../../../nest-js-boilerplate/src/api-keys/api-keys.resolver.ts)
**Response (`ApiKeyCreateResult`):** `{ fullKey, key: ApiKeyType }` — `fullKey` (the `bp_...` secret)
is present **only in this one response**; it is never retrievable again after this call returns.
**Errors:** `409 EX_API_KEY_NAME_EXISTS` — a non-deleted key with the same name already exists for
this user.
**Used by:** same as [List my API keys](#list-my-api-keys) — the create-key form.

### Revoke an API key

**Kind:** GraphQL Mutation · **`revokeApiKey(id: String!): Boolean!`**
**Source:** [`api-keys.resolver.ts#L34-41`](../../../../nest-js-boilerplate/src/api-keys/api-keys.resolver.ts)
**Behavior:** soft-delete (`enabled: false`, `deletedAt: now()`) — ownership-checked
(`key.userId !== userId` → `404`, indistinguishable from a nonexistent id, deliberately not leaking
existence of another user's key).
**Errors:** `404 EX_API_KEY_NOT_FOUND`.
**Used by:** same page — the "Revoke" action per key.

### Update an API key

**Kind:** GraphQL Mutation · **`updateApiKey(id: String!, name: String, enabled: Boolean):
ApiKeyType!`**
**Source:** [`api-keys.resolver.ts#L43-52`](../../../../nest-js-boilerplate/src/api-keys/api-keys.resolver.ts)
**Behavior:** partial update — only the fields actually passed are changed. Same ownership check as
revoke.
**Errors:** `404 EX_API_KEY_NOT_FOUND`.
**Used by:** ⚠ **nobody, on either platform** — see
[README.md § Known issues](./README.md#known-issues) ([CROSS-012](../../../issues.md#cross-012)).
Web has a complete BFF proxy for it (`PATCH /api/api-keys/[id]`) with no caller above it; mobile has no
trace of it at all.
