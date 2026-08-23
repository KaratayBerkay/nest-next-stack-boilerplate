# Comment (backend)

**Source:** [`nest-js-boilerplate/src/comment/`](../../../../nest-js-boilerplate/src/comment/) ·
**Category:** [Social & Content](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

Comments on a post, with exactly one level of threaded replies. `comment` is **not** a nested
GraphQL type under `post`'s resolver — verified by reading source, not assumed — it's a fully
independent `CommentResolver`/`CommentModule` with its own `postComments`/`createComment`/
`updateComment`/`deleteComment` operations, related to a post only by a flat `postId` scalar (and to
a parent comment by an equally flat, optional `parentId`). Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly (not
demo-gated). GraphQL-only — no REST controller.

- **Replies are capped at one level.** `parentId` points at a top-level comment; a reply's own
  `parentId` is never followed further by `findByPost` (it eagerly includes only direct `replies` of
  each top-level comment, ordered newest-first) — replying to a reply would still persist (nothing in
  `create()` checks the parent's own `parentId`), but has nowhere to render.
- **One reply per (author, parent) pair.** `create()` throws `409 EX_CONFLICT_DUPLICATE` (`"You have
  already replied to this comment"`) if the same author already has a non-deleted reply under the
  same `parentId` — a business rule with no equivalent limit on top-level comments (an author can post
  unlimited top-level comments on the same post).
- **Ownership check on write**: same shape as `post` — `update`/`delete` 404 on missing/deleted, `403
  EX_FORBIDDEN` (`"Not your comment"`) if the caller isn't the author. No moderator override.
- **Soft delete only** — `deletedAt` stamped, every read path filters it out.
- **Comment notification**: `create()` notifies the **post's** author (not the parent comment's
  author, even for a reply) with a truncated (100-char) preview of the comment body — skipped
  entirely if the commenter is the post's own author.
- **No cache-aside of its own** — reads happen exclusively through `post`'s own cached
  `findOne`/`findAll` (comments are eagerly included there); this module invalidates `post`'s cache
  keys (`cache:post:{postId}`, `cache:feed:*`) on every write but never reads through
  `CacheAsideService` itself.

## Depends on

`AuthModule` (guard), `NotificationModule`, `RealtimeModule` (feed renew frames — same
`emitToTopic('feed', ...)` / `emitToTopic('post:{id}', ...)` convention as `post`, see
[social-content/README.md](../README.md#how-the-pieces-fit-together)). Also imports `PostModule` in
its `@Module.imports` — ⚠ [BE-010](../../../issues.md#be-010): never actually injects `PostService`:
both `create()`'s post-lookup (for the notification's post title) and every ownership check go
straight through `PrismaService` instead. Harmless (NestJS DI tolerates an unused module import), but
worth knowing if you're tracing why `PostModule` is a dependency here — see
[reactions/README.md § Depends on](../reactions/README.md#depends-on) for the identical pattern in
that module.

## Used by

| App | Page / Screen |
|---|---|
| Frontend | [feed](../../../frontend/v1/feed/page.md) (inline, via [CommentSection](../../../frontend/v1/feed/components/comment-section.md)) · [posts](../../../frontend/v1/posts/page.md) |
| Mobile | [feed](../../../mobile/v1/feed/screen.md) (inline, via [CommentSection](../../../mobile/v1/feed/widgets/comment-section.md)) · [posts detail](../../../mobile/v1/posts/detail/screen.md) |

## Known issues

- [BE-010](../../../issues.md#be-010) — imports `PostModule` without ever injecting `PostService` —
  see [§ Depends on](#depends-on).

See also [post/README.md § Known issues](../post/README.md#known-issues) for the reaction-breakdown/
who-reacted gaps that also touch comment-level reactions indirectly (a comment's own `reactions` are
requested and rendered correctly on both platforms — only the post-level tier-gated fields are
affected).
