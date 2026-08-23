# Feed — Hooks

Screen: [screen.md](./screen.md) · Source: [`lib/api/client/posts/query.dart`](../../../../flutter-boilerplate/lib/api/client/posts/query.dart)

Mobile has no separate `hooks/feed/` folder — pagination state is a Riverpod
`StateNotifierProvider` living directly in the `posts` API client layer, shared with
[posts](../posts/README.md). Documented once here since `screen.md` is this provider's primary
consumer; [posts](../posts/api.md) links back to this doc rather than repeating it.

### `paginatedFeedProvider` / `PaginatedFeedNotifier`

[Source](../../../../flutter-boilerplate/lib/api/client/posts/query.dart) — a `StateNotifier` holding
`PaginatedFeedState {posts, cursor, hasMore, isLoadingMore, isInitialLoading, error}`. `_initialLoad()`
runs in the constructor (fetches page 1 immediately on first read); `loadMore()` is guarded against
concurrent calls (`isLoadingMore`) and a missing cursor; `refresh()` resets to page 1 (used by
[FeedBaseView](./screen.md#layout-search-list-and-sidebar)'s `RefreshIndicator` pull-to-refresh, which
web has no equivalent gesture for). This is Riverpod's answer to React Query's `useInfiniteQuery` —
compare with [feed/hooks.md (web)](../../../frontend/v1/feed/hooks.md)'s `feed-list-actions.ts`,
which manages the same shape of state (`extraPosts`/`extraHasMore`/cursor ref) by hand against a
plain React Query cache instead of a dedicated notifier class.

### `feedProvider` / `feedSearchProvider`

Two more `FutureProvider`s in the same file: `feedProvider` (a plain, non-paginated fetch — used only
by [posts list](../posts/list/screen.md), not this screen) and `feedSearchProvider`
(`FutureProvider.family<List<Post>, String>`, one-shot per search string, **not debounced** — every
keystroke in the search box triggers a fresh request once the family key changes, unlike web's search
which shares the same debounce-free-but-request-per-keystroke behavior via its own `search` state,
so this is actually parity, not a regression).

## Cross-cutting hooks used here but not feed-specific

`currentUserProvider` (from `hooks/use_auth.dart`) — used by the Premium tier view's `isOwnPost`
check; documented where first introduced.
