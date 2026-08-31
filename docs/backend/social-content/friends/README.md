# Friends (backend)

**Source:** [`nest-js-boilerplate/src/friends/`](../../../../nest-js-boilerplate/src/friends/) ·
**Category:** [Social & Content](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## Read this before trusting the module name

"Friends" as a *feature* (send/accept/decline a request, list your friends, list pending requests) is
**not implemented here**. Those REST routes (`POST /api/friends/request/:userId`,
`friends/accept/:userId`, `friends/decline/:userId`, `GET /api/friends`, `GET /api/friends/requests`)
live in the **`messaging/` module's** `MessagingController`, backed by `MessagingFriendService` — see
[messaging-realtime/messaging/README.md § Cross-module note](../../messaging-realtime/messaging/README.md#what-this-module-owns)
and [messaging-realtime/messaging/endpoints.md § Send / accept / decline a friend request](../../messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request).
That surprised this doc's author too, coming from the `friends/` directory name — but it's
consistent with how this repo already documents `users/` vs `profile/`
([BE-002](../../../issues.md#be-002)): the directory whose name matches the feature isn't always the
one that implements it. This module owns two much narrower things instead:

1. **`FriendsService`** — a small, shared, *dependency-only* service (`getFriendIds`, `areFriends`,
   `getMutualCounts`) that other modules inject to answer "are these two users friends" without each
   reimplementing the `Friendship` Prisma query. It has no controller of its own and is never called
   directly by any frontend/mobile client — see [Consumers](#consumers-of-friendsservice-not-http-callers)
   below.
2. **`FriendsResolver`** — exactly one real, client-facing GraphQL query, `suggestedFriends` (people-
   you-may-know, gated `MEDIUM`+ tier). See [endpoints.md](./endpoints.md).

## Why the split exists

`FriendsService` predates (or was at least factored out ahead of) the messaging module's friend-request
REST routes, and several unrelated modules need "is X friends with Y" as a cheap dependency without
pulling in all of `messaging/`'s DM/room machinery. Keeping it in its own leaf module also breaks what
would otherwise be a real circular-import problem — see the inline comment in
[`friends.module.ts`](../../../../nest-js-boilerplate/src/friends/friends.module.ts): `AuthModule`
imports `FriendsModule` (session hydration needs the caller's friend-id list),
`FriendsModule` imports `AuthContractsModule` (for `SessionAuthGuard`/`CurrentUser`/types), and
`E2eeModule` imports `FriendsModule` while `AuthContractsModule` imports `E2eeModule` — a real cycle
that `forwardRef(() => AuthContractsModule)` in `friends.module.ts` exists specifically to break.

## Wiring

Not listed directly in [`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s
`CORE_MODULES` array — `FriendsModule` is pulled in **transitively**, via `AuthModule`'s
`forwardRef(() => FriendsModule)` import and `MessagingModule`'s direct `FriendsModule` import (both of
which *are* in `CORE_MODULES`). It's exported from `FriendsModule` (`exports: [FriendsService]`,
[`friends.module.ts`](../../../../nest-js-boilerplate/src/friends/friends.module.ts)) so any importing
module gets the service, not just the resolver's own consumers. Not demo-gated — a real always-on
module, just not a top-level `CORE_MODULES` entry.

## `FriendsService`

[`friends.service.ts`](../../../../nest-js-boilerplate/src/friends/friends.service.ts) — three methods,
all read-only, all querying the `Friendship` Prisma model directly (`status: 'ACCEPTED'` rows only;
this service has no concept of `PENDING`/`BLOCKED`):

| Method | Source | Returns |
|---|---|---|
| `getFriendIds(userId)` | [`#L8-18`](../../../../nest-js-boilerplate/src/friends/friends.service.ts) | every accepted friend's user id |
| `areFriends(userId1, userId2)` | [`#L20-32`](../../../../nest-js-boilerplate/src/friends/friends.service.ts) | boolean; `false` if the two ids are equal |
| `getMutualCounts(seedIds, excludeIds)` | [`#L39-68`](../../../../nest-js-boilerplate/src/friends/friends.service.ts) | `Map<candidateUserId, mutualFriendCount>` for `suggestedFriends` below |

### Consumers of `FriendsService` (not HTTP callers)

Every one of these is a same-process constructor injection, not a network call — listed so the
"Used by" convention (§7) has somewhere honest to point, since this service has no endpoint of its own:

| Consumer | Uses | Why |
|---|---|---|
| [`messaging/messaging-friend.service.ts`](../../../../nest-js-boilerplate/src/messaging/messaging-friend.service.ts) | `getFriendIds` | refreshes the cached friend-id list (Redis, for wire-crypto fan-out) after every send/accept/decline |
| [`messaging/messaging.service.ts`](../../../../nest-js-boilerplate/src/messaging/messaging.service.ts) | (constructor param, DM send-path friend check) | `MessagingDmService.sendMessage` rejects DMs to non-friends |
| [`auth/session-hydration.service.ts`](../../../../nest-js-boilerplate/src/auth/session-hydration.service.ts) | `getFriendIds` | seeds the friend-id list into the session snapshot at login |
| [`post/post.service.ts`](../../../../nest-js-boilerplate/src/post/post.service.ts) | `getFriendIds` (fallback) | friends-only post visibility (Phase 2b territory — not detailed here) |
| `e2ee/` (via `FriendsModule`'s forwardRef, see [Why the split exists](#why-the-split-exists)) | `areFriends` | claim-bundle friendship check |

## `FriendsResolver` — `suggestedFriends`

[`friends.resolver.ts`](../../../../nest-js-boilerplate/src/friends/friends.resolver.ts) — the module's
one real client-facing surface. See [endpoints.md](./endpoints.md) for the full contract. Briefly:
seeds candidates from friends-of-friends (via `getFriendIds` + `getMutualCounts`), excludes the caller
and existing friends, sorts by mutual-friend count, returns the top 10. Gated
`@MinTier(SubscriptionTier.MEDIUM)` — the **only** tier gate anywhere in this module or in the
friend-request REST routes it's commonly confused with (those have no tier gate at all — see
`CROSS-018` (resolved) and the module note above).

`SuggestedFriend` (the GraphQL return type, defined inline in `friends.resolver.ts#L12-28` rather than
a separate model file) withholds `avatarUrl` when the candidate has `hideAvatar` set — the same
privacy rule `profile/`'s `hideAvatar` field enforces elsewhere (see
[../profile/README.md](../profile/README.md)).

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| GraphQL resolver | [`friends.resolver.ts`](../../../../nest-js-boilerplate/src/friends/friends.resolver.ts) | [endpoints.md § GraphQL](./endpoints.md#graphql) |

No REST controller, no WS gateway.

## Depends on

`AuthContractsModule` (via `forwardRef`, for `SessionAuthGuard`/`CurrentUser`), `PrismaService`
(direct, for the candidate-user lookup in `suggestedFriends`).

## Used by

| App | Page / Screen | Calls |
|---|---|---|
| Frontend | [find-friends](../../../frontend/v1/find-friends/page.md) (Medium+ tier: [SuggestedFriendsPanel](../../../frontend/v1/find-friends/components/suggested-friends-panel.md)) | via BFF, [api.md](../../../frontend/v1/find-friends/api.md) |
| Mobile | [find-friends](../../../mobile/v1/find-friends/screen.md) (all 4 tier branches call it, though Free/Basic tiers can't act on the result — see `CROSS-018` (resolved)) | direct GraphQL, [api.md](../../../mobile/v1/find-friends/api.md) |

## Known issues

- `CROSS-018` (resolved) — mobile's find-friends screens gate search and even
  viewing/accepting pending requests behind Basic/Medium+ tier, well beyond what this module (or the
  messaging-module friend-request routes) actually requires — `suggestedFriends`'s `MEDIUM` gate is
  the *only* tier restriction that exists anywhere in the real friend-request/search contract. See
  [mobile/v1/find-friends/screen.md](../../../mobile/v1/find-friends/screen.md#known-issues).
