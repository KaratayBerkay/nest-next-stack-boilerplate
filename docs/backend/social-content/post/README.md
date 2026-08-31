# Post (backend)

**Source:** [`nest-js-boilerplate/src/post/`](../../../../nest-js-boilerplate/src/post/) ·
**Category:** [Social & Content](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

The content graph's root entity: create/read/update/soft-delete a post, list/paginate/search the
public feed, and the two tier-gated `@ResolveField`s (`reactionBreakdown`, `whoReacted`) that expose
richer reaction data to Medium/Premium-tier viewers. Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly (not
demo-gated) — see [`post.module.ts`](../../../../nest-js-boilerplate/src/post/post.module.ts).
`PostResolver` is **GraphQL-only** — there is no REST controller.

- **Author + friend-post notification**: `create()` resolves the author's friend list (preferring the
  `SessionAuthGuard` snapshot already on the JWT, falling back to `FriendsService.getFriendIds` only
  if that's absent) and enqueues a fire-and-forget "friend posted" notification to every one of them
  via `NotificationQueueService` — see
  [`post.service.ts#L36-L74`](../../../../nest-js-boilerplate/src/post/post.service.ts).
- **Ownership check on write**: `update`/`delete` both 404 on a missing/already-deleted post and
  `403 EX_FORBIDDEN` if `post.authorId !== callerId` — no admin/moderator override path exists in
  this module.
- **Soft delete only**: `delete()` sets `deletedAt`, never removes the row. Every read path
  (`findAll`, `findOne`) filters `deletedAt: null`.
- **Cache-aside on every read and write**: `findAll`/`findOne` go through
  [`CacheAsideService`](../../_reference/excluded-modules.md#caching) — list results cached 30s per
  `{cursor, take, search}` key, a single post cached 60s — and every mutation invalidates
  `cache:post:{id}` plus a `cache:feed:*` wildcard sweep before emitting the realtime renew frame
  (see [social-content/README.md § How the pieces fit together](../README.md#how-the-pieces-fit-together)
  for the shared `emitToTopic` convention).
- **`coverImage` vs `imageUrl` — two different image fields, only one is reachable from any real UI.**
  `coverImage` is a `Bytes?` Prisma column: the create/update DTOs accept it as a raw string which the
  service wraps in `Buffer.from(...)` for storage, and `PostResolver.coverImage` converts it back to
  base64 on read (`post.resolver.ts#L89-94`). `imageUrl` is a plain nullable string, expected to be a
  URL already produced by the [upload module](../../messaging-realtime/upload/README.md), specifically
  documented). Both fields are fully wired end-to-end (DTO → service → resolver → Prisma column) — but
  ⚠ `BE-011` (resolved): neither frontend nor mobile's post-composer ever sends
  `coverImage`, only `imageUrl` — see [Known issues](#known-issues).

## Tier gating is real here (unlike some other verticals)

`reactionBreakdown` (`@MinTier(SubscriptionTier.MEDIUM)`) and `whoReacted`
(`@MinTier(SubscriptionTier.PREMIUM)`) are genuine `TierGuard`-enforced `@ResolveField`s on `Post` —
[`post.resolver.ts#L101-126`](../../../../nest-js-boilerplate/src/post/post.resolver.ts). Unlike the
Phase 0 messaging pilot (where the 4-tier page-view split was purely a frontend routing convention
with no real backend gate), a Free/Basic-tier caller who requests either field in their GraphQL query
gets a `403` — see [architecture.md § Tier-based RBAC](../../../architecture.md#tier-based-rbac--two-orthogonal-authorization-axes).
`myPostStats` (`@MinTier(SubscriptionTier.MEDIUM)`) is the same story, as a top-level `Query`.

## Depends on

`AuthModule` (guard), `FriendsModule` (friend-post notification fan-out), `NotificationModule`,
`RealtimeModule` (feed renew frames). Also depends on `CacheAsideService`
([platform-core](../../platform-core/README.md), Phase 5) and `DataloaderService` (batches the
`author` `@ResolveField` — see [`post.resolver.ts#L77-87`](../../../../nest-js-boilerplate/src/post/post.resolver.ts))
directly, not via module import (both injected from elsewhere in the DI graph).

## Used by

| App | Page / Screen |
|---|---|
| Frontend | [feed](../../../frontend/v1/feed/page.md) · [posts](../../../frontend/v1/posts/page.md) · [share](../../../frontend/v1/share/page.md) (compose only) |
| Mobile | [feed](../../../mobile/v1/feed/screen.md) · [posts](../../../mobile/v1/posts/README.md) (list/create/detail) · [share](../../../mobile/v1/share/screen.md) (compose only) |

## Known issues

- `FE-009` (resolved) — Web's post-detail page never selects `reactionBreakdown`/
  `whoReacted` in its GraphQL query, so these two real, `TierGuard`-enforced fields never reach the
  Medium/Premium-tier UI built to display them — see
  [frontend/v1/posts/page.md § Known issues](../../../frontend/v1/posts/page.md#known-issues).
- `MOB-008` (resolved) — mobile's actual routed post-detail screen has no UI for either
  field at all (a separate, unrouted implementation that does have it was abandoned) — see
  [mobile/v1/posts/detail/screen.md § Known issues](../../../mobile/v1/posts/detail/screen.md#known-issues).
- `BE-011` — `coverImage` is fully wired (DTO/service/resolver/Prisma
  column) but no real UI on either platform ever sets it — both platforms' post composers (frontend
  [share](../../../frontend/v1/share/page.md), mobile
  [share](../../../mobile/v1/share/screen.md)/[posts create](../../../mobile/v1/posts/create/screen.md))
  only ever populate `imageUrl`. No user-visible effect today (`imageUrl` works); the same
  "provisioned but unused" shape as [BE-008](../../../issues.md#be-008).
