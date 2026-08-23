# StripeCardForm

**Source:** [`StripeCardForm.tsx`](../../../../../next-js-boilerplate/src/features/billing/ui/StripeCardForm.tsx)
(note: physically lives under `src/features/billing/ui/`, **not** `src/views/checkout/` — the only
one of this page's 4 components organized that way, likely because it's the one piece
plausibly reusable outside checkout specifically)
**Used in:** [checkout page](../page.md), loaded via `next/dynamic` with `ssr: false` (Stripe.js
requires `window`)
**Mobile equivalent:** [StripeElements + the shared `StripeCardFormField`](../../../../mobile/v1/checkout/widgets/stripe-elements.md)

## Purpose

Collects a card, confirms it via Stripe's SetupIntent flow, and — on success — calls
`subscribeToPlan` with the resulting payment method id. Rendered only for the `"immediate"`
change-type branch (brand-new FREE→paid subscribe; see
[page.md](../page.md#what-renders-here)).

## Structure

Two components in one file:

- **`StripeCardForm`** (outer): calls
  [`createSetupIntent(tier)`](../api.md#create-a-setup-intent) on mount, shows "Initializing
  payment…" until a `clientSecret` comes back, then wraps the inner form in
  [`StripeElements`](../../../../../next-js-boilerplate/src/components/StripeProvider.tsx)
  (`@stripe/react-stripe-js`'s `Elements` provider, keyed to that `clientSecret`).
- **`StripeCardFormInner`**: renders Stripe's `<PaymentElement />` + a submit button.

## The safe-key pattern, confirmed

[`StripeElements`](../../../../../next-js-boilerplate/src/components/StripeProvider.tsx) calls
`loadStripe(clientEnv.NEXT_PUBLIC_STRIPE_KEY)` — a `NEXT_PUBLIC_`-prefixed (client-safe, publishable)
key, confirmed against `.env.local`'s real value (`pk_test_...`). The backend's secret key
(`STRIPE_SECRET_KEY`) never appears anywhere in frontend source. This is the standard, correct
Stripe Elements pattern: publishable key + a `client_secret` minted server-side per checkout attempt
(see [backend billing/endpoints.md#create-a-billing-setup-intent](../../../../backend/billing-usage/billing/endpoints.md#create-a-billing-setup-intent)),
never raw card data touching this app's own server.

## Submit flow

1. `elements.submit()` — Stripe.js's own client-side field validation.
2. `stripe.confirmSetup({elements, confirmParams: {return_url: window.location.href}, redirect:
   "if_required"})` — confirms the **SetupIntent** (verifies/saves the card, handling 3DS
   interactively if the card issuer requires it *for this step*). `redirect: "if_required"` avoids a
   full-page redirect for the common case where no further action is needed.
3. On success, calls [`subscribe(tier, paymentMethod, retryKey, undefined, currency)`](../api.md#subscribe--change--cancel-a-plan) —
   this is the mutation that actually creates the Stripe subscription and charges the first invoice
   (off-session, against the just-verified payment method — see
   [backend stripe.md § Creating a subscription](../../../../backend/billing-usage/billing/stripe.md#creating-a-subscription)
   for why a *second* 3DS challenge is possible here despite step 2 already having verified the card,
   and [BE-019](../../../../issues.md#be-019) for what happens if it does).

## Retry-safe idempotency key

`retryKeyRef` (a `useRef`) mints one `crypto.randomUUID()` per subscribe *attempt* — regenerated when
`tier` changes, but **kept** across a failed submit (only cleared on `onSuccess`) so a user who hits
"Subscribe" again after a network failure reuses the same key, letting the backend recognize
(`WalletTransaction.clientIdempotencyKey`, see
[backend billing/README.md](../../../../backend/billing-usage/billing/README.md#subscribing-upgrading-downgrading-and-cancelling--one-mutation-three-branches))
a retry of a charge that may have already committed instead of risking a double charge.

## Calls

- [api.md § Create a setup intent](../api.md#create-a-setup-intent)
- [api.md § Subscribe / change / cancel a plan](../api.md#subscribe--change--cancel-a-plan)
- Backend: [billing/endpoints.md#create-a-billing-setup-intent](../../../../backend/billing-usage/billing/endpoints.md#create-a-billing-setup-intent),
  [billing/endpoints.md#subscribe-to-a-plan](../../../../backend/billing-usage/billing/endpoints.md#subscribe-to-a-plan)
