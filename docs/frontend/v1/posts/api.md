# Posts — API

Page: [page.md](./page.md) · Client: [`src/api/client/posts/`](../../../../next-js-boilerplate/src/api/client/posts/) ·
Server (BFF): [`src/api/server/posts/`](../../../../next-js-boilerplate/src/api/server/posts/)

**This is the owning doc for the whole `post`/`comment`/`reactions` API surface.** [feed](../feed/api.md)
and [share](../share/api.md) both reuse every file documented here rather than each maintaining their
own copy — see [conventions.md § 2](../../../conventions.md#2-file-naming).

**Three layers, not two**, the same shape as [messages/api.md](../messages/api.md):
each `src/api/server/posts/*.ts` file is a client-executed, same-origin typed wrapper (`apiFetch`) —
despite the `server` folder name, it does not call the backend directly. The actual BFF layer is the
matching [`src/app/api/posts/**/route.ts`](../../../../next-js-boilerplate/src/app/api/posts/) /
`app/api/comments/**` / `app/api/reactions/**` Route Handler, which runs server-side, resolves the
access token from cookies, and calls the backend's **GraphQL** endpoint — confirmed by reading every
one of these route files directly (not inferred): `post`/`comment`/`reactions` have no REST
controller at all (see each module's backend README), so every REST-shaped call from this vertical's
frontend is a GraphQL mutation/query underneath, exactly like [share](../share/page.md)'s create-post
call.

```
Browser (component) → api/client hook → api/server/*.ts (apiFetch, same-origin)
  → app/api/{posts,comments,reactions}/**/route.ts (real BFF: cookie→header bridge, builds a
    GraphQL request from the REST-shaped body, calls the backend's /graphql)
    → NestJS backend (post / comment / reactions GraphQL resolvers)
```

One exception: [`fetchPostStatsServer`](#get-my-post-stats-client) skips the dedicated per-action BFF
routes below and instead posts a raw GraphQL query string to
[`/api/gql`](../../../../next-js-boilerplate/src/app/api/gql/route.ts) — a **generic**, authenticated
GraphQL passthrough route (cookie→bearer translation, forwards the request body verbatim to the
backend's `/graphql`) rather than a per-action wrapper. Every other action in this vertical uses the
per-action route pattern above.

## Client (`src/api/client/posts/`)

| File | Exports | Purpose |
|---|---|---|
| [`actions.ts`](../../../../next-js-boilerplate/src/api/client/posts/actions.ts) | `usePostActions()` (`createPost`, `updatePost`, `deletePost`, `toggleReaction`, `createComment`, `updateComment`, `deleteComment`) | The mutation layer every component in this vertical calls — see per-action detail below |
| [`query.ts`](../../../../next-js-boilerplate/src/api/client/posts/query.ts) | `feedListQueryOptions`, `singlePostQueryOptions` | React Query option builders — documented in [feed/api.md](../feed/api.md) (`feedListQueryOptions`, feed-owned) and below (`singlePostQueryOptions`, posts-owned) |

Unlike [messages](../messages/api.md)'s `useMessageActions`, `usePostActions` does **no** optimistic
cache patching of its own — every mutation just calls its BFF route then invalidates the
`["feed"]`/`["posts"]` query trees wholesale (`invalidate()`, called after every one of the 7
actions). Optimistic UI, where it exists in this vertical, lives in the calling component instead
(e.g. [CommentSection](../feed/components/comment-section.md)'s own `pendingComments` state).

### Create a post (client)

`usePostActions().createPost(title, content, imageUrl?)` → `createPostServer()` → BFF → backend
[`createPost`](../../../backend/social-content/post/endpoints.md#create-a-post). No optimistic
insertion — the caller ([share](../share/page.md)) navigates away on success instead of needing one.

### Update / delete a post (client)

`usePostActions().updatePost(id, title, content)` / `.deletePost(id)` → `updatePostServer()` /
`deletePostServer()` → BFF → backend
[`updatePost`](../../../backend/social-content/post/endpoints.md#update-a-post) /
[`deletePost`](../../../backend/social-content/post/endpoints.md#delete-a-post). Called from
[PostCard](../feed/components/post-card.md) (feed, inline edit) and this page's own edit/delete flow
(`PostDetailContent.handleSave`/`handleDelete`).

### Toggle a reaction (client)

`usePostActions().toggleReaction({type, postId?, commentId?})` → `toggleReactionServer()` → BFF →
backend [`createReaction`](../../../backend/social-content/reactions/endpoints.md#create--toggle-a-reaction).
Called from every [ReactionInline](../feed/components/reaction-buttons.md) instance across both this
page and feed.

### Comments (client)

`usePostActions().createComment(postId, body, parentId?)` / `.updateComment(commentId, body)` /
`.deleteComment(commentId)` → `createCommentServer()` / `updateCommentServer()` /
`deleteCommentServer()` (all three in one file,
[`comments.ts`](../../../../next-js-boilerplate/src/api/server/posts/comments.ts)) → BFF → backend
[`createComment`](../../../backend/social-content/comment/endpoints.md#create-a-comment) /
[`updateComment`](../../../backend/social-content/comment/endpoints.md#update-a-comment) /
[`deleteComment`](../../../backend/social-content/comment/endpoints.md#delete-a-comment). Called from
[CommentSection](../feed/components/comment-section.md) (both this page and feed).

### Get my post stats (client)

`fetchPostStatsServer()` — **not** part of `usePostActions()`, called directly by
[PostStatsSidebar](../feed/components/post-stats-sidebar.md). Posts a raw `myPostStats` query string
to the generic `/api/gql` passthrough (see the "One exception" note above) rather than a dedicated
route → backend [`myPostStats`](../../../backend/social-content/post/endpoints.md#get-my-post-stats).

### `singlePostQueryOptions` (posts-owned query builder)

**Source:** [`query.ts#L23-32`](../../../../next-js-boilerplate/src/api/client/posts/query.ts)
Builds `["posts", uuid]` query options, lazy-`import()`ing `fetchSinglePostServer`. Used by both this
page's `useSuspenseQuery` and [PostCard](../feed/components/post-card.md)'s own per-card re-fetch.

## Server / BFF routes (`src/api/server/posts/`)

| File | BFF route(s) | Backend endpoint |
|---|---|---|
| [`create.ts`](../../../../next-js-boilerplate/src/api/server/posts/create.ts) | `POST /api/posts` | [Create a post](../../../backend/social-content/post/endpoints.md#create-a-post) |
| [`update.ts`](../../../../next-js-boilerplate/src/api/server/posts/update.ts) | `PUT /api/posts/{id}` | [Update a post](../../../backend/social-content/post/endpoints.md#update-a-post) |
| [`delete.ts`](../../../../next-js-boilerplate/src/api/server/posts/delete.ts) | `DELETE /api/posts/{id}` | [Delete a post](../../../backend/social-content/post/endpoints.md#delete-a-post) |
| [`list.ts`](../../../../next-js-boilerplate/src/api/server/posts/list.ts) | `GET /api/posts` | [List the feed](../../../backend/social-content/post/endpoints.md#list-the-feed) — feed-owned, documented here since it shares this file's BFF route |
| [`single.ts`](../../../../next-js-boilerplate/src/api/server/posts/single.ts) | `GET /api/posts/{id}` | [Get a single post](../../../backend/social-content/post/endpoints.md#get-a-single-post) |
| [`comments.ts`](../../../../next-js-boilerplate/src/api/server/posts/comments.ts) | `POST /api/comments`, `PUT`/`DELETE /api/comments/{id}` | [comment/endpoints.md](../../../backend/social-content/comment/endpoints.md) |
| [`reactions.ts`](../../../../next-js-boilerplate/src/api/server/posts/reactions.ts) | `POST /api/reactions` | [Create / toggle a reaction](../../../backend/social-content/reactions/endpoints.md#create--toggle-a-reaction) |
| [`stats.ts`](../../../../next-js-boilerplate/src/api/server/posts/stats.ts) | `POST /api/gql` (generic passthrough, not a dedicated route) | [Get my post stats](../../../backend/social-content/post/endpoints.md#get-my-post-stats) |
| [`upload.ts`](../../../../next-js-boilerplate/src/api/server/posts/upload.ts) | `POST /api/upload` | [Upload a single image](../../../backend/messaging-realtime/upload/endpoints.md#upload-a-single-image); used by [share](../share/page.md), not this page |

### List the feed (BFF route)

**Source:** [`app/api/posts/route.ts` § `GET`](../../../../next-js-boilerplate/src/app/api/posts/route.ts) —
builds `postList(cursor, take, search)`, reshapes the response to `{posts, hasMore, nextCursor}`
(cursor pagination computed BFF-side: fetches `take + 1`, slices, and derives `hasMore`/`nextCursor`
from whether the extra row came back — the same pattern the page's own SSR fetch in
[page.md](./page.md) duplicates independently).

### Create a post (BFF route)

**Source:** [`app/api/posts/route.ts` § `POST`](../../../../next-js-boilerplate/src/app/api/posts/route.ts) —
CSRF-echoed (`csrfEchoHeaders()`, `403` if missing/invalid), validates `title`/`content` present
before calling the backend, forwards `coverImage`/`imageUrl` through unchanged if present in the
request body (though see [BE-011](../../../issues.md#be-011) /
[post/README.md](../../../backend/social-content/post/README.md#what-this-module-owns): no real
caller ever sends `coverImage`).

### Everything else

`app/api/posts/[id]/route.ts` (`GET`/`PUT`/`DELETE`), `app/api/comments/route.ts` (`POST`),
`app/api/comments/[id]/route.ts` (`PUT`/`DELETE`), `app/api/reactions/route.ts` (`POST`) all follow
the same shape: resolve the access token from cookies, CSRF-echo on every mutation (not on the `GET`s
— GraphQL queries don't need it, same rule as
[identity-access/auth](../../../backend/identity-access/auth/README.md#sessionauthguard--validation-order)'s
"CSRF only applies to mutations"), call the matching backend mutation/query, and normalize errors to
`{statusCode, exc, msg, key}` via `graphqlErrorBody()`/`graphqlErrorStatus()` — the same error-mapping
helper (`src/lib/backend.ts`) used across this codebase's BFF layer.
