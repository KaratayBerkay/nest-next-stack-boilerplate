# Plans — API

Screen: [screen.md](./screen.md) · Client:
[`lib/api/client/billing/`](../../../../flutter-boilerplate/lib/api/client/billing/) · Server:
[`lib/api/server/billing/`](../../../../flutter-boilerplate/lib/api/server/billing/)

All calls use the shared `dioProvider` Dio instance, base URL `AppConfig.apiBaseUrl` — **confirmed
direct to the NestJS backend**, no Next.js involvement of any kind (this app has no BFF layer to
route through in the first place; see [conventions.md §9](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)
for the general shape test, trivially satisfied here since every billing call across both mobile
screens in this pass posts a literal `/graphql` body).

## Shape per file

| File | Shape | Path/operation | Backend endpoint |
|---|---|---|---|
| [`plan_prices.dart`](../../../../flutter-boilerplate/lib/api/server/billing/plan_prices.dart) | Direct GraphQL (`_dio.post('/graphql', ...)`) | `query PlanPrices($currency: String)` | [Get plan prices](../../../backend/billing-usage/billing/endpoints.md#get-plan-prices) |

Only one server file is called from this screen. `subscription.dart`/`stripe.dart` and the rest of
`lib/api/server/billing/` exist and are called from the
[checkout screen](../../../mobile/v1/checkout/screen.md) instead — this screen has no
pending-change/subscription-detail query of its own (see
[screen.md § Tier state](./screen.md#tier-state)).

## Client layer

[`planPricesProvider`](../../../../flutter-boilerplate/lib/api/client/billing/query.dart) —
`FutureProvider<List<PlanPrice>>`, re-derived whenever `currencyProvider` changes (mirrors web's
`planPricesQueryOptions(currency, userId)`, which keys its React Query cache on `currency` for the
identical reason: a currency change in Settings should re-price an already-open Plans page/screen).
