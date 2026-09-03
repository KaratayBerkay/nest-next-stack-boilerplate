# Plans (page)

**Route:** `/v1/[lang]/plans` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/plans/page.tsx)
**Entry component:** [`PageContent.tsx`](../../../../next-js-boilerplate/src/views/plans/PageContent.tsx)
**Mobile equivalent:** [plans screen](../../../mobile/v1/plans/screen.md)

## What renders here

Client component, rendered inside the `v1/[lang]` layout — which means (see
[pricing page.md](../../pricing/page.md#-this-redirect-defeats-the-entire-point-of-a-public-pricing-page))
a session is guaranteed by the time this component mounts; there is no logged-out state to handle
here, `useAuth().user` is always populated. Renders one [`TierCard`](#tiercard) per tier
(`FREE`/`BASIC`/`MEDIUM`/`PREMIUM`), laid out as a responsive grid (`sm:grid-cols-2 lg:grid-cols-4`).

### Real vs. placeholder data

Two independent React Query calls back this page, both `enabled: !!user?.id`:

- [`subscriptionQueryOptions(user?.id)`](./api.md#get-my-subscription) → the user's own current
  `pendingTier`/`pendingTierEffectiveAt`, shown as a banner when a paid↔paid change is scheduled.
- [`planPricesQueryOptions(currency, user?.id)`](./api.md#get-plan-prices) → real per-currency prices
  for all four tiers.

Until the price query resolves, the page shows
[`TIER_PRICES_CENTS`](../../../../next-js-boilerplate/src/lib/tier.ts) — a static USD-cents table
(`FREE: 0, BASIC: 999, MEDIUM: 1999, PREMIUM: 4999`). The source comment on this page is explicit that
this is **"a same-shape placeholder for the render before the query resolves, not a fallback source
of truth"** — i.e. this table is not itself a drift risk the way a genuinely-duplicated pricing table
would be, since every render eventually reconciles onto the live-fetched value. Mobile independently
does the exact same thing with its own ARB `pricingPriceX` strings as the placeholder (see
[mobile plans screen.md](../../../mobile/v1/plans/screen.md)) — both platforms were deliberately
built this way, not a coincidence.

### ⚠ The tier→features mapping is shifted by one tier

`buildTierCards`'s `FEATURES` map:

```ts
const FEATURES: Record<Tier, string[]> = {
  FREE: t.featuresBasic,
  BASIC: t.featuresMedium,
  MEDIUM: t.featuresPremium,
  PREMIUM: t.featuresPro,
};
```

reads from [`messages/en/pricing/messages.json`](../../../../next-js-boilerplate/messages/en/pricing/messages.json)
(and the matching `tr` bundle, same structure). The content itself proves this is wrong, not just
oddly named: `featuresPremium`'s bullets literally begin **"Everything in Medium"**, yet the map above
assigns it to the **MEDIUM** card itself — a Medium-tier user (or someone considering Medium) reads
their own tier's card as starting with a self-referential, tautological bullet. `featuresPro` (whose
content begins "Everything in Premium") is assigned to the **PREMIUM** card for the same reason —
worse, `featuresPro` is a naming leftover from what looks like a fifth tier ("Pro") that no longer
exists in the current `FREE`/`BASIC`/`MEDIUM`/`PREMIUM` enum at all. See
`FE-013` (resolved).

Separately — not the same bug, but the same *shape* of bug — the web
[checkout page](../checkout/page.md) sources its own tier-feature bullets from a third, completely
independent, never-localized constant
([`lib/checkout/tier-features.ts`](../../../../next-js-boilerplate/src/lib/checkout/tier-features.ts)),
and mobile's plans screen hardcodes a *fourth* set of feature copy inline in Dart. See
`CROSS-031` (resolved — fixed 2026-09-03: tier feature lists are now served by the backend (`planPrices { features { key value } }`, built in `billing/tier-features.ts` from the constants that enforce the limits); clients only translate the keys (web `pricing.featureLabels`, Flutter `pricingFeature*` ARB) and keep the old arrays purely as the pre-fetch placeholder) for the full cross-app picture.

### `TierCard`

[`TierCard.tsx`](../../../../next-js-boilerplate/src/views/plans/TierCard.tsx) is folded into this
doc rather than given its own `components/` entry — it's a single, purely presentational card with no
state or logic of its own (per [conventions.md §2](../../../conventions.md#2-file-naming), trivial
presentational leaves fold into the parent doc). It renders whatever `tier`/`price`/`features`/
`ctaLabel`/`ctaHref`/`current`/`changePending` props `buildTierCards` computes:

- **Current tier**: badge instead of a button, no link.
- **Already-included tier** (user's tier already covers this one, e.g. a MEDIUM user viewing the
  BASIC card): "Included" badge, no link.
- **Upgrade available, no pending change**: a real `<Link>` to
  [`/v1/{lang}/checkout/{tier}`](../checkout/page.md).
- **Upgrade available, but a *different* pending change already covers/targets it**
  (`changePending`): a disabled-looking span reading "Change pending" instead of a link — this is the
  one case where the CTA is deliberately **not** a link, to avoid a user starting a second conflicting
  checkout while one is already scheduled.
- **Logged out**: dead code path in practice — this page can't render for a logged-out visitor at all
  (see [pricing page.md](../../pricing/page.md)), so the `ctaHref = LOGIN_PATH` branch in
  `buildTierCards` is currently unreachable from this page.

## Hooks used here

No dedicated hook file exists for this vertical — `useAuth()`, `useMessages("pricing")`,
`useCurrencyCookie()` (all cross-cutting, documented where first introduced) plus two direct
`useQuery()` calls against [api.md](./api.md)'s query-option builders. There is no `hooks.md` for this
vertical for that reason.

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Real per-currency tier prices | [billing/endpoints.md#get-plan-prices](../../../backend/billing-usage/billing/endpoints.md#get-plan-prices) |
| Pending-change banner | [billing/endpoints.md#get-my-subscription](../../../backend/billing-usage/billing/endpoints.md#get-my-subscription) |

Full request chain in [api.md](./api.md).

## Known issues affecting this page

- ⚠ `CROSS-029` (resolved) (HIGH) — this page can only ever render for an
  already-authenticated visitor (see [pricing page.md](../../pricing/page.md)); a design that intends
  "Plans" to double as the public marketing/pricing surface doesn't currently work that way.
- ⚠ `FE-013` (resolved) (LOW–MED) — see above.
- ⚠ `CROSS-031` (resolved) (MED) — see above.
