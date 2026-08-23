# Premium — API

Screen: [screen.md](./screen.md) · Client:
[`lib/api/client/premium/`](../../../../flutter-boilerplate/lib/api/client/premium/) · Server:
[`lib/api/server/premium/`](../../../../flutter-boilerplate/lib/api/server/premium/)

## Shape per file

Per [conventions.md § 9](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement),
checked directly rather than assumed:

| File | Shape | Path/operation | Backend endpoint |
|---|---|---|---|
| [`stats.dart`](../../../../flutter-boilerplate/lib/api/server/premium/stats.dart) | Direct GraphQL (hand-rolled `_dio.post('/graphql', ...)`, no `gql_helper`) | `query PremiumStats { premiumStats { totalUsers activeUsers revenue } }` | [`premiumStats`](../../../backend/identity-access/authorization/endpoints.md#premium-stats-demo-tier-gate) (`@MinTier(BASIC)`) |
| [`growth_stats.dart`](../../../../flutter-boilerplate/lib/api/server/premium/growth_stats.dart) | Direct GraphQL | `query GrowthStats { growthStats { totalUsers newUsersLast7Days totalPosts totalFriendships } }` | [`growthStats`](../../../backend/identity-access/authorization/endpoints.md#growth-stats-demo-tier-gate) (`@MinTier(MEDIUM)`) |

Both hit the NestJS backend directly — zero Next.js involvement, same as the
[messages vertical](../messages/api.md) (Phase 0) and unlike a BFF-routed vertical. The GraphQL
query text itself correctly matches the real backend field names in both files (no field-name
mismatch at the network layer) — the zero-defaulted display bug documented in
[screen.md](./screen.md#-two-growth-stat-fields-never-load-real-data) happens entirely in
`GrowthStats.fromJson`'s client-side model mapping, after a perfectly valid response is already back.

## Client layer (`lib/api/client/premium/`)

[`query.dart`](../../../../flutter-boilerplate/lib/api/client/premium/query.dart) — two bare
`FutureProvider`s, `premiumStatsProvider`/`growthStatsProvider`, each a thin `.call()` pass-through to
the matching server file above. No caching parameters, no `.family` — a plain one-shot fetch,
re-triggered only by explicit `ref.invalidate(...)` (see [screen.md](./screen.md#what-renders-here) for
where that happens).

## Models

- [`PremiumStats`](../../../../flutter-boilerplate/lib/api/server/premium/stats.dart) — fields
  `totalUsers`, `activeSubscriptions`, `monthlyRevenue`. Despite the different field *names* from the
  backend's `PremiumStatsPayload` (`activeUsers`, `revenue`), `fromJson` maps them correctly
  (`activeUsers → activeSubscriptions`, `revenue → monthlyRevenue`) — a deliberate rename, not a bug.
- [`GrowthStats`](../../../../flutter-boilerplate/lib/api/server/premium/growth_stats.dart) — fields
  `newUsersThisMonth`, `newSubscriptionsThisMonth`, `growthRate`. Only the first is backed by a real
  query field (`newUsersLast7Days`, mislabeled as "this month" — see [screen.md](./screen.md)); the
  other two have no backend counterpart at all and permanently default to `0`/`0.0`.

## Calls

- [screen.md](./screen.md) (via `page_view.dart`'s inline tier views) → `premiumStatsProvider`
  (Basic+), `growthStatsProvider` (Medium+) — the only two network calls anywhere in this vertical.
