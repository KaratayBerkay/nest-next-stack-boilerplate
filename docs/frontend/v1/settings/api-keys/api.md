# API Keys — API

Page: [page.md](./page.md) · Client:
[`src/api/client/api-keys/`](../../../../../next-js-boilerplate/src/api/client/api-keys/) · Server
(BFF): [`src/api/server/api-keys/`](../../../../../next-js-boilerplate/src/api/server/api-keys/)

Same three-layer BFF shape as [sessions](../sessions/api.md): every route here is REST-shaped from the
browser (`GET`/`POST /api/api-keys`, `DELETE`/`PATCH /api/api-keys/[id]`) but proxies to backend
**GraphQL** underneath — confirmed by reading `app/api/api-keys/route.ts` and
`app/api/api-keys/[id]/route.ts` directly. Mutating routes call `csrfEchoHeaders()` first; the `GET`
does not.

## Client (`src/api/client/api-keys/`)

| File | Exports | Purpose |
|---|---|---|
| [`actions.ts`](../../../../../next-js-boilerplate/src/api/client/api-keys/actions.ts) | `useApiKeyActions()` → `{ createApiKey, revokeApiKey }` | thin pass-through, both lazy-`import()` their `api/server` file |
| [`query.ts`](../../../../../next-js-boilerplate/src/api/client/api-keys/query.ts) | `apiKeyListQueryOptions` | a React Query option builder — **not used by this page** (`PageContent.tsx` calls `listApiKeysServer()` directly through `api-key-handlers.ts`'s `loadApiKeys`, bypassing React Query entirely, same as [sessions](../sessions/api.md)). Unlike sessions' equivalent, this one **is** used — but only by the unrelated forms-gallery demo page (`views/forms/api-key/PageContent.tsx`, a showcase page, not this settings page) — confirmed by grep, not assumed. |

## Server / BFF routes (`src/api/server/api-keys/`)

Base URL constants: `API_KEYS_URL` (`/api/api-keys`), `API_KEYS_PREFIX` (`/api/api-keys/`) in
[`src/constants/api/urls.ts`](../../../../../next-js-boilerplate/src/constants/api/urls.ts).

### List my API keys (BFF route)

**Source:** [`list.ts`](../../../../../next-js-boilerplate/src/api/server/api-keys/list.ts) · `GET
/api/api-keys` → [`route.ts`](../../../../../next-js-boilerplate/src/app/api/api-keys/route.ts)'s
`GET` handler runs `MY_API_KEYS_QUERY`
([`lib/graphql/api-keys.ts`](../../../../../next-js-boilerplate/src/lib/graphql/api-keys.ts)) → backend
[`myApiKeys`](../../../../backend/identity-access/api-keys/endpoints.md#list-my-api-keys). Notably
**tolerant of no session**: with no access-token cookie, it returns `{ apiKeys: [] }` with a `200`
rather than a `401` — the only route in this vertical that does that (every sessions/security route
returns a modeled 401 body instead).

### Create an API key (BFF route)

**Source:** [`create.ts`](../../../../../next-js-boilerplate/src/api/server/api-keys/create.ts) ·
`POST /api/api-keys`, body `{ name, expiresInDays }` → same `route.ts`'s `POST` handler, CSRF-echoed,
runs `CREATE_API_KEY_MUTATION` → backend
[`createApiKey`](../../../../backend/identity-access/api-keys/endpoints.md#create-an-api-key).
Returns the full `{ fullKey, key }` payload with a `201`.

### Revoke an API key (BFF route)

**Source:** [`revoke.ts`](../../../../../next-js-boilerplate/src/api/server/api-keys/revoke.ts) ·
`DELETE /api/api-keys/{id}` →
[`[id]/route.ts`](../../../../../next-js-boilerplate/src/app/api/api-keys/[id]/route.ts)'s `DELETE`
handler, CSRF-echoed, runs `REVOKE_API_KEY_MUTATION` → backend
[`revokeApiKey`](../../../../backend/identity-access/api-keys/endpoints.md#revoke-an-api-key).

## `PATCH /api/api-keys/[id]` — a complete, uncalled route

The same `[id]/route.ts` also exports a `PATCH` handler wired to `UPDATE_API_KEY_MUTATION` — fully
functional, CSRF-echoed the same as `DELETE`, forwarding `{ name?, enabled? }` from the request body
straight to backend
[`updateApiKey`](../../../../backend/identity-access/api-keys/endpoints.md#update-an-api-key). No
`api/server/api-keys/update.ts` file exists to call it, and no component in this page references it.
See [page.md § Known issues](./page.md#known-issues) ([CROSS-012](../../../../issues.md#cross-012)).
