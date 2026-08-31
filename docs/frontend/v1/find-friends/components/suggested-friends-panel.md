# SuggestedFriendsPanel (component)

**Source:** [`SuggestedFriendsPanel.tsx`](../../../../../next-js-boilerplate/src/views/find-friends/SuggestedFriendsPanel.tsx)
**Used in:** [find-friends page](../page.md#mediumfindfriendscontent-premiummedium-tier) (Medium+ tier
sidebar only)
**Mobile equivalent:** [SuggestedFriendsPanel widget](../../../../mobile/v1/find-friends/widgets/suggested-friends-panel.md)

## Purpose

Own `useState` for `suggested`/`loading` — unlike its siblings on this page, this is a lazy,
click-to-load panel, not a query that fires on mount: it renders a single "Load suggestions" button
until clicked, then calls [`fetchSuggestedFriendsServer()`](../api.md#suggested-friends) and swaps to
a static list of name + mutual-friend-count rows once loaded. No re-fetch trigger, no loading skeleton
beyond the button's own `loading` prop, no empty state beyond never showing the list section at all.

## Calls

`fetchSuggestedFriendsServer()` — see [api.md § Suggested friends](../api.md#suggested-friends) →
[social-content/friends/endpoints.md#list-suggested-friends](../../../../backend/social-content/friends/endpoints.md#list-suggested-friends).

## Known issues

- `CROSS-017` (resolved) — every row renders name + mutual-friend count only; there is
  no button, click handler, or any other affordance to actually send that person a friend request from
  this panel. The user has to separately search for the same person by name in the "Add friends" tab
  to act on a suggestion. Mobile's equivalent widget
  ([find-friends/widgets/suggested-friends-panel.md](../../../../mobile/v1/find-friends/widgets/suggested-friends-panel.md))
  has a working "Add Friend" button wired to the same `sendRequest` action
  [UserSearchCard](./user-search-card.md) uses — this is the one direction in this vertical where
  mobile is ahead of web.
- Also note (not filed as its own issue, folded into the same finding above): the underlying data
  never carries an avatar image on web — see [api.md § Suggested friends](../api.md#suggested-friends)
  for why (the BFF's hand-written GraphQL query omits `avatarUrl`, unlike mobile's equivalent query).
