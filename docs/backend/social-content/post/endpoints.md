# Post — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/post/`](../../../../nest-js-boilerplate/src/post/)

Resolver: [`post.resolver.ts`](../../../../nest-js-boilerplate/src/post/post.resolver.ts) ·
**Auth:** `SessionAuthGuard` on the whole resolver class — see
[identity-access/auth](../../identity-access/auth/README.md). No REST controller exists for this
module.

## GraphQL

### List the feed

**Kind:** GraphQL Query · **`postList(cursor: ID, take: Int, search: String): [Post!]!`**
**Source:** [`post.resolver.ts#L135-142`](../../../../nest-js-boilerplate/src/post/post.resolver.ts),
[`post.service.ts#L147-191`](../../../../nest-js-boilerplate/src/post/post.service.ts)
Cursor-paginated (`take` requested + 1 fetched, caller slices), newest-first, `status: PUBLISHED` and
`deletedAt: null` only. `search` does a case-insensitive `OR` `contains` match against `title` and
`content`. Cached 30s per exact `{cursor, take, search}` key.
**Used by:** Frontend [feed](../../../frontend/v1/feed/page.md); Mobile
[feed](../../../mobile/v1/feed/screen.md), [posts list](../../../mobile/v1/posts/list/screen.md).

### Get a single post

**Kind:** GraphQL Query · **`post(id: ID!): Post`**
**Source:** [`post.resolver.ts#L144-147`](../../../../nest-js-boilerplate/src/post/post.resolver.ts),
[`post.service.ts#L193-252`](../../../../nest-js-boilerplate/src/post/post.service.ts)
Returns `null` (not an error) for a missing or soft-deleted post — callers must check for a null
result themselves. Eagerly includes up to 100 top-level+reply comments (newest-first) and up to 100
reactions inline, each comment with its own up-to-50 reactions. Cached 60s per post id.
**Used by:** Frontend [posts](../../../frontend/v1/posts/page.md); Mobile
[posts detail](../../../mobile/v1/posts/detail/screen.md).

### Create a post

**Kind:** GraphQL Mutation · **`createPost(data: CreatePostInput!): Post!`**
**Source:** [`post.resolver.ts#L149-155`](../../../../nest-js-boilerplate/src/post/post.resolver.ts),
input [`create-post.input.ts`](../../../../nest-js-boilerplate/src/post/dto/create-post.input.ts)
**Input:** `title` (string, 3-200 chars) · `content` (string, min 1 char, no max) · `coverImage?`
(string, raw bytes as a string — see [README § coverImage vs imageUrl](./README.md#what-this-module-owns))
· `imageUrl?` (string).
**Behavior:** slug is auto-derived from `title` (`slugify` + a base-36 timestamp suffix for
uniqueness), `status` is always `PUBLISHED` immediately (no draft state reachable from this
mutation), `publishedAt` set to now. Enqueues a friend-post notification to every accepted friend of
the author (fire-and-forget — failure is logged, not thrown) and emits a `feed` realtime renew frame.
**Used by:** Frontend [share](../../../frontend/v1/share/page.md) via
[api.md#create-a-post-bff-route](../../../frontend/v1/share/api.md); Mobile
[share](../../../mobile/v1/share/screen.md), [posts create](../../../mobile/v1/posts/create/screen.md)
(direct GraphQL, both).

### Update a post

**Kind:** GraphQL Mutation · **`updatePost(id: ID!, data: UpdatePostInput!): Post!`**
**Source:** [`post.resolver.ts#L157-164`](../../../../nest-js-boilerplate/src/post/post.resolver.ts),
input [`update-post.input.ts`](../../../../nest-js-boilerplate/src/post/dto/update-post.input.ts)
**Input:** same four fields as create, all optional — only fields present in the request are patched
(`undefined` vs explicit `null` matters: an explicit `null` for `coverImage`/`imageUrl` clears it,
`undefined`/absent leaves it untouched).
**Errors:** `404` (post missing or already soft-deleted) · `403 EX_FORBIDDEN` (`msg: "Not your
post"`, caller isn't the author — no moderator override).
**Realtime side-effect:** invalidates `cache:post:{id}` + `cache:feed:*`, emits renew frames to both
the `feed` topic and the post's own `post:{id}` topic (so an open post-detail view picks up the edit
live).
**Used by:** Frontend [posts](../../../frontend/v1/posts/page.md) (`PostEditForm`), the feed's inline
edit in [PostCard](../../../frontend/v1/feed/components/post-card.md); Mobile
[posts detail](../../../mobile/v1/posts/detail/screen.md) — ⚠ not reachable in practice, see
[MOB-008](../../../issues.md#mob-008).

### Delete a post

**Kind:** GraphQL Mutation · **`deletePost(id: ID!): Post!`**
**Source:** [`post.resolver.ts#L166-172`](../../../../nest-js-boilerplate/src/post/post.resolver.ts)
Soft delete (`deletedAt` stamped) — same 404/403 rules and cache/renew side-effects as update.
**Used by:** Frontend [posts](../../../frontend/v1/posts/page.md), feed's
[PostCard](../../../frontend/v1/feed/components/post-card.md); Mobile
[posts detail](../../../mobile/v1/posts/detail/screen.md) — ⚠ not reachable in practice (no delete
action exists on the real, routed mobile detail screen at all — see
[MOB-008](../../../issues.md#mob-008)).

### Get my post stats

**Kind:** GraphQL Query · **`myPostStats: PostStats!`** (`{totalPosts, totalReactions,
avgReactionsPerPost}`)
**Source:** [`post.resolver.ts#L128-133`](../../../../nest-js-boilerplate/src/post/post.resolver.ts),
[`post.service.ts#L254-269`](../../../../nest-js-boilerplate/src/post/post.service.ts)
**Auth:** `TierGuard` + `@MinTier(MEDIUM)` on top of the resolver-wide session guard — Free/Basic
callers get a `403`. Computed live from the caller's own published, non-deleted posts (no cache).
**Used by:** Frontend [PostStatsSidebar](../../../frontend/v1/feed/components/post-stats-sidebar.md);
Mobile [PostStatsSidebar](../../../mobile/v1/feed/widgets/post-stats-sidebar.md) — ⚠ wired
server-side but the mobile widget's load callback is never connected at its call site, see
[MOB-009](../../../issues.md#mob-009).

### `Post.reactionBreakdown` (resolved field)

**Kind:** GraphQL Query (field resolver) · **`Post.reactionBreakdown: [ReactionCount!]!`**
(`{type, count}`, grouped from the post's own eagerly-loaded `reactions`)
**Source:** [`post.resolver.ts#L101-114`](../../../../nest-js-boilerplate/src/post/post.resolver.ts)
**Auth:** `TierGuard` + `@MinTier(MEDIUM)` — a Free/Basic caller who requests this field in their
query gets a field-level `403`.
**Used by:** Frontend [ReactionBreakdown](../../../frontend/v1/posts/components/reaction-breakdown.md)
— ⚠ [FE-009](../../../issues.md#fe-009): never actually requested by the frontend's `POST_QUERY`, so
this component always renders nothing in practice despite the field working correctly server-side.
No mobile query requests this field either (mobile's `Post` type has no `reactionBreakdown`
equivalent at all — its own, differently-shaped "reaction breakdown" widget exists only in
[the dead post-detail tree](../../../mobile/v1/posts/detail/screen.md#known-issues)).

### `Post.whoReacted` (resolved field)

**Kind:** GraphQL Query (field resolver) · **`Post.whoReacted: [Reactor!]!`** (`{userId, name,
type}`, one row per reaction)
**Source:** [`post.resolver.ts#L116-126`](../../../../nest-js-boilerplate/src/post/post.resolver.ts)
**Auth:** `TierGuard` + `@MinTier(PREMIUM)`.
**Used by:** Frontend [WhoReacted](../../../frontend/v1/posts/components/who-reacted.md) — same
[FE-009](../../../issues.md#fe-009) gap as `reactionBreakdown` above. No mobile consumer — the only
mobile widget with this name is unrouted dead code with fully hardcoded placeholder data, see
[MOB-008](../../../issues.md#mob-008).

## Known issues

See [README.md § Known issues](./README.md#known-issues).
