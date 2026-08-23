# Reactions — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/reactions/`](../../../../nest-js-boilerplate/src/reactions/)

Resolver: [`reactions.resolver.ts`](../../../../nest-js-boilerplate/src/reactions/reactions.resolver.ts) ·
**Auth:** `SessionAuthGuard` on the whole resolver class. No REST controller exists for this module.

## GraphQL

### List reactions for a target

**Kind:** GraphQL Query · **`reactions(postId: ID, commentId: ID): [Reaction!]!`**
**Source:** [`reactions.resolver.ts#L16-22`](../../../../nest-js-boilerplate/src/reactions/reactions.resolver.ts),
[`reactions.service.ts#L30-44`](../../../../nest-js-boilerplate/src/reactions/reactions.service.ts)
**Errors:** `409` if both `postId` and `commentId` are omitted.
**Response:** up to 200 rows, oldest-first, `{id, userId, type, createdAt, postId, commentId}`.
**Used by:** no confirmed direct caller on either platform — see
[README.md § Known issues](./README.md#known-issues).

### Create / toggle a reaction

**Kind:** GraphQL Mutation · **`createReaction(data: CreateReactionInput!): Reaction!`**
**Source:** [`reactions.resolver.ts#L24-30`](../../../../nest-js-boilerplate/src/reactions/reactions.resolver.ts),
[`reactions.service.ts#L46-161`](../../../../nest-js-boilerplate/src/reactions/reactions.service.ts),
input [`create-reaction.input.ts`](../../../../nest-js-boilerplate/src/reactions/dto/create-reaction.input.ts)
**Input:** `type` (`ReactionType` enum — `LIKE`/`LOVE`/`LAUGH`/`WOW`/`SAD`/`ANGRY`, per the REST BFF
route's validation message; the frontend/mobile UIs only ever surface 4 of the 6) · exactly one of
`postId`/`commentId` (UUID) — enforced by the `ExactlyOneOfPostOrComment` custom validator, `400` if
both or neither are present.
**Behavior:** see [README.md § Create/toggle semantics](./README.md#createtoggle-semantics--no-separate-delete-mutation)
— same-type re-post deletes, different-type re-post switches, no prior reaction creates. The
response shape differs by branch: a delete adds `deleted: true` to the otherwise-normal `Reaction`
row; create/switch return the plain updated/created row.
**Errors:** `409 EX_CONFLICT_DUPLICATE` (`Reaction already exists`) — only reachable via a raw
Prisma `P2002` unique-constraint race (the `existing`-lookup branch above normally intercepts a
duplicate first; this is a concurrent-request fallback, not the everyday path).
**Realtime side-effect:** invalidates `cache:post:{targetPostId}` + `cache:feed:*` (resolved from
either `postId` directly or the parent post of a `commentId` target) and emits `feed` +
`post:{targetPostId}` renew frames — on every branch (create/switch/delete) that resolves to a post.
**Used by:** Frontend [ReactionButtons](../../../frontend/v1/feed/components/reaction-buttons.md)
(feed and posts pages, both post- and comment-level reactions); Mobile
[ReactionButtons](../../../mobile/v1/feed/widgets/reaction-buttons.md) (feed, full 4-type picker) and
the simpler single-type (`LIKE`-only, default param) toggle used by
[posts list](../../../mobile/v1/posts/list/screen.md) and
[posts detail](../../../mobile/v1/posts/detail/screen.md).

## Known issues

See [README.md § Known issues](./README.md#known-issues).
