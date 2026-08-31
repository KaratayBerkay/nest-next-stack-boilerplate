# Find Friends

**Routes:** `/v1/:lang/find-friends` (name `v1FindFriends`) + `/v1/:lang/find-friends/requests` (name
`v1FindFriendsRequests`) · **Web equivalent:** [find-friends](../../../frontend/v1/find-friends/README.md)

## Two genuinely separate screens — unlike web

Unlike web (where `/find-friends` and `/find-friends/requests` render the *identical* component tree,
differing only in which tab starts active — see
[frontend/v1/find-friends/README.md](../../../frontend/v1/find-friends/README.md#two-routes-one-component-tree)),
mobile registers two distinct widgets:
[`FindFriendsPageContent`](../../../../flutter-boilerplate/lib/views/find_friends/page_view.dart) and
[`FindFriendsRequestsPage`](../../../../flutter-boilerplate/lib/views/find_friends/requests_page.dart).
They share some pieces (`friendRequestsProvider`, `PendingRequestCard`) but are independently
tier-gated and independently laid out — see [screen.md](./screen.md) and
[requests/screen.md](./requests/screen.md).

## Pages

| Route | Doc |
|---|---|
| `/v1/:lang/find-friends` | [screen.md](./screen.md) |
| `/v1/:lang/find-friends/requests` | [requests/screen.md](./requests/screen.md) |

## Tier structure — four independent implementations, not one screen with a gated sidebar

This is the headline finding for this vertical. Web has exactly two content variants (search+requests
for every tier, plus an optional Medium+ suggestions sidebar — matching the backend's one tier gate
exactly). Mobile has **four**, and they diverge in what functionality is available, not just what's
decorated on top of shared functionality:

| Tier | `/find-friends` widget | Search? | Pending requests visible here? | Suggestions? |
|---|---|---|---|---|
| Free | [`FreeFindFriendsPage`](./screen.md#free-tier) | No | No | Yes (but see [Known issues](#known-issues-affecting-this-vertical) — always errors) |
| Basic | [`BasicFindFriendsPage`](./screen.md#basic-tier) | No | No | No — static message only |
| Medium | [`MediumFindFriendsPage`](./screen.md#medium-tier) | Yes | No (separate `/requests` route only) | Yes |
| Premium | [`PremiumFindFriendsPage`](./screen.md#premium-tier) | Yes | Yes (inline, same screen) | Yes, plus a non-functional "filter" sheet |

| Tier | `/find-friends/requests` widget | Shows pending requests? |
|---|---|---|
| Free | static `Text(t.findFriendsUpgradeToSee)` | **No** |
| Basic, Medium, Premium | `_RequestsView` (shared) | Yes |

## Widgets

3 significant widgets (the 4th web equivalent, `PaginationBar`, has no wired-up mobile counterpart —
see [Known issues](#known-issues-affecting-this-vertical)) in
[`lib/views/find_friends/`](../../../../flutter-boilerplate/lib/views/find_friends/):

[suggested-friends-panel.md](./widgets/suggested-friends-panel.md) ·
[pending-request-card.md](./widgets/pending-request-card.md) ·
[user-search-card.md](./widgets/user-search-card.md)

## API

[api.md](./api.md)

## Known issues affecting this vertical

- `MOB-007` (resolved) — **`friendRequestsProvider` throws for every real pending
  request the backend ever returns** (a field-name mismatch between the Dart model and the actual
  response shape, not a tier-gating issue) — affects every tier that can reach pending-request data
  (Basic/Medium/Premium). Only invisible in testing because a zero-pending-requests account never
  triggers the broken parse. Full evidence in
  [requests/screen.md § Known issues](./requests/screen.md#known-issues).
- `CROSS-018` (resolved) — mobile gates search entirely away from Free/Basic tier and
  gates pending-request *visibility* away from Free tier, neither of which the backend or web requires
  (the backend's only tier gate anywhere in this contract is `suggestedFriends`, `MEDIUM`+ — see
  [social-content/friends/endpoints.md](../../../backend/social-content/friends/endpoints.md#list-suggested-friends)).
  Free and Basic tier mobile users have **no way to search for or add a new friend anywhere in the
  app**, and Free tier users additionally cannot view or act on an incoming friend request. See
  [screen.md § Known issues](./screen.md#known-issues) for the full per-tier breakdown.
- `CROSS-017` (resolved) — the reverse-direction gap: web's `SuggestedFriendsPanel` has no
  add-friend action; this vertical's [SuggestedFriendsPanel widget](./widgets/suggested-friends-panel.md)
  does.
- `MOB-005` (resolved) — dead code: `search_utils.dart` (3 unused exports) and
  `pagination_bar.dart` (an unused, fully-built `PaginationBar` widget — none of the three real search
  UIs on this screen paginate; each renders every result in one `ListView.builder`).
