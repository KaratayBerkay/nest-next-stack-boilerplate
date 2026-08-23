# Plans — API

Page: [page.md](./page.md) · Client: [`src/api/client/billing/`](../../../../next-js-boilerplate/src/api/client/billing/) ·
Server (BFF): [`src/api/server/billing/`](../../../../next-js-boilerplate/src/api/server/billing/)

Same three-layer BFF chain as every other web vertical (see
[architecture.md § BFF proxy pattern](../../../architecture.md#bff-proxy-pattern--nextjs-sits-between-the-browser-and-the-backend)
and [conventions.md §8](../../../conventions.md#8-rest-vs-graphql-vs-ws--which-app-doc-owns-a-call-web)):

```
Browser (PageContent) → api/client/billing/query.ts (queryOptions, lazy-imports the server file)
  → api/server/billing/*.ts (apiFetchJson, same-origin fetch)
    → app/api/billing/**/route.ts (real BFF: cookie→header bridge, raw graphqlFetch to the backend)
      → NestJS backend (GraphQL)
```

Confirmed by reading every route file this page's two queries touch, not inferred.

## Get my subscription

- **Client:** [`subscriptionQueryOptions(userId?)`](../../../../next-js-boilerplate/src/api/client/billing/query.ts) —
  `enabled: !!userId` (never fires for a logged-out caller; moot in practice today since this page is
  unreachable when logged out at all, see [page.md](./page.md)).
- **Server:** [`fetchSubscriptionServer()`](../../../../next-js-boilerplate/src/api/server/billing/subscription.ts) —
  `GET` `BILLING_SUBSCRIPTION_URL`.
- **BFF route:** [`app/api/billing/subscription/route.ts`](../../../../next-js-boilerplate/src/app/api/billing/subscription/route.ts) —
  reads the `access_token` cookie (`401` if absent), runs a raw `MySubscription` GraphQL query
  server-to-server, maps GraphQL errors via `graphqlErrorBody`.
- **Backend:** [billing/endpoints.md#get-my-subscription](../../../backend/billing-usage/billing/endpoints.md#get-my-subscription).

## Get plan prices

- **Client:** [`planPricesQueryOptions(currency, userId?)`](../../../../next-js-boilerplate/src/api/client/billing/query.ts) —
  query key includes `currency`, so switching currency re-fetches; same `enabled: !!userId` gate.
- **Server:** [`fetchPlanPricesServer(currency?)`](../../../../next-js-boilerplate/src/api/server/billing/plan-prices.ts) —
  `GET` `BILLING_PLAN_PRICES_URL?currency=...`.
- **BFF route:** [`app/api/billing/plan-prices/route.ts`](../../../../next-js-boilerplate/src/app/api/billing/plan-prices/route.ts) —
  same cookie/error-mapping pattern, runs the `PlanPrices` GraphQL query.
- **Backend:** [billing/endpoints.md#get-plan-prices](../../../backend/billing-usage/billing/endpoints.md#get-plan-prices).

## Currency source

[`useCurrencyCookie()`](../../../../next-js-boilerplate/src/hooks/useCurrencyCookie.ts) (cross-cutting,
not billing-specific) reads a plain `currency` cookie client-side, falling back to `USD`
(`CURRENCIES = ["USD", "EUR", "TRY"]` in
[`constants/currency.ts`](../../../../next-js-boilerplate/src/constants/currency.ts)) — the same
three-currency list the backend's `SUPPORTED_CURRENCIES` mirrors (see
[billing/README.md § Currencies](../../../backend/billing-usage/billing/README.md#currencies)).

## Not called from this page

`myBillingHistory`/`myPaymentMethods`/`removePaymentMethod`/`setDefaultPaymentMethod`/
`myBillingAddress`/`upsertBillingAddress`/`cancelSubscription` and their BFF routes
(`app/api/billing/{history,payment-methods,address,cancel}/route.ts`) exist but belong to the
[`settings/billing` page](../settings/billing/api.md) (Phase 4b) — listed in
[billing/endpoints.md](../../../backend/billing-usage/billing/endpoints.md) for completeness, not
detailed here since this page never calls them.
