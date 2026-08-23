# Friends — API

Screen: [screen.md](./screen.md) · Client:
[`lib/api/client/friends/`](../../../../flutter-boilerplate/lib/api/client/friends/)

## Shape per file

| File | Shape | Path/operation | Backend endpoint |
|---|---|---|---|
| [`friends/query.dart`](../../../../flutter-boilerplate/lib/api/client/friends/query.dart)'s `friendsListProvider` | Direct REST (via [`server/messages/friends.dart`](../../../../flutter-boilerplate/lib/api/server/messages/friends.dart), reused — not a friends-specific file) | `GET /api/friends` | [messaging/endpoints.md#list-friends](../../../backend/messaging-realtime/messaging/endpoints.md#list-friends) |

Confirmed via [mobile/v1/messages/api.md § Shape per file](../messages/api.md#shape-per-file) — this
screen is a second caller of a file already fully documented there (`friends.dart` — direct REST, path
matches the backend's own native `@Get('friends')` route exactly, no BFF hop). Not re-verified from
scratch here; see that entry for the underlying evidence.

## Calls

- [FriendsPageContent](./screen.md#friendspagecontent--the-real-content) →
  `friendsListProvider` → [messaging/endpoints.md#list-friends](../../../backend/messaging-realtime/messaging/endpoints.md#list-friends)

This screen does not use `friendRequestsProvider`, `suggestedFriendsProvider`, or `friendActionsProvider`
— those are [find-friends](../find-friends/api.md)'s.
