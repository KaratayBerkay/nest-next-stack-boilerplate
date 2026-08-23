# Comment — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/comment/`](../../../../nest-js-boilerplate/src/comment/)

Resolver: [`comment.resolver.ts`](../../../../nest-js-boilerplate/src/comment/comment.resolver.ts) ·
**Auth:** `SessionAuthGuard` on the whole resolver class. No REST controller exists for this module.

## GraphQL

### List a post's comments

**Kind:** GraphQL Query · **`postComments(postId: ID!): [Comment!]!`**
**Source:** [`comment.resolver.ts#L16-19`](../../../../nest-js-boilerplate/src/comment/comment.resolver.ts),
[`comment.service.ts#L157-171`](../../../../nest-js-boilerplate/src/comment/comment.service.ts)
Top-level comments only (`parentId: null`), newest-first, each with its `replies` (also newest-first)
and `reactions` eagerly included. No pagination — every non-deleted top-level comment and its replies
are returned in one call.
**Used by:** Frontend [posts](../../../frontend/v1/posts/page.md) (fetched as part of `post`'s own
query, not called standalone — see [post/endpoints.md#get-a-single-post](../post/endpoints.md#get-a-single-post));
Mobile [posts detail](../../../mobile/v1/posts/detail/screen.md) (called standalone, direct GraphQL —
this module's queries are never bundled into the `post` query on mobile, unlike web).

### Create a comment

**Kind:** GraphQL Mutation · **`createComment(data: CreateCommentInput!): Comment!`**
**Source:** [`comment.resolver.ts#L21-27`](../../../../nest-js-boilerplate/src/comment/comment.resolver.ts),
input [`create-comment.input.ts`](../../../../nest-js-boilerplate/src/comment/dto/create-comment.input.ts)
**Input:** `postId` (UUID, required) · `body` (string, min 1 char) · `parentId?` (UUID) ·
`imageUrl?` (string).
**Errors:** `409 EX_CONFLICT_DUPLICATE` (`"You have already replied to this comment"` — only checked
when `parentId` is present, see [README § What this module owns](./README.md#what-this-module-owns)).
**Realtime side-effect:** notifies the post's author (skipped if they're the commenter), invalidates
`cache:post:{postId}` + `cache:feed:*`, emits `feed` + `post:{postId}` renew frames.
**Used by:** Frontend [CommentSection](../../../frontend/v1/feed/components/comment-section.md) (both
[feed](../../../frontend/v1/feed/page.md) and [posts](../../../frontend/v1/posts/page.md) render this
same component); Mobile [CommentSection](../../../mobile/v1/feed/widgets/comment-section.md) (feed)
and [posts detail](../../../mobile/v1/posts/detail/screen.md) (its own inline comment composer, not
the shared widget — see that screen's doc).

### Update a comment

**Kind:** GraphQL Mutation · **`updateComment(id: ID!, data: UpdateCommentInput!): Comment!`**
**Source:** [`comment.resolver.ts#L29-36`](../../../../nest-js-boilerplate/src/comment/comment.resolver.ts),
input [`update-comment.input.ts`](../../../../nest-js-boilerplate/src/comment/dto/update-comment.input.ts)
**Input:** `body` (string, min 1 char, **required** — unlike `updatePost`, there's no partial-patch
mode for comments) · `imageUrl?`.
**Errors:** `404` (missing/deleted) · `403 EX_FORBIDDEN` (`"Not your comment"`).
**Used by:** Frontend [CommentSection](../../../frontend/v1/feed/components/comment-section.md)
(edit-in-place, both feed and posts pages); Mobile
[CommentSection](../../../mobile/v1/feed/widgets/comment-section.md) (feed only — the posts-detail
screen's own inline comment list has no edit affordance, see
[mobile/v1/posts/detail/screen.md](../../../mobile/v1/posts/detail/screen.md)).

### Delete a comment

**Kind:** GraphQL Mutation · **`deleteComment(id: ID!): Comment!`**
**Source:** [`comment.resolver.ts#L38-44`](../../../../nest-js-boilerplate/src/comment/comment.resolver.ts)
Soft delete, same 404/403 rules as update.
**Used by:** same as update — Frontend
[CommentSection](../../../frontend/v1/feed/components/comment-section.md); Mobile
[CommentSection](../../../mobile/v1/feed/widgets/comment-section.md) (feed only).

## Known issues

None specific to this endpoint set. See [README.md § Known issues](./README.md#known-issues).
