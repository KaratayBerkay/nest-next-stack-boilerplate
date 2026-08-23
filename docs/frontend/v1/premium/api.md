# Premium — API

Page: [page.md](./page.md) · Server:
[`src/api/server/premium/`](../../../../next-js-boilerplate/src/api/server/premium/)

Two files, two different transport shapes — worth noting since they look interchangeable from the
page's perspective (both are just "fetch some stats") but are built completely differently.

## `stats.ts` — via a BFF route

**Source:** [`stats.ts`](../../../../next-js-boilerplate/src/api/server/premium/stats.ts) ·
`fetchPremiumStatsServer()` · `GET PREMIUM_STATS_URL` (`/api/premium/stats`) → route
[`src/app/api/premium/stats/route.ts`](../../../../next-js-boilerplate/src/app/api/premium/stats/route.ts) —
a real BFF route: reads the access-token cookie server-side, then runs a `PremiumStats` GraphQL query
against the backend itself (`premiumStats { totalUsers activeUsers revenue }`) via `graphqlFetch`.
Despite the name, this is GraphQL under the hood, proxied through a REST-shaped same-origin path —
same three-layer chain as every other BFF vertical in this app (see
[messages/api.md](../messages/api.md) for the fully-worked-out version of this chain).

## `growth-stats.ts` — direct GraphQL, no BFF route at all

**Source:** [`growth-stats.ts`](../../../../next-js-boilerplate/src/api/server/premium/growth-stats.ts) ·
`fetchGrowthStatsServer()` · posts straight to `GQL_URL` (`/api/gql`) — the app's generic GraphQL
proxy endpoint, not a premium-specific route. There is no
`src/app/api/premium/growth-stats/route.ts` file; `/api/gql` is a shared, un-namespaced pass-through
used by more than this one vertical. Returns `null` (not a thrown error) on any GraphQL error — the
one place in this vertical where a failure is silently swallowed rather than surfaced to the caller's
`try/catch`.

## Calls

| Handler (in `premium-handlers.ts`, or `BasicPageView.tsx`'s own inline copy) | Server file | Backend query |
|---|---|---|
| `loadPremiumStats` | `fetchPremiumStatsServer()` | [`premiumStats`](../../../backend/identity-access/authorization/endpoints.md#premium-stats-demo-tier-gate) (`@MinTier(BASIC)`) |
| `loadPremiumGrowthStats` | `fetchGrowthStatsServer()` | [`growthStats`](../../../backend/identity-access/authorization/endpoints.md#growth-stats-demo-tier-gate) (`@MinTier(MEDIUM)`) |
| `handleExportPremiumCSV` | *(none — builds a CSV from already-loaded state)* | — |

Both backend queries live on
[`AdminResolver`](../../../../nest-js-boilerplate/src/authorization/admin.resolver.ts), a Phase 1b
module, not this phase's `usage` or the parallel `billing` module — see
[page.md § Backend endpoints this page depends on](./page.md#backend-endpoints-this-page-depends-on)
for why that's worth flagging rather than assuming.
