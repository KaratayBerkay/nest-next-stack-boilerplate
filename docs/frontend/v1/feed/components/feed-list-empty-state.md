# FeedListEmptyState

**Source:** [`FeedListEmptyState.tsx`](../../../../../next-js-boilerplate/src/components/feed/FeedListEmptyState.tsx)
**Used in:** `FreeFeedList`/`MediumFeedList`/`PremiumFeedList` (see [page.md](../page.md#components)),
when the feed has zero posts
**Mobile equivalent:** [FeedListEmptyState widget](../../../../mobile/v1/feed/widgets/feed-list-empty-state.md)

## Purpose

A centered empty-state message with a "be the first to share" link to
[`/v1/{lang}/share`](../../share/page.md). Purely presentational, no props, no API calls.

## Calls

None — a plain `<Link>` to the [share page](../../share/page.md).
