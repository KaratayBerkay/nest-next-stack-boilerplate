# Sessions — API

Page: [page.md](./page.md) · Client:
[`src/api/client/sessions/`](../../../../../next-js-boilerplate/src/api/client/sessions/) · Server
(BFF): [`src/api/server/sessions/`](../../../../../next-js-boilerplate/src/api/server/sessions/)

Same three-layer BFF shape as [messages](../../messages/api.md): browser → `api/client` hook →
`api/server/*.ts` (same-origin fetch) → `app/api/**/route.ts` (the real BFF: cookie → header/GraphQL
bridge) → NestJS backend. Confirmed by reading every `route.ts` in this vertical directly (not
inferred from one and assumed for the rest, since there are only 3).

**All three backend operations are GraphQL**, even though every BFF route here is REST-shaped from the
browser's point of view (`GET /api/sessions/list`, `POST /api/sessions/revoke`,
`POST /api/sessions/revoke-others`) — each `route.ts` converts the REST call into a `graphqlFetch(...)`
server-side. This is the same "REST-shaped from the browser, GraphQL under the hood" pattern
[api-keys/api.md](../api-keys/api.md) uses too; neither vertical has a true REST backend counterpart to
proxy to; see [sessions/endpoints.md](../../../../backend/identity-access/sessions/endpoints.md) — the
backend module is GraphQL-only.

## Client (`src/api/client/sessions/`)

| File | Exports | Purpose |
|---|---|---|
| [`actions.ts`](../../../../../next-js-boilerplate/src/api/client/sessions/actions.ts) | `useSessionActions()` → `{ revokeSession, revokeOtherSessions }` | thin pass-through, no optimistic cache patching — `FreePageView` re-fetches the list after each mutation instead |
| [`query.ts`](../../../../../next-js-boilerplate/src/api/client/sessions/query.ts) | `sessionsListQueryOptions` | a React Query option builder — defined but **not actually used** by `FreePageView`, which calls `listSessionsServer()` directly in a plain `useEffect` instead of going through this options builder or `useQuery`. Not necessarily a bug (functionally equivalent, just bypasses the React Query cache layer other pages use), noted for anyone expecting cache-sharing behavior here. |

## Server / BFF routes (`src/api/server/sessions/`)

Base URL constants: `SESSIONS_LIST_URL`, `SESSIONS_REVOKE_URL`, `SESSIONS_REVOKE_OTHERS_URL` in
[`src/constants/api/urls.ts`](../../../../../next-js-boilerplate/src/constants/api/urls.ts).

### List my sessions (BFF route)

**Source:** [`list.ts`](../../../../../next-js-boilerplate/src/api/server/sessions/list.ts) · `GET
/api/sessions/list` → [`route.ts`](../../../../../next-js-boilerplate/src/app/api/sessions/list/route.ts)
runs `query MySessions { mySessions { sessionId deviceId ip userAgent issuedAt deviceType trusted } }`
→ backend [`mySessions`](../../../../backend/identity-access/sessions/endpoints.md#list-my-sessions).
No CSRF echo (a query, not a mutation).

### Revoke a session (BFF route)

**Source:** [`revoke.ts`](../../../../../next-js-boilerplate/src/api/server/sessions/revoke.ts) ·
`POST /api/sessions/revoke`, body `{ sessionId }` →
[`route.ts`](../../../../../next-js-boilerplate/src/app/api/sessions/revoke/route.ts) runs
`mutation RevokeSession($sessionId: ID!) { revokeSession(sessionId: $sessionId) }`, **with** a
`csrfEchoHeaders()` call first (a mutation — see
[csrf/README.md](../../../../backend/identity-access/csrf/README.md)) → backend
[`revokeSession`](../../../../backend/identity-access/sessions/endpoints.md#revoke-a-session).

### Revoke all other sessions (BFF route)

**Source:** [`revoke-others.ts`](../../../../../next-js-boilerplate/src/api/server/sessions/revoke-others.ts) ·
`POST /api/sessions/revoke-others` → `mutation RevokeAllOtherSessions { revokeAllOtherSessions }`,
same CSRF-echo pattern → backend
[`revokeAllOtherSessions`](../../../../backend/identity-access/sessions/endpoints.md#revoke-all-other-sessions).

## `trust-device.ts` — filed here, used elsewhere

[`trust-device.ts`](../../../../../next-js-boilerplate/src/api/server/sessions/trust-device.ts) also
lives in this `api/server/sessions/` folder and exports `trustDeviceServer()` — but its BFF route is
`POST /api/auth/trust-device` (filed under the `auth` URL namespace, not `/api/sessions/*`), and its
only real caller is the login MFA-challenge's "remember this device" checkbox
([`MfaChallengeForm.tsx`](../../../../../next-js-boilerplate/src/features/auth/ui/MfaChallengeForm.tsx)),
**not** this page. See
[sessions/README.md § `trustCurrentDevice`](../../../../backend/identity-access/sessions/README.md#trustcurrentdevice--a-sessions-module-mutation-with-an-auth-flow-only-caller)
for the full explanation. Mentioned here only so this table doesn't look incomplete to someone
grepping the folder — it isn't part of this page's own call chain.
