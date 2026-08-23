# PendingRequestCard (widget)

**Source:** [`pending_request_card.dart`](../../../../../flutter-boilerplate/lib/views/find_friends/pending_request_card.dart)
**Used in:** [find-friends screen](../screen.md) (Premium tier's inline requests section only) — note
[requests/screen.md](../requests/screen.md)'s own list uses an inline-defined `Card`/`ListTile` in
`_RequestsView` instead of this widget, a small duplication rather than a shared component, though
visually near-identical
**Web equivalent:** [PendingRequestCard component](../../../../frontend/v1/find-friends/components/pending-request-card.md)

## Purpose

Stateless `Card`/`ListTile`: avatar, requester name, a locally-computed relative timestamp
(`_timeAgo` — minutes/hours/days, no i18n on the unit suffix), and accept/decline icon buttons. Unlike
web's [PendingRequestCard](../../../../frontend/v1/find-friends/components/pending-request-card.md),
this widget has no incoming-vs-outgoing branch at all — see [Known issues](#known-issues) for why that
isn't really an independent design choice.

## Props

```dart
{ required FriendRequest request, VoidCallback? onAccept, VoidCallback? onDecline }
```

`FriendRequest` (the `request` prop's type,
[`types/messages/friend_request_types.dart`](../../../../../flutter-boilerplate/lib/types/messages/friend_request_types.dart))
is shared with the messages vertical (Phase 0) — see [Known issues](#known-issues), it doesn't
actually match what this endpoint returns.

## Calls

Indirect only — `onAccept`/`onDecline` are wired by the parent
([PremiumFindFriendsPage](../screen.md#premium-tier)) to
`friendActionsProvider.acceptRequest`/`.declineRequest`. See [api.md](../api.md) →
[messaging/endpoints.md#send--accept--decline-a-friend-request](../../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request).

## Known issues

- [MOB-007](../../../../issues.md#mob-007) — this widget can only ever render successfully for a
  request object that survived `FriendRequest.fromJson`, and that parse **throws** for every real
  request the backend ever returns — see
  [../requests/screen.md § Known issues](../requests/screen.md#known-issues) for the full evidence.
  In practice this widget is unreachable with real data today: `PremiumFindFriendsPage`'s "Pending
  Requests" section (the only place that constructs it) never gets past the same broken parse. The
  "no incoming-vs-outgoing branch" observation above is really a symptom of the same bug — the
  `FriendRequest` type has no `direction` field to branch on in the first place.
