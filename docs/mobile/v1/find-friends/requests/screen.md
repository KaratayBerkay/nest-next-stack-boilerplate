# Find Friends Requests (screen)

**Route:** `/v1/:lang/find-friends/requests` (GoRouter name `v1FindFriendsRequests`)
**Router registration:** [`router.dart#L450-456`](../../../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `FindFriendsRequestsPage` in
[`requests_page.dart`](../../../../../flutter-boilerplate/lib/views/find_friends/requests_page.dart)
**Web equivalent:** the same underlying route exists on web, but there it renders the identical
component tree as [`/find-friends`](../../../../frontend/v1/find-friends/page.md) with a different
default tab — **not true here**, see [../README.md](../README.md).

## What renders here

A `TierGate` with only two distinct branches:

```dart
TierGate(
  freeWidget: Center(child: Text(t.findFriendsUpgradeToSee)),
  basicWidget: _RequestsView(),
  mediumWidget: _RequestsView(),
  premiumWidget: _RequestsView(),
)
```

**Free tier gets a single centered line of text and nothing else** — no request list, no counts, no
way to accept or decline anything, regardless of whether the caller actually has pending requests.
Basic/Medium/Premium all render the same `_RequestsView` (a private widget in this same file): a
`ListView` of [PendingRequestCard](../widgets/pending-request-card.md)-equivalent inline `Card`/
`ListTile` rows (accept/decline icon buttons, relative "sent Xm/h/d ago" timestamp computed locally),
sourced from `friendRequestsProvider`.

## Known issues

- [MOB-007](../../../../issues.md#mob-007) — **`friendRequestsProvider` throws for every real pending
  request the backend returns**, for every tier that can reach this screen. The backend's `GET
  /api/friends/requests` returns rows shaped `{id, direction: 'incoming'|'outgoing', user: {id, name,
  email, avatar}, createdAt}` (confirmed directly in
  [`messaging-friend.service.ts#L161-201`](../../../../../nest-js-boilerplate/src/messaging/messaging-friend.service.ts)).
  [`FriendRequest.fromJson`](../../../../../flutter-boilerplate/lib/types/messages/friend_request_types.dart)
  instead reads `json['fromUserId']`, `json['fromUserName']`, `json['fromUserAvatar']` — none of which
  exist anywhere in that response (the real per-user fields are nested one level down, under `user`,
  and under different names). `json['fromUserId'] as String` on a missing key evaluates to `null as
  String`, which Dart throws a `TypeError` for at parse time — **not a silently-wrong render, a thrown
  exception**, for every element of a non-empty list. `friendRequestsProvider`
  ([`api/client/friends/query.dart`](../../../../../flutter-boilerplate/lib/api/client/friends/query.dart))
  wraps `FriendRequestsServer.call()` with no try/catch of its own, so the `AsyncValue` resolves to its
  `error` state, and this screen's `_RequestsView` renders `Center(child: Text('Error: $e'))` instead
  of the request list — for Basic/Medium/Premium tier, **every single time the caller has at least one
  pending request** (a user with zero pending requests never triggers `.fromJson` at all, since
  `.map()` over an empty list never calls it — this is almost certainly why the bug hasn't surfaced
  through casual testing with clean accounts). [PendingRequestCard](../widgets/pending-request-card.md)
  is unreachable with real data as a direct consequence. Not a tier-gating question at all for
  Basic/Medium/Premium — the feature is simply broken for anyone it has data to show.
  **Separately**, Free tier is additionally denied the screen entirely regardless of this bug (a
  static `Center(child: Text(t.findFriendsUpgradeToSee))`, no provider watch) — see
  [CROSS-018](../../../../issues.md#cross-018) for that tier-gating angle, which is real and independent of
  the parsing bug above (fixing the parse wouldn't give Free tier this screen; the `TierGate` denies it
  before any data is ever requested).
  **Blast radius check**: `friendRequestsProvider`'s only other consumers are
  [PremiumFindFriendsPage](../screen.md#premium-tier)'s inline section (same bug, see
  [screen.md § Known issues](../screen.md#known-issues)) and
  [`realtime_provider.dart`](../../../../../flutter-boilerplate/lib/lib/realtime/realtime_provider.dart)
  (only calls `ref.invalidate(friendRequestsProvider)` on a `Friends/PendingList` renew frame — doesn't
  itself touch the parsed data, so it can't throw). Confirmed via `grep -rln "friendRequestsProvider"
  flutter-boilerplate/lib` (5 files total, all accounted for above) — this bug does not appear to reach
  the [messages](../../messages/screen.md) vertical (Phase 0), which doesn't consume this same
  provider for its own friend-request badge/UI as far as this scan found, though that vertical's own
  doc owner may want to double-check given the shared type file.
