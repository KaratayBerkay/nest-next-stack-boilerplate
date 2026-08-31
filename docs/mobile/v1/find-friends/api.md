# Find Friends — API

Screens: [screen.md](./screen.md), [requests/screen.md](./requests/screen.md) · Client:
[`lib/api/client/friends/`](../../../../flutter-boilerplate/lib/api/client/friends/),
[`lib/api/client/users/`](../../../../flutter-boilerplate/lib/api/client/users/)

## Shape per file

| File | Shape | Path/operation | Backend endpoint |
|---|---|---|---|
| [`friends/suggested.dart`](../../../../flutter-boilerplate/lib/api/server/friends/suggested.dart) | Direct GraphQL (`_dio.post('/graphql', ...)`) | `query SuggestedFriends` | [social-content/friends/endpoints.md#list-suggested-friends](../../../backend/social-content/friends/endpoints.md#list-suggested-friends) |
| [`users/search.dart`](../../../../flutter-boilerplate/lib/api/server/users/search.dart) | Direct GraphQL | `query Users($search: String)` | [messaging/endpoints.md#list-discoverable-users](../../../backend/messaging-realtime/messaging/endpoints.md#list-discoverable-users) |
| [`server/messages/friend_requests.dart`](../../../../flutter-boilerplate/lib/api/server/messages/friend_requests.dart) (reused, not friends-specific) | Direct REST | `GET /api/friends/requests` | [messaging/endpoints.md#list-pending-friend-requests](../../../backend/messaging-realtime/messaging/endpoints.md#list-pending-friend-requests) — see `MOB-007` (resolved), the response shape and this file's model disagree |
| [`server/messages/{send,accept,decline}_friend_request.dart`](../../../../flutter-boilerplate/lib/api/server/messages/) (reused) | Direct REST | `POST /api/friends/{request,accept,decline}/:userId` | [messaging/endpoints.md#send--accept--decline-a-friend-request](../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request) |

Confirmed per [conventions.md §9](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement):
every REST-shaped path here matches the backend's own native controller route exactly (not the
frontend's differently-namespaced BFF paths), and the GraphQL-shaped calls post straight to
`/graphql`. Zero Next.js involvement anywhere in this vertical's mobile network calls, same conclusion
as [messages](../messages/api.md) and [friends](../friends/api.md).

Note `suggested.dart`'s query selects `avatarUrl` where web's equivalent doesn't — see
[widgets/suggested-friends-panel.md](./widgets/suggested-friends-panel.md#behavior-notes-vs-web).

## Client layer

| File | Purpose |
|---|---|
| [`friends/query.dart`](../../../../flutter-boilerplate/lib/api/client/friends/query.dart) | `suggestedFriendsProvider`, `friendsListProvider`, `friendRequestsProvider` — all bare `FutureProvider`s, no caching strategy beyond Riverpod's own |
| [`friends/actions.dart`](../../../../flutter-boilerplate/lib/api/client/friends/actions.dart) | `friendActionsProvider` → `FriendActions` (`sendRequest`/`acceptRequest`/`declineRequest`); invalidates all three providers above after any call — mirrors web's `useFriendActions()` |
| [`users/search.dart`](../../../../flutter-boilerplate/lib/api/client/users/search.dart) | `searchUsersProvider` — a `FutureProvider.family`, **no minimum-query-length guard** (web's `searchUsersQueryOptions` has `enabled: q.trim().length >= 3`; this one fires on any string including `""`) |

## Calls

- [FreeFindFriendsContent](./screen.md#free-tier) / [MediumFindFriendsPage](./screen.md#medium-tier) /
  [PremiumFindFriendsPage](./screen.md#premium-tier) → `suggestedFriendsProvider` →
  [social-content/friends/endpoints.md#list-suggested-friends](../../../backend/social-content/friends/endpoints.md#list-suggested-friends)
- [MediumFindFriendsPage](./screen.md#medium-tier) / [PremiumFindFriendsPage](./screen.md#premium-tier) →
  `searchUsersProvider` →
  [messaging/endpoints.md#list-discoverable-users](../../../backend/messaging-realtime/messaging/endpoints.md#list-discoverable-users)
- [PremiumFindFriendsPage](./screen.md#premium-tier) / [requests/screen.md](./requests/screen.md) →
  `friendRequestsProvider` →
  [messaging/endpoints.md#list-pending-friend-requests](../../../backend/messaging-realtime/messaging/endpoints.md#list-pending-friend-requests)
  — see `MOB-007` (resolved)
- [SuggestedFriendsPanel](./widgets/suggested-friends-panel.md), [UserSearchCard](./widgets/user-search-card.md),
  [PendingRequestCard](./widgets/pending-request-card.md), [requests/screen.md](./requests/screen.md)'s
  `_RequestsView` → `friendActionsProvider` →
  [messaging/endpoints.md#send--accept--decline-a-friend-request](../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request)
