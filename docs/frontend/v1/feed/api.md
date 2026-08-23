# Feed — API

Page: [page.md](./page.md) · This page's own query file:
[`src/api/client/posts/query.ts`](../../../../next-js-boilerplate/src/api/client/posts/query.ts)
(`feedListQueryOptions`) · Server fetch:
[`src/api/server/posts/list.ts`](../../../../next-js-boilerplate/src/api/server/posts/list.ts)

**This page does not own a separate API layer.** Every file it calls lives in `src/api/client/posts/`
and `src/api/server/posts/`, which the [posts](../posts/page.md) vertical owns and fully documents in
[posts/api.md](../posts/api.md) — this page only adds one query-option builder of its own,
`feedListQueryOptions`, and otherwise reuses `posts`'s mutation layer (`usePostActions`) directly.

## `feedListQueryOptions` (this page's own)

**Source:** [`query.ts#L3-21`](../../../../next-js-boilerplate/src/api/client/posts/query.ts)
Builds the React Query options for `["feed","list",search,cursor]`, lazy-`import()`ing
[`fetchFeedListServer`](../posts/api.md#list-the-feed-bff-route) to keep server-only code out of the
initial client bundle (same pattern as [messages/api.md](../messages/api.md)'s query builders).
`staleTime: 30_000`.
**Used by:** [FreeFeedList/MediumFeedList/PremiumFeedList](./components/post-card.md) (the initial
page load, seeded with the SSR-fetched `initialFeedData` when there's no active search) and
[`handleLoadMore`](./hooks.md#feed-list-actionsts) (subsequent pages, called directly rather than
through this options builder).

## Every action this page triggers, and where it's documented

| Action | Client hook | Backend endpoint |
|---|---|---|
| Create a post | [posts/api.md § Create a post](../posts/api.md#create-a-post-client) (via [share](../share/page.md), not this page) | [post/endpoints.md#create-a-post](../../../backend/social-content/post/endpoints.md#create-a-post) |
| Update / delete a post | [posts/api.md § Update / delete a post](../posts/api.md#update--delete-a-post-client) | [post/endpoints.md](../../../backend/social-content/post/endpoints.md) |
| Toggle a reaction | [posts/api.md § Toggle a reaction](../posts/api.md#toggle-a-reaction-client) | [reactions/endpoints.md](../../../backend/social-content/reactions/endpoints.md#create--toggle-a-reaction) |
| Create / update / delete a comment | [posts/api.md § Comments](../posts/api.md#comments-client) | [comment/endpoints.md](../../../backend/social-content/comment/endpoints.md) |
| Load my post stats | [posts/api.md § Get my post stats](../posts/api.md#get-my-post-stats-client) | [post/endpoints.md#get-my-post-stats](../../../backend/social-content/post/endpoints.md#get-my-post-stats) |

All of the above go **direct GraphQL via the Next.js BFF** — see
[posts/api.md](../posts/api.md) for the full three-layer chain (`api/client` → `api/server`
(same-origin fetch) → `app/api/**/route.ts` (real BFF, GraphQL to the backend)) shared by this page,
[posts](../posts/page.md), and [share](../share/page.md).

## Realtime (bypasses the BFF, same as messages)

This page watches the `feed` topic (`realtime?.watch("feed")`, unwatched on unmount) directly over
the WebSocket connection opened by [`RealtimeProvider`](../messages/api.md#websocket-bypasses-the-bff-entirely-for-this-vertical)
— no Next.js hop, same mechanism the messages vertical uses. See
[realtime/README.md](../../../backend/messaging-realtime/realtime/README.md) for the connection/auth
model and [hooks.md § Realtime refresh](./hooks.md#realtime-refresh-not-a-hook--a-query-cache-flag)
for how a `Feed` renew frame reaches this page's list.
