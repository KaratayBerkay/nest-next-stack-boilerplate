# Posts — Hooks

Vertical: [README.md](./README.md) · Source: [`lib/api/client/posts/query.dart`](../../../../flutter-boilerplate/lib/api/client/posts/query.dart)

Shared across [list](./list/screen.md), [create](./create/screen.md), and [detail](./detail/screen.md)
— all three read providers from this one file, no per-screen hook files exist.

### `postProvider`

`FutureProvider.family<Post, String>` — fetches one post by id. Used by
[detail](./detail/screen.md); re-fetched (not cached-and-reused) whenever `postActionsProvider`
invalidates it after a mutation targeting that post.

### `postCommentsProvider`

`FutureProvider.family<List<Comment>, String>` — fetches a post's comment list, called standalone
(unlike web, where comments arrive bundled inside the `post` query response — see
[comment/endpoints.md § List a post's comments](../../../backend/social-content/comment/endpoints.md#list-a-posts-comments)).
Used by [detail](./detail/screen.md).

### `feedProvider`

Plain, non-paginated `FutureProvider<List<Post>>` — used by [list](./list/screen.md) only. See
[feed/hooks.md](../feed/hooks.md#feedprovider--feedsearchprovider) for the full write-up (this
vertical reuses that same provider, defined in the same file as `paginatedFeedProvider`).

### `postStatsProvider`

Defined in this file but **has zero readers anywhere in the app** — see
[feed/widgets/post-stats-sidebar.md § Known issues](../feed/widgets/post-stats-sidebar.md#known-issues)
([MOB-009](../../../issues.md#mob-009)).

## Cross-cutting hooks used here but not posts-specific

`currentUserProvider` — used by [detail](./detail/screen.md)'s Premium view (with the
[MOB-008](../../../issues.md#mob-008) `isAuthor` bug — see
[detail/screen.md § Known issues](./detail/screen.md#known-issues)).
