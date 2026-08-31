# Checkout (screen)

**Route:** `/v1/:lang/checkout/:tier` (GoRouter name `v1Checkout`)
**Router registration:** [`router.dart#L466-L473`](../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => CheckoutPageContent(lang: ..., plan: state.pathParameters['tier'])`
**Entry widget:** `CheckoutPageContent` in
[`page_content.dart`](../../../../flutter-boilerplate/lib/views/checkout/page_content.dart)
**Web equivalent:** [checkout page](../../../frontend/v1/checkout/page.md)

Note a same-named-but-unrelated route exists elsewhere in the router:
`/v1/:lang/forms/checkout` → `views/forms/checkout/page_content.dart`, a forms-gallery demo page with
no connection to billing at all. Confirmed distinct files, distinct routes — not a real confusable-name
trap in practice (unlike e.g. [BE-002](../../../issues.md#be-002)), just worth naming so a future
reader searching for "checkout page_content.dart" knows to check the path.

## What renders here

`ConsumerStatefulWidget`. [`_resolveChangeType(currentTier, tier)`](../../../../flutter-boilerplate/lib/views/checkout/page_content.dart)
mirrors web's [`resolveChangeType`](../../../frontend/v1/checkout/page.md#what-renders-here)
field-for-field: `FREE → paid` = `immediate`, `paid → FREE` = `cancel`, `paid → different paid` =
`scheduled`. `immediate` renders
[`StripeElementsConfig` + `StripeCardFormField`](./widgets/stripe-elements.md); `cancel`/`scheduled`
both render [`DowngradeSection`](./widgets/downgrade-section.md). A successful submit shows
[`CheckoutSuccessView`](./widgets/checkout-success-view.md) and — after a delay (2s immediate, 5s
scheduled) — navigates to `/v1/{lang}/settings/billing` (**not** `/pricing` like web; this screen
redirects into the management page instead of the marketing one, since mobile has no marketing
route to send the user back to).

### Real vs. placeholder price data

Same pattern as the [plans screen](../plans/screen.md) and web's
[checkout](../../../frontend/v1/checkout/page.md): `_placeholderPrice` (the ARB `pricingPriceX`
strings) renders only until `planPricesProvider` resolves, at which point the live per-currency price
is shown instead — the same value that gets charged at submit, per an explicit source comment
calling this out.

### PlanSummaryCard here never shows features

[`PlanSummaryCard`](./widgets/plan-summary-card.md) is called with only `tierLabel`/`price`/
`alreadySubscribed` — its `features` parameter (default `const []`) is never populated from this
screen. See that widget's own doc for detail — this is a very minor, cosmetic difference from web's
equivalent card, which does show a feature list.

## ⚠ Paid↔paid tier changes work correctly here — confirmed, unlike web

`_handleChange()` (used for both `scheduled` and `cancel` change types) calls
`billing.subscribe(_tier)` — a **direct GraphQL** call to the backend's `subscribeToPlan` mutation
with no `paymentMethodId`, exactly what the backend's `handleTierChange`/`handleFullCancellation`
paths expect (see
[backend billing/README.md](../../../backend/billing-usage/billing/README.md#subscribing-upgrading-downgrading-and-cancelling--one-mutation-three-branches)).
There is **no intermediate validation layer** between this call and the backend — no BFF, no
equivalent of web's `isUpgrade`/`isReSelection` gate — so a genuine BASIC↔MEDIUM (or any other
paid↔paid) change submitted from this screen reaches and correctly exercises the backend's
deferred-schedule logic. This is the mobile side of
`CROSS-030` (resolved): the *feature* works identically on both platforms at
the backend, but web has a self-inflicted frontend bug blocking it that mobile simply has no
equivalent code path to reproduce.

## Stripe integration — confirmed correct, safe-key pattern

`_handleSubscribe()` calls [`createSetupIntent()`](./api.md#create-a-setup-intent) for a
`clientSecret`, then `Stripe.instance.confirmSetupIntent(...)` (the `flutter_stripe` plugin's native
SetupIntent confirmation — handles any 3DS challenge for the setup step using the OS-native Stripe
SDK, not a web view). [`StripeElementsConfig`](./widgets/stripe-elements.md) initializes
`Stripe.publishableKey` from `AppConfig.stripePublishableKey` —
[`String.fromEnvironment('STRIPE_PUBLISHABLE_KEY')`](../../../../flutter-boilerplate/lib/app_config.dart),
confirmed a real publishable key at build time (`.env`'s `STRIPE_PUBLISHABLE_KEY=pk_live_...`), never
a secret key. Same safe pattern as web, independently verified.

## Widgets

4 significant widgets in
[`lib/views/checkout/`](../../../../flutter-boilerplate/lib/views/checkout/) (of the 6 files in this
folder — see [§ stripe_card_form.dart](./widgets/stripe-elements.md#the-checkout-local-stripe_card_formdart-is-a-dead-re-export)
for why one of the remaining two is folded into another widget's doc rather than given its own):

[plan-summary-card.md](./widgets/plan-summary-card.md) ·
[downgrade-section.md](./widgets/downgrade-section.md) ·
[checkout-success-view.md](./widgets/checkout-success-view.md) ·
[stripe-elements.md](./widgets/stripe-elements.md)

## API

[api.md](./api.md) — direct GraphQL to the backend, same as [plans](../plans/api.md).

## Known issues affecting this screen

- ⚠ `CROSS-030` (resolved) (HIGH, web-only) — see above; documented here as
  the "working" side of the cross-platform comparison.
- ⚠ `MOB-018` (resolved) (INFO) —
  [`PlanSummaryCard`](./widgets/plan-summary-card.md)'s `features` param is dead from this screen.
- ⚠ `MOB-019` (resolved) (INFO) — `views/checkout/stripe_card_form.dart`
  is a zero-importer re-export shim.
- ⚠ `CROSS-032` (resolved) (MED) — this app never handles the
  `tier-changed` WS frame the backend pushes right after a successful subscribe (see
  [backend billing/README.md § Making a tier change take effect immediately](../../../backend/billing-usage/billing/README.md#making-a-tier-change-take-effect-immediately)).
  Not a correctness problem for *this* screen specifically (it reads the fresh tier via
  `billing.invalidate()`/GraphQL after its own submit resolves, not from the WS push), but relevant
  context: a session left open elsewhere in the app won't reflect a tier change from *this* checkout
  flow live the way a web tab would.
