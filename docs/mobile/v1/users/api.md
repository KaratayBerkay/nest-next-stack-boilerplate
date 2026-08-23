# Users — API

Screens: [list/screen.md](./list/screen.md), [detail/screen.md](./detail/screen.md)

Unlike [web's equivalent](../../../frontend/v1/users/api.md) (which calls nothing), this vertical
makes real calls — reusing providers documented in other verticals rather than owning any new API
files of its own.

## Shape per file

| File (reused, not users-specific) | Shape | Path/operation | Backend endpoint |
|---|---|---|---|
| [`friends/query.dart`](../../../../flutter-boilerplate/lib/api/client/friends/query.dart)'s `friendsListProvider` | Direct REST | `GET /api/friends` | [messaging/endpoints.md#list-friends](../../../backend/messaging-realtime/messaging/endpoints.md#list-friends) |
| [`users/search.dart`](../../../../flutter-boilerplate/lib/api/client/users/search.dart)'s `searchUsersProvider` | Direct GraphQL | `query Users($search: String)` | [messaging/endpoints.md#list-discoverable-users](../../../backend/messaging-realtime/messaging/endpoints.md#list-discoverable-users) |
| [`profile/get.dart`](../../../../flutter-boilerplate/lib/api/server/profile/get.dart)'s `profileGetServerProvider` | Direct GraphQL | `query MyProfile` | [social-content/profile/endpoints.md#get-my-profile](../../../backend/social-content/profile/endpoints.md#get-my-profile) — see [MOB-003](../../../issues.md#mob-003), always self-scoped regardless of caller intent |
| [`friends/actions.dart`](../../../../flutter-boilerplate/lib/api/client/friends/actions.dart)'s `friendActionsProvider` | Direct REST | `POST /api/friends/request/:userId` | [messaging/endpoints.md#send--accept--decline-a-friend-request](../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request) |

All direct-to-backend, no BFF hop — same conclusion as every other vertical checked so far in this
codebase (see [conventions.md §9](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)).

## Calls

- [list/screen.md](./list/screen.md) → `friendsListProvider` (empty query) /
  `searchUsersProvider` (non-empty query) →
  [messaging/endpoints.md#list-friends](../../../backend/messaging-realtime/messaging/endpoints.md#list-friends) /
  [#list-discoverable-users](../../../backend/messaging-realtime/messaging/endpoints.md#list-discoverable-users)
- [detail/screen.md](./detail/screen.md) → `profileGetServerProvider` →
  [social-content/profile/endpoints.md#get-my-profile](../../../backend/social-content/profile/endpoints.md#get-my-profile)
  (always self-scoped — see [MOB-003](../../../issues.md#mob-003)); "Add Friend" button →
  `friendActionsProvider.sendRequest` →
  [messaging/endpoints.md#send--accept--decline-a-friend-request](../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request)
  (always fails, same reason)

## Known issues

- [MOB-003](../../../issues.md#mob-003) — see [detail/screen.md § Known issues](./detail/screen.md#known-issues).
