# Friends — API

Page: [page.md](./page.md) · Client: [`src/api/client/friends/`](../../../../next-js-boilerplate/src/api/client/friends/)

**This vertical owns no BFF route files of its own.** Both files in
[`src/api/client/friends/`](../../../../next-js-boilerplate/src/api/client/friends/) are thin
React-Query/action wrappers that import and re-call the [messages](../messages/api.md) vertical's
already-documented `src/api/server/messages/*.ts` files directly — there is no
`src/api/server/friends/` REST-shaped file and no `src/app/api/friends/**` route folder at all (the
one exception, `src/api/server/friends/suggested.ts`, is [find-friends](../find-friends/api.md)-only,
not used by this page).

## Client (`src/api/client/friends/`)

| File | Exports | Actually calls |
|---|---|---|
| [`query.ts`](../../../../next-js-boilerplate/src/api/client/friends/query.ts) | `friendsQueryOptions()`, `friendRequestsQueryOptions()` | `fetchFriendsServer()` / `fetchFriendRequestsServer()`, both lazy-imported from [`src/api/server/messages/friends.ts`](../../../../next-js-boilerplate/src/api/server/messages/friends.ts) / [`friend-requests.ts`](../../../../next-js-boilerplate/src/api/server/messages/friend-requests.ts) |
| [`actions.ts`](../../../../next-js-boilerplate/src/api/client/friends/actions.ts) | `useFriendActions()` → `{sendRequest, acceptRequest, declineRequest}` | `sendFriendRequestServer` / `acceptFriendRequestServer` / `declineFriendRequestServer`, all from `src/api/server/messages/*.ts` |

`useFriendActions()` invalidates the `["friends"]` React Query key prefix after every mutation — a
single call covers both `friendsQueryOptions()`'s `["friends","list"]` and
`friendRequestsQueryOptions()`'s `["friends","requests"]` keys.

## Where the real BFF routes are documented

Every call above resolves to a route already fully documented in
[messages/api.md § Server / BFF routes](../messages/api.md#server--bff-routes-srcapiservermessages):

| Client call | → BFF route | → Backend |
|---|---|---|
| `fetchFriendsServer()` | [`friends.ts`](../messages/api.md#everything-else) | [messaging/endpoints.md#list-friends](../../../backend/messaging-realtime/messaging/endpoints.md#list-friends) |
| `fetchFriendRequestsServer()` | [`friend-requests.ts`](../messages/api.md#everything-else) | [messaging/endpoints.md#list-pending-friend-requests](../../../backend/messaging-realtime/messaging/endpoints.md#list-pending-friend-requests) |
| `sendFriendRequestServer()` / `acceptFriendRequestServer()` / `declineFriendRequestServer()` | [`send-friend-request.ts` etc.](../messages/api.md#everything-else) | [messaging/endpoints.md#send--accept--decline-a-friend-request](../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request) |

This page is a **new caller** of files that vertical's own doc already listed as "used by find-friends,
not messages directly" — [messages/api.md](../messages/api.md) itself never claimed to be the only
consumer, so no edit was needed there; this table exists so a reader landing on *this* page's api.md
doesn't have to guess where the real implementation lives.

## Calls

- [FriendsPageContent](./page.md#friendspagecontent--the-real-content) → `friendsQueryOptions()` →
  [messaging/endpoints.md#list-friends](../../../backend/messaging-realtime/messaging/endpoints.md#list-friends)

This page never calls `friendRequestsQueryOptions()` or `useFriendActions()` itself — both are exported
from the same `src/api/client/friends/` files for [find-friends](../find-friends/api.md)'s benefit.
