# Find Friends (screen)

**Route:** `/v1/:lang/find-friends` (GoRouter name `v1FindFriends`)
**Router registration:** [`router.dart#L443-449`](../../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `FindFriendsPageContent` in
[`page_view.dart`](../../../../flutter-boilerplate/lib/views/find_friends/page_view.dart) — a
`TierGate` dispatching to one of four tier widgets, all four independently implemented (not thin
tier-branch wrappers around one shared content widget, unlike every other tier-gated screen in this
codebase — see [./README.md § Tier structure](./README.md#tier-structure--four-independent-implementations-not-one-screen-with-a-gated-sidebar)).
**Web equivalent:** [find-friends page](../../../frontend/v1/find-friends/page.md) — see
[./README.md](./README.md) for why the comparison isn't 1:1.
**Requests screen:** [requests/screen.md](./requests/screen.md) — a separate screen, not a tab
on this one.

## Free tier

[`free_page_view.dart`](../../../../flutter-boilerplate/lib/views/find_friends/free_page_view.dart) →
[`FreeFindFriendsContent`](../../../../flutter-boilerplate/lib/views/find_friends/free_find_friends_content.dart).
Unconditionally watches `suggestedFriendsProvider` (the `MEDIUM`+-gated backend query — see
[social-content/friends/endpoints.md](../../../backend/social-content/friends/endpoints.md#list-suggested-friends)),
so a Free-tier caller always gets the provider's `error` branch, rendered as an
`EmptyWidget` (`t.findFriendsFailedToLoadSuggestions`). The screen also shows a title + an "upgrade to
see" subtitle, but **no search box and no pending-requests UI of any kind**. See
[Known issues](#known-issues).

## Basic tier

[`basic_page_view.dart`](../../../../flutter-boilerplate/lib/views/find_friends/basic_page_view.dart) —
does not even attempt the `suggestedFriendsProvider` call; renders a static
`EmptyWidget(title: t.findFriendsTitle, description: t.findFriendsUpgradeToSee)` and nothing else. No
search, no requests, no suggestions attempt.

## Medium tier

[`medium_page_view.dart`](../../../../flutter-boilerplate/lib/views/find_friends/medium_page_view.dart) →
[`MediumFindFriendsContent`](../../../../flutter-boilerplate/lib/views/find_friends/medium_find_friends_content.dart).
A search box (`friendSearchProvider` + `searchUsersProvider`) that swaps to
[SuggestedFriendsPanel](./widgets/suggested-friends-panel.md) when the query is empty. **No
pending-requests section anywhere on this screen** — that's [requests/screen.md](./requests/screen.md)
only, at this tier.

## Premium tier

[`premium_page_view.dart`](../../../../flutter-boilerplate/lib/views/find_friends/premium_page_view.dart) —
the richest of the four, and structurally unlike any of the other three: search box + an inline
"Pending Requests" section (via `friendRequestsProvider`, rendered with
[PendingRequestCard](./widgets/pending-request-card.md)) + "Suggested Friends" section, all in one
scroll view when the search query is empty, plus a `filter_list` icon opening a bottom sheet
(`_showFilterSheet`). That sheet is decorative, and the "Pending Requests" section never actually
renders a request — see [Known issues](#known-issues).

## Known issues

- [MOB-007](../../../issues.md#mob-007) — Premium tier's inline "Pending Requests" section
  (`friendRequestsProvider`) throws on every real pending request the backend returns — the underlying
  `FriendRequest.fromJson` reads field names that don't exist in the actual response shape. This
  section never successfully renders a request card in practice; it only *looks* functional in a
  no-pending-requests test account. Full evidence in
  [requests/screen.md § Known issues](./requests/screen.md#known-issues) (same provider, same bug,
  documented once there since that's the primary screen for this data).
- [CROSS-018](../../../issues.md#cross-018) — **Free and Basic tier have no way to search for or add a new
  friend anywhere in this app.** No search box exists on either tier's `/find-friends` widget, and
  neither tier's `/find-friends/requests` widget offers one either (see
  [requests/screen.md](./requests/screen.md)). The backend places no tier requirement on
  `users(search)` or the friend-request send/accept/decline/list routes at all (only
  `suggestedFriends` is `MEDIUM`+-gated — see
  [social-content/friends/endpoints.md](../../../backend/social-content/friends/endpoints.md#list-suggested-friends)
  and [messaging/endpoints.md](../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request)),
  and web exposes search to every tier. **Free tier additionally cannot view or act on an incoming
  friend request at all** — see [requests/screen.md § Known issues](./requests/screen.md#known-issues).
  Evidence: `free_page_view.dart`, `basic_page_view.dart` (no search widget in either file — confirmed
  by reading both in full, 34 and 17 lines respectively) vs.
  [frontend/v1/find-friends/page.md](../../../frontend/v1/find-friends/page.md) (search available to
  every tier) vs. `messaging.controller.ts`'s friend routes (no `TierGuard`/`@MinTier` anywhere on the
  class or any handler — confirmed by reading the controller directly).
- The Free-tier screen's unconditional `suggestedFriendsProvider` watch means every Free-tier visit to
  this screen fires a GraphQL request guaranteed to fail its `TierGuard` check server-side — a wasted
  round-trip on every page load, not just a UI-copy mismatch.
- The Premium-tier "filter" bottom sheet (`_showFilterSheet`) offers three options — "Mutual Friends"
  (pre-checked, `trailing: Icon(Icons.check)`), "Nearby", "Same Interests" — none of which have an
  `onTap`/callback of any kind, and no backend concept of "nearby" or "interests" exists to filter by
  in the first place (`suggestedFriends`'s only ranking signal is mutual-friend count). Purely
  decorative UI.
