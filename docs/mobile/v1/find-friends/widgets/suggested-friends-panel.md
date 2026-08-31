# SuggestedFriendsPanel (widget)

**Source:** [`suggested_friends_panel.dart`](../../../../../flutter-boilerplate/lib/views/find_friends/suggested_friends_panel.dart)
**Used in:** [find-friends screen](../screen.md) — Free, Medium, Premium tiers (each passing/watching
`suggestedFriendsProvider` slightly differently, see [screen.md](../screen.md))
**Web equivalent:** [SuggestedFriendsPanel component](../../../../frontend/v1/find-friends/components/suggested-friends-panel.md)
— **more functional here**, see [Behavior notes vs. web](#behavior-notes-vs-web)

## Purpose

`ConsumerWidget` rendering an `AsyncValue<List<SuggestedUser>>` (loading spinner / error `EmptyWidget`
/ empty-state `EmptyWidget` / a `ListView` of cards). Each card: avatar (real image if
`avatarUrl` is present — see below), name, mutual-friend count, and a `FilledButton.tonal` "Add
Friend" button.

## Behavior notes vs. web

- **Has a working Add Friend button** — `onPressed: () =>
  ref.read(friendActionsProvider).sendRequest(users[i].id)`. Web's equivalent component has no
  interactive element at all. See `CROSS-017` (resolved) — this is the one confirmed
  gap in this vertical where mobile is ahead of web, not behind.
- **Can render a real avatar image**, not just initials — this widget's underlying query
  ([`api/server/friends/suggested.dart`](../../../../../flutter-boilerplate/lib/api/server/friends/suggested.dart))
  selects `avatarUrl` from the backend; web's equivalent BFF query
  ([`api/server/friends/suggested.ts`](../../../../../next-js-boilerplate/src/api/server/friends/suggested.ts))
  does not. See [api.md](../api.md).

## Calls

`friendActionsProvider.sendRequest(userId)` — see [api.md](../api.md) →
[messaging/endpoints.md#send--accept--decline-a-friend-request](../../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request).
The suggestion data itself comes from `suggestedFriendsProvider` — see [api.md](../api.md) →
[social-content/friends/endpoints.md#list-suggested-friends](../../../../backend/social-content/friends/endpoints.md#list-suggested-friends).
