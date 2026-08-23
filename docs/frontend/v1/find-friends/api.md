# Find Friends — API

Page: [page.md](./page.md) · Client: [`src/api/client/friends/`](../../../../next-js-boilerplate/src/api/client/friends/),
[`src/api/client/users/`](../../../../next-js-boilerplate/src/api/client/users/) · Server (BFF):
[`src/api/server/friends/`](../../../../next-js-boilerplate/src/api/server/friends/),
[`src/api/server/users/`](../../../../next-js-boilerplate/src/api/server/users/)

Three different call shapes feed this one page — worth listing explicitly since none of the three
follow the same route-naming convention:

| Data | Client | Server/BFF | Backend |
|---|---|---|---|
| Friends list, pending requests, send/accept/decline | [`friends/query.ts`](../../../../next-js-boilerplate/src/api/client/friends/query.ts), [`friends/actions.ts`](../../../../next-js-boilerplate/src/api/client/friends/actions.ts) | re-calls [messages](../messages/api.md)'s BFF files — see [friends/api.md](../friends/api.md) | [messaging/endpoints.md](../../../backend/messaging-realtime/messaging/endpoints.md) |
| User search | [`users/search.ts`](../../../../next-js-boilerplate/src/api/client/users/search.ts) | [`users/search.ts`](../../../../next-js-boilerplate/src/api/server/users/search.ts) → `GET /api/users/search` | [messaging/endpoints.md#list-discoverable-users](../../../backend/messaging-realtime/messaging/endpoints.md#list-discoverable-users) |
| Suggested friends | (called directly, no client wrapper) | [`friends/suggested.ts`](../../../../next-js-boilerplate/src/api/server/friends/suggested.ts) → `POST /api/gql` | [social-content/friends/endpoints.md#list-suggested-friends](../../../backend/social-content/friends/endpoints.md#list-suggested-friends) |

## User search

[`src/api/client/users/search.ts`](../../../../next-js-boilerplate/src/api/client/users/search.ts)'s
`searchUsersQueryOptions(q, take, skip)` (`enabled: q.trim().length >= 3`, so nothing fires below 3
chars) lazy-imports
[`src/api/server/users/search.ts`](../../../../next-js-boilerplate/src/api/server/users/search.ts)'s
`searchUsersServer()`, which hits `GET /api/users/search?q=&take=&skip=` — a real Next.js Route
Handler at
[`src/app/api/users/search/route.ts`](../../../../next-js-boilerplate/src/app/api/users/search/route.ts).

That route is worth reading directly rather than assuming from the name: it makes **two** GraphQL
calls to the backend per search (`me { id }` to know which id to exclude, plus
`users(search: $search) { id name email }`), then does the `skip`/`take` **pagination itself, in
Node**, by slicing the full result array the backend returned — the backend's `users(search)` query
takes no pagination arguments at all (see
[messaging/endpoints.md#list-discoverable-users](../../../backend/messaging-realtime/messaging/endpoints.md#list-discoverable-users)).
Fine at this app's scale; worth knowing if the discoverable-user count ever grows large, since every
page of results still costs one full unfiltered fetch.

This same file/route is reused verbatim by [users/list](../users/list/page.md) on **its** search box —
see [users/api.md](../users/api.md).

## Suggested friends

[`src/api/server/friends/suggested.ts`](../../../../next-js-boilerplate/src/api/server/friends/suggested.ts)'s
`fetchSuggestedFriendsServer()` posts straight to `GQL_URL` (`/api/gql`, a generic
cookie-to-bearer-token GraphQL proxy at
[`src/app/api/gql/route.ts`](../../../../next-js-boilerplate/src/app/api/gql/route.ts) — not a
vertical-specific route, shared by any `api/server/*.ts` file that needs an ad-hoc GraphQL call) with
a hand-written `query { suggestedFriends { id name email mutualFriends } }`. Note this selection set
omits `avatarUrl` (present on the backend's `SuggestedFriend` type) — that's why
[SuggestedFriendsPanel](./components/suggested-friends-panel.md) always falls back to initials, never
a real avatar image, even when one exists.

## Calls

- [FreeFindFriendsContent / MediumFindFriendsContent](./page.md) → `friendsQueryOptions()`,
  `friendRequestsQueryOptions()` → see [friends/api.md](../friends/api.md)
- [useFriendSearch](./page.md#hooks--api) → `searchUsersQueryOptions()` →
  [messaging/endpoints.md#list-discoverable-users](../../../backend/messaging-realtime/messaging/endpoints.md#list-discoverable-users)
- [UserSearchCard](./components/user-search-card.md) → `onSendRequest` prop → `useFriendActions().sendRequest`
  → see [friends/api.md](../friends/api.md)
- [PendingRequestCard](./components/pending-request-card.md) → `onAccept`/`onDecline` props →
  `useFriendActions()` → see [friends/api.md](../friends/api.md)
- [SuggestedFriendsPanel](./components/suggested-friends-panel.md) → `fetchSuggestedFriendsServer()` →
  [social-content/friends/endpoints.md#list-suggested-friends](../../../backend/social-content/friends/endpoints.md#list-suggested-friends)
  — read-only, see [CROSS-017](../../../issues.md#cross-017)
