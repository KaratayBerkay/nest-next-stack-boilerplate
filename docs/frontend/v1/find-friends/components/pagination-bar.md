# PaginationBar (component)

**Source:** [`PaginationBar.tsx`](../../../../../next-js-boilerplate/src/views/find-friends/PaginationBar.tsx)
**Used in:** [find-friends page](../page.md) — "Add friends" tab, below the search results, both tiers
**Mobile equivalent:** none — see [Known issues](#known-issues)

## Purpose

Pure presentational pager built on the shared
[`Pagination`](../../../../../next-js-boilerplate/src/components/ui/Pagination.tsx) primitives.
Computes a windowed page list (first, last, current ±1, `"..."` elsewhere) from `page`/`totalPages`
props; renders nothing (`return null`) when `totalPages <= 1`. No internal state, no data fetching —
`onPageChange` is a prop, called by [`useFriendSearch`](../page.md#hooks--api)'s `goToPage`.

## Props

```ts
{ page, totalPages, onPageChange, prevLabel, nextLabel }
```

## Calls

None directly — `onPageChange` bubbles up to `useFriendSearch`'s `goToPage`, which just updates local
page state; the actual next request goes through
[`searchUsersQueryOptions`](../api.md#user-search) →
[messaging/endpoints.md#list-discoverable-users](../../../../backend/messaging-realtime/messaging/endpoints.md#list-discoverable-users).

## Known issues

- Mobile has an unused, byte-for-byte-equivalent port of this component
  (`views/find_friends/pagination_bar.dart`) — see
  `MOB-005` (resolved) and
  [mobile find-friends § Known issues](../../../../mobile/v1/find-friends/screen.md#known-issues).
  None of mobile's three real search implementations (Medium, Premium, and the shared search-results
  builder) paginate at all — they render every result in one `ListView.builder`.
