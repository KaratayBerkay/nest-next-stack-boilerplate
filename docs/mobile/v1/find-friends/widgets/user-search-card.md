# UserSearchCard (widget)

**Source:** [`user_search_card.dart`](../../../../../flutter-boilerplate/lib/views/find_friends/user_search_card.dart)
**Used in:** [find-friends screen](../screen.md) — Medium and Premium tiers' search results
**Web equivalent:** [UserSearchCard component](../../../../frontend/v1/find-friends/components/user-search-card.md)

## Purpose

Stateless `Card`/`ListTile`: avatar (real image via `user.avatarUrl` if present, unlike web's version
which never has one to show — see [api.md § Shape per file](../api.md#shape-per-file)), name, and an
"Add Friend" button (`onAdd`) shown only when provided — the same card type doubles as a plain,
non-actionable row when `onAdd` is null, though every real call site always passes it. Also accepts an
`onTap` (unused by any current caller — both Medium and Premium tier search results only ever pass
`onAdd`, never `onTap`).

## Props

```dart
{ required UserSearchResult user, VoidCallback? onAdd, VoidCallback? onTap }
```

## Calls

Indirect only — `onAdd` is wired by the parent to `friendActionsProvider.sendRequest(users[i].id)`.
See [api.md](../api.md) →
[messaging/endpoints.md#send--accept--decline-a-friend-request](../../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request).
