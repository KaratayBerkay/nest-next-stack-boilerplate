# Posts List (screen)

**Route:** `/v1/:lang/posts` (GoRouter name `v1Posts`)
**Router registration:** [`router.dart#L421-L427`](../../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => PostsPageContent(lang: ...)`.
**Entry widget:** `PostsPageContent` in
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/posts/page_view.dart)
**Web equivalent:** none — see [posts/README.md](../README.md)

## What renders here

A standalone "all posts" list — mobile-only, no dedicated web route (web's closest equivalent is the
[feed page](../../../../frontend/v1/feed/page.md) itself). `TierGate`-wrapped:

| Tier | Widget | Behavior |
|---|---|---|
| Free | `_FreePostsView` | upgrade prompt only (`t.postsUpgradeView`, links to `/plans`) — no list at all |
| Basic, Medium | `_PostsView` | the real list |
| Premium | `_PremiumPostsView` | `build()` just returns `_PostsView` — no premium-specific behavior despite the separate class name |

`_PostsView` watches `feedProvider` (a plain, non-paginated `FutureProvider` — see
[hooks.md](../hooks.md) — **not** the same `paginatedFeedProvider` the
[feed screen](../../feed/screen.md) uses, so this list has no infinite scroll and no search, just
every post the query returns in one shot) and renders each with a private `_PostCard` — a
**third**, independent post-card implementation in this codebase, distinct from both
[`components/feed/post_card.dart`](../../feed/widgets/post-card.md) (used by the feed screen) and
`detail_page_view.dart`'s inline post rendering (used by [detail](../detail/screen.md)). `_PostCard`
here has its own simple heart/like icon (via `post.isLikedBy(currentUserId)`) rather than the
4-emoji [ReactionButtons](../../feed/widgets/reaction-buttons.md) widget — reacting calls
`postActionsProvider.toggleReaction(post.id)` with no explicit `type`, so it defaults to `'LIKE'` (see
[api.md § Reactions default to 'LIKE'](../../feed/api.md#reactions-default-to-like)).

A `+` app-bar action navigates to [`/posts/create`](../create/screen.md).

## Calls

`feedProvider` → `FeedListServer.call()` (no pagination args) — same GraphQL query as
[feed](../../feed/screen.md)'s paginated list, see
[api.md § Shape per file](../../feed/api.md#shape-per-file). Reacting calls
`postActionsProvider.toggleReaction()` — see [api.md](../api.md).

## Known issues

None specific to this screen. See [posts/README.md § Known issues](../README.md#known-issues-affecting-this-vertical).
