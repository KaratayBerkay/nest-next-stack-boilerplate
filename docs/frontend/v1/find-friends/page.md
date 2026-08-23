# Find Friends (page)

**Route:** `/v1/[lang]/find-friends` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/find-friends/page.tsx)
**Mobile equivalent:** [find-friends screen](../../../mobile/v1/find-friends/screen.md)
**Index:** [README.md](./README.md) (this folder has 2 pages — see there for how this route relates to
[requests/page.md](./requests/page.md))

## What renders here

Same `getTierView()` pattern as [messages](../messages/page.md)/[friends](../friends/page.md), but
here the four tier branches genuinely differ — see [README.md § Real tier
differentiation](./README.md#real-tier-differentiation-unlike-friends).

| Tier | View file | Renders |
|---|---|---|
| Free | [`FreePageView.tsx`](../../../../next-js-boilerplate/src/views/find-friends/FreePageView.tsx) | [`FreeFindFriendsContent`](#freefindfriendscontent-freebasic-tier) |
| Basic | `BasicPageView.tsx` | re-exports `FreePageView` |
| Medium | [`MediumPageView.tsx`](../../../../next-js-boilerplate/src/views/find-friends/MediumPageView.tsx) | [`MediumFindFriendsContent`](#mediumfindfriendscontent-premiummedium-tier) |
| Premium | `PremiumPageView.tsx` | re-exports `MediumPageView` |

Each `*PageView.tsx` is the same thin `useAuth()` gate (`LoadingAuth`/`UnauthenticatedMessage`) +
`Suspense` wrapper pattern as every other tier-branched page in this codebase — not documented
separately.

## `FreeFindFriendsContent` (Free/Basic tier)

[`FreeFindFriendsContent.tsx`](../../../../next-js-boilerplate/src/views/find-friends/FreeFindFriendsContent.tsx) —
a `Tabs` component with two tabs:

- **Add friends** (`value="add"`) — an `Input` search box wired to
  [`useFriendSearch`](#hooks--api), rendering [`UserSearchCard`](./components/user-search-card.md) per
  result plus a [`PaginationBar`](./components/pagination-bar.md) below the results.
- **Pending requests** (`value="pending"`) — renders
  [`PendingRequestCard`](./components/pending-request-card.md) per pending request (incoming and
  outgoing, both directions — an outgoing request shows an "awaiting" badge instead of accept/decline
  buttons).

`defaultValue` on the `Tabs` picks "pending" when `usePathname()` ends in `/requests` — see
[README.md](./README.md#two-routes-one-component-tree).

## `MediumFindFriendsContent` (Premium/Medium tier)

[`MediumFindFriendsContent.tsx`](../../../../next-js-boilerplate/src/views/find-friends/MediumFindFriendsContent.tsx) —
byte-for-byte the same two-tab layout as `FreeFindFriendsContent`, in a narrower column, plus a
persistent sidebar (`hidden md:block`, so mobile-width browsers lose it even at this tier) rendering
[`SuggestedFriendsPanel`](./components/suggested-friends-panel.md). The search/pending tabs are
**not** duplicated or altered for this tier — same `useFriendSearch`/`useFriendActions` calls, same
components — only the extra sidebar is new.

## Hooks & API

No dedicated `hooks.md` — the two page-local hooks live directly in
[`src/views/find-friends/`](../../../../next-js-boilerplate/src/views/find-friends/) rather than a
shared `hooks/find-friends/` folder:

- [`useFriendSearch.ts`](../../../../next-js-boilerplate/src/views/find-friends/useFriendSearch.ts) —
  debounces the search input 300ms, resets to page 0 on every new query, delegates the actual fetch to
  `searchUsersQueryOptions(query, PAGE_SIZE, skip)` (`PAGE_SIZE = 10`, from
  [`search-utils.ts`](../../../../next-js-boilerplate/src/views/find-friends/search-utils.ts)) — see
  [api.md](./api.md). Client-side filters out the current user from results as a belt-and-suspenders
  check (the backend's `users(search)` query already excludes the caller server-side).
- [`useFriendActions.ts`](../../../../next-js-boilerplate/src/views/find-friends/useFriendActions.ts) —
  a one-line re-export of [`friends/api.md`](../friends/api.md)'s `useFriendActions()`, not a second
  implementation.

Cross-cutting: `useAuth`, `useMessages`, `usePathname`.

- [api.md](./api.md) — full client/server map, including the search endpoint shared with
  [users/list](../users/list/page.md)

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Search discoverable users | [messaging/endpoints.md#list-discoverable-users](../../../backend/messaging-realtime/messaging/endpoints.md#list-discoverable-users) |
| List friends / pending requests | [messaging/endpoints.md#list-friends](../../../backend/messaging-realtime/messaging/endpoints.md#list-friends) · [#list-pending-friend-requests](../../../backend/messaging-realtime/messaging/endpoints.md#list-pending-friend-requests) |
| Send / accept / decline a friend request | [messaging/endpoints.md#send--accept--decline-a-friend-request](../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request) |
| Suggested friends (Medium+ only) | [social-content/friends/endpoints.md#list-suggested-friends](../../../backend/social-content/friends/endpoints.md#list-suggested-friends) |

## Known issues

- [CROSS-017](../../../issues.md#cross-017) — [SuggestedFriendsPanel](./components/suggested-friends-panel.md)
  (Medium+ sidebar) has no way to actually send a request to a suggested person from this panel.
