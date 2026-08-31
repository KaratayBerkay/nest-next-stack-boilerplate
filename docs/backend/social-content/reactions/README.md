# Reactions (backend)

**Source:** [`nest-js-boilerplate/src/reactions/`](../../../../nest-js-boilerplate/src/reactions/) ·
**Category:** [Social & Content](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

Reactions on a post **or** a comment (never both — enforced by the `ExactlyOneOfPostOrComment`
class-validator constraint on `CreateReactionInput`). One flat `Reaction` row per `(user, target)`
pair; there is no separate delete/remove mutation — toggling is implicit in `createReaction`. Wired
into [`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly
(not demo-gated). GraphQL-only — no REST controller. The resolver's own source comment frames its
purpose explicitly: *"Exercises GraphQL through FK depth (Reaction → Post → User) behind the JWT
guard"* — like `post`/`comment`, real product code, but also part of this codebase's pattern of
letting a genuine feature double as an FK-depth/guard proof (see
[project-tasks/README.md](../project-tasks/README.md) for a case where that pattern produced
*unreachable* code instead).

## Create/toggle semantics — no separate delete mutation

`createReaction` (the only mutation this module exposes) branches three ways on
`(userId, postId, commentId)`:

1. **No existing reaction from this user on this target** → creates one.
2. **An existing reaction of the *same* `type`** → **deletes** it (returns the deleted row with an
   extra `deleted: true` field) — this is how a client "un-reacts."
3. **An existing reaction of a *different* `type`** → updates it in place (switches reaction type,
   same row, no delete+recreate).

A reaction author is notified of neither their own creations toward themselves (skipped when
`targetAuthorId === userId`) nor a delete (case 2 never notifies at all — only the create/switch
branches call `NotificationService.create`).

## Query is target-scoped, not paginated in the usual sense

`reactions(postId, commentId)` requires **at least one** of the two (throws `409` otherwise — a
guard against an unscoped full-table scan) and returns up to 200 rows, oldest-first. There is no
cursor/`take` pagination — a post or comment with over 200 reactions would silently truncate here,
though in practice both `post`'s and `comment`'s own eager-includes already cap at 50-100 and are
what the frontend/mobile actually render (see [Known issues](#known-issues)).

## Depends on

`AuthModule` (guard), `NotificationModule`, `RealtimeModule` (same `feed`/`post:{id}` renew-frame
convention as `post`/`comment`). Also imports `PostModule` without ever injecting `PostService` —
`BE-010` (resolved), the same unused-import shape noted in
[comment/README.md § Depends on](../comment/README.md#depends-on); `create()`'s post/comment lookups
for the notification's target-author resolution go through `PrismaService`'s `include` on the
`reaction.create`/`update` call itself, not a service call.

## Used by

| App | Page / Screen |
|---|---|
| Frontend | [feed](../../../frontend/v1/feed/page.md) (via [ReactionButtons](../../../frontend/v1/feed/components/reaction-buttons.md)) · [posts](../../../frontend/v1/posts/page.md) |
| Mobile | [feed](../../../mobile/v1/feed/screen.md) (via [ReactionButtons](../../../mobile/v1/feed/widgets/reaction-buttons.md)) · [posts list](../../../mobile/v1/posts/list/screen.md) · [posts detail](../../../mobile/v1/posts/detail/screen.md) |

## Known issues

- `BE-010` (resolved) — imports `PostModule` without ever injecting `PostService` —
  see [§ Depends on](#depends-on).
- The standalone `reactions(postId, commentId)` query (as opposed to the `reactions`/`replies`
  fields eagerly included by `post`'s own queries) has no confirmed direct caller on either platform
  — both frontend and mobile always get reaction data as part of a `post`/`postComments`
  response, never by calling `reactions` on its own. Not filed as a numbered issue (low-value, no
  functional impact — the data reaches the UI either way) but worth a second look if this module is
  revisited.
- See [post/README.md § Known issues](../post/README.md#known-issues) for the frontend/mobile gaps
  around the post-level `reactionBreakdown`/`whoReacted` aggregate views built on top of this
  module's data.
