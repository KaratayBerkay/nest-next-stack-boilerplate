# Find Friends

**Routes:** `/v1/[lang]/find-friends` + `/v1/[lang]/find-friends/requests` · **Layout:** none of its
own — both share the [v1 layout](../../../architecture.md)'s standard chrome.
**Mobile equivalent:** [find-friends](../../../mobile/v1/find-friends/screen.md)

## Two routes, one component tree

`find-friends/requests/page.tsx` is **not** a separate implementation — it imports the exact same
`VIEWS` object (`FreePageView`/`BasicPageView`/`MediumPageView`/`PremiumPageView`) as
`find-friends/page.tsx`, byte-for-byte, differing only in `metadata` (page `<title>`). The two routes
render because the content component reads `usePathname()` and picks its default-active tab
accordingly:

```ts
// FreeFindFriendsContent.tsx / MediumFindFriendsContent.tsx, identical in both
<Tabs defaultValue={pathname?.endsWith("/requests") ? "pending" : "add"} ...>
```

So `/find-friends/requests` is really "`/find-friends` opened with the Pending tab pre-selected" —
both tabs (search-and-add, pending-requests) are always in the DOM either way; only the initial
`defaultValue` differs, and a user can freely switch tabs after landing on either URL. This is a
narrower case than [conventions.md §1](../../../conventions.md#1-folder-structure-rule)'s
"cross-cutting funnel" (that's for hub pages linking *separate* real pages in sequence) — here it's
one real page reachable at two URLs — but the same instinct applies: don't duplicate the content
description. [page.md](./page.md) documents the real content once;
[requests/page.md](./requests/page.md) only documents the delta.

## Pages

| Route | Doc |
|---|---|
| `/v1/[lang]/find-friends` | [page.md](./page.md) |
| `/v1/[lang]/find-friends/requests` | [requests/page.md](./requests/page.md) |

## Real tier differentiation (unlike [friends](../friends/page.md))

Unlike the plain `friends/` page, tier actually changes what renders here — matching the backend's own
`suggestedFriends` gate ([social-content/friends/endpoints.md](../../../backend/social-content/friends/endpoints.md#list-suggested-friends),
`MEDIUM`+ only):

| Tier | Content component | Has search + pending tabs? | Has suggested-friends sidebar? |
|---|---|---|---|
| Free, Basic | [`FreeFindFriendsContent`](./page.md#freefindfriendscontent-freebasic-tier) | Yes | No |
| Medium, Premium | [`MediumFindFriendsContent`](./page.md#mediumfindfriendscontent-premiummedium-tier) | Yes | Yes ([SuggestedFriendsPanel](./components/suggested-friends-panel.md)) |

Both tabs (search-and-add, pending-requests) are available to **every** tier on web — only the
suggestions sidebar is tier-gated, matching the backend exactly. Contrast with mobile, which gates
much more aggressively than the backend requires — see
[CROSS-018](../../../issues.md#cross-018) and [mobile find-friends § Known issues](../../../mobile/v1/find-friends/screen.md#known-issues).

## Hooks & API

- [api.md](./api.md) — client/server file map, including the search endpoint shared with
  [users/list](../users/list/page.md)
- No vertical-wide hooks.md — see each page doc's own "Hooks & API" section
  ([page.md](./page.md#hooks--api), [requests/page.md](./requests/page.md))

## Components

4 significant components in
[`src/views/find-friends/`](../../../../next-js-boilerplate/src/views/find-friends/) (the tier-branch
content wrappers — `FreeFindFriendsContent`/`MediumFindFriendsContent` — are documented inline in
[page.md](./page.md), not as standalone components, same rationale as every other vertical's
`*PageView.tsx` files):

[suggested-friends-panel.md](./components/suggested-friends-panel.md) ·
[user-search-card.md](./components/user-search-card.md) ·
[pending-request-card.md](./components/pending-request-card.md) ·
[pagination-bar.md](./components/pagination-bar.md)

## Known issues affecting this vertical

- [CROSS-017](../../../issues.md#cross-017) — [SuggestedFriendsPanel](./components/suggested-friends-panel.md)
  has no "Add Friend" action; mobile's equivalent does.
- [CROSS-018](../../../issues.md#cross-018) — mobile's find-friends screens are far more tier-restrictive
  than this page or the backend contract.
