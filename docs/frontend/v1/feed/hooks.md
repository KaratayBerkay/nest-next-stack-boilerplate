# Feed — Hooks

Page: [page.md](./page.md) · Source: [`src/lib/feed/feed-list-actions.ts`](../../../../next-js-boilerplate/src/lib/feed/feed-list-actions.ts),
[`src/hooks/usePostHashScroll.ts`](../../../../next-js-boilerplate/src/hooks/usePostHashScroll.ts)

This page has no dedicated `hooks/feed/` folder — its list-pagination logic lives as a handful of
plain exported functions (not React hooks) in `src/lib/feed/`, called directly from
[`FreeFeedList`/`MediumFeedList`/`PremiumFeedList`](./components/post-card.md)'s local `useState`.
The mutation layer those handlers eventually call (`usePostActions`) is documented once in
[posts/hooks.md](../posts/hooks.md) and [posts/api.md](../posts/api.md), since `posts` owns the
shared `api/client/posts/` layer both this page and [share](../share/page.md) also use.

### `feed-list-actions.ts`

[Source](../../../../next-js-boilerplate/src/lib/feed/feed-list-actions.ts) — four plain functions,
not hooks, all taking their state setters as explicit params (called from inside the list
component's own `useCallback`s):

- **`handleLoadMore`** — fetches the next page via `fetchFeedListServer` directly (bypassing React
  Query's cache — the loaded page is appended to a separate `extraPosts` local-state array, not
  merged into the `["feed","list",...]` query cache). Guarded by a ref-based in-flight lock
  (`loadingRef.current`) so a fast double-scroll can't double-fire.
  See [api.md](./api.md).
- **`handleToggleComments`** — pure state toggle (`expandedPostId`), no network call — expanding a
  card is what makes [PostActions](./components/post-actions.md) mount
  [CommentSection](./components/comment-section.md) and fetch comments.
- **`handleDeletePost`** — removes a post from the local `extraPosts` array only; the real delete
  network call happens inside [PostCard](./components/post-card.md) itself via `usePostActions`, this
  function is just the "also drop it from local infinite-scroll state" half.
- **`refreshFeedList`** — resets pagination to page 1 and invalidates the `["feed","list",search]`
  query; wired to a realtime `Feed` renew frame (see below), not called from any user action
  directly.

### `usePostHashScroll`

[Source](../../../../next-js-boilerplate/src/hooks/usePostHashScroll.ts) — on mount, if the URL has
a `#post-{id}` fragment (set by [notification deep-linking](../../../../next-js-boilerplate/src/lib/notifications/target.ts)
when a notification's target already includes a hash, or by any other page linking into a specific
feed item), polls for that post's DOM node (`#post-{id}`, rendered by
[PostCard](./components/post-card.md)) every 200ms for up to 5s and smooth-scrolls to it once found
— needed because the target post may not be in the initially-loaded page yet.

## Realtime refresh (not a hook — a query-cache flag)

`FeedList` sets `["feed","new-flag"]` to `false` on mount and watches it via `useQuery`; a `Feed`
realtime renew frame (emitted by every [post](../../../backend/social-content/post/endpoints.md)/
[comment](../../../backend/social-content/comment/endpoints.md)/
[reaction](../../../backend/social-content/reactions/endpoints.md) mutation, including ones made by
*other* users) flips that flag true elsewhere in the realtime event-dispatch layer (not shown in this
file — see [messages/hooks.md](../messages/hooks.md) for the analogous `event-dispatch.ts`
mechanism), which triggers `refreshFeedList` after a `setTimeout(0)`. This is how a new post from a
friend appears without a manual page reload.

## Cross-cutting hooks used here but not feed-specific

`useAuth`, `useRealtime`, `useYSwipeGesture`, `useMessages` — defined outside this vertical and
shared across pages; documented where first introduced rather than repeated here.
