# Friends — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/friends/`](../../../../nest-js-boilerplate/src/friends/)

For friend-request send/accept/decline/list (REST), see
[messaging-realtime/messaging/endpoints.md § Send / accept / decline a friend request](../../messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request)
and the sibling entries around it — that's a different module's controller. This file covers only
this module's own resolver.

## GraphQL

Resolver: [`friends.resolver.ts`](../../../../nest-js-boilerplate/src/friends/friends.resolver.ts) ·
**Auth:** `SessionAuthGuard` on the whole resolver class.

### List suggested friends

**Kind:** GraphQL Query · **`suggestedFriends: [SuggestedFriend!]!`**
**Source:** [`friends.resolver.ts#L38-79`](../../../../nest-js-boilerplate/src/friends/friends.resolver.ts)
**Guard:** `TierGuard` + `@MinTier(SubscriptionTier.MEDIUM)` — Free and Basic tier callers get a
`403` (`TierGuard` rejection) before the resolver body runs at all.
**Response — `SuggestedFriend`** (defined inline, `friends.resolver.ts#L12-28`):

```graphql
type SuggestedFriend {
  id: ID!
  name: String
  email: String!
  avatarUrl: String
  mutualFriends: Int!
}
```

**Behavior:**
1. `friends.getFriendIds(caller)` — the caller's own accepted-friend ids ("seeds").
2. `friends.getMutualCounts(seedIds, excludeIds)` — every ACCEPTED friendship involving a seed,
   grouped by the *other* party, excluding the caller and their existing friends. Result: a
   `candidateId → mutualFriendCount` map.
3. Top 10 candidates by mutual count, then a `Prisma.user.findMany` to hydrate
   `id/name/email/avatarUrl/hideAvatar`.
4. `avatarUrl` is withheld (`undefined`) for any candidate with `hideAvatar: true` — same privacy
   rule as [profile/README.md](../profile/README.md)'s `hideAvatar` field.
5. Re-sorted by mutual count descending (the `Map` iteration order from step 2 isn't guaranteed
   sorted, so this second sort is load-bearing, not defensive).

**Note:** a user with zero friends gets an empty seed list, and the resolver short-circuits to `[]`
before ever querying candidates (`if (mutualCounts.size === 0) return [];` after an early return when
`friendIds` is empty) — "people you may know" has no fallback (e.g. no "new users" or "same domain"
suggestion path) when the friend graph is empty.
**Used by:** Frontend [find-friends](../../../frontend/v1/find-friends/page.md) (Medium+ tier only,
via [SuggestedFriendsPanel](../../../frontend/v1/find-friends/components/suggested-friends-panel.md));
Mobile [find-friends](../../../mobile/v1/find-friends/screen.md) (all four tier branches call it —
see `CROSS-018` (resolved) for why Free/Basic tier mobile screens call a query they can
never get a non-error response from).
