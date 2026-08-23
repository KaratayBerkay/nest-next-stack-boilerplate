# StripeElementsConfig (widget) + the shared card-input field

**Source:** [`stripe_elements.dart`](../../../../../flutter-boilerplate/lib/views/checkout/stripe_elements.dart)
(defines `StripeElementsConfig`) · the actual card-input widget it wraps lives outside this vertical,
at [`components/ui/stripe_card_form.dart`](../../../../../flutter-boilerplate/lib/components/ui/stripe_card_form.dart)
(defines `StripeCardFormField`) — documented together here since neither is meaningful without the
other, and this file also covers `views/checkout/stripe_card_form.dart`, a third, unrelated file that
happens to share a name (see below).
**Used in:** [checkout screen](../screen.md), and (for `StripeCardFormField` only)
`settings/billing` (Phase 4b — confirmed via `grep -rln "components/ui/stripe_card_form"`, which
also matches `views/settings/billing/page_view.dart`)
**Web equivalent:** [StripeCardForm component](../../../../frontend/v1/checkout/components/stripe-card-form.md)
(covers the same ground — Elements provider + card field — as one file on web; split across two here)

## `StripeElementsConfig` — the provider/config wrapper

`StatefulWidget` equivalent of web's
[`StripeElements`](../../../../frontend/v1/checkout/components/stripe-card-form.md#the-safe-key-pattern-confirmed)
provider. On `initState` (and again on `didUpdateWidget` if the key prop changes), sets
`Stripe.publishableKey = widget.publishableKey` and calls `Stripe.instance.applySettings()` —
`flutter_stripe`'s own global-config step, analogous to web's `loadStripe(key)`. Renders a loading
spinner while initializing, an error panel if `applySettings()` throws, and `widget.child` (the real
card form) once ready.

### Confirmed: publishable key only, same safe pattern as web

`widget.publishableKey` is always passed as `AppConfig.stripePublishableKey` from the checkout
screen — traced to
[`String.fromEnvironment('STRIPE_PUBLISHABLE_KEY')`](../../../../../flutter-boilerplate/lib/app_config.dart),
a compile-time constant from a dedicated publishable-key build variable, never the backend's secret
key. See [screen.md § Stripe integration](../screen.md#stripe-integration--confirmed-correct-safe-key-pattern).

## `StripeCardFormField` — the actual card input

[`components/ui/stripe_card_form.dart`](../../../../../flutter-boilerplate/lib/components/ui/stripe_card_form.dart) —
a shared design-system widget (lives under `lib/components/ui/`, this app's convention for reusable
UI, not vertical-specific views), wrapping `flutter_stripe`'s native `CardField` (the OS-level secure
card-entry widget — raw PAN/CVC never pass through Dart application code, matching Stripe's own
security model for their native SDKs) plus an optional cardholder-name `TextField`. Tracks its own
`_complete` state from `CardField`'s `onCardChanged` callback and surfaces it via
`onCompletionChanged`, which [`CheckoutPageContent`](../screen.md) uses to gate the submit button
(`_canSubmit = _cardComplete && !_loading && ...`).

## The checkout-local `stripe_card_form.dart` is a dead re-export

A **third** file, [`views/checkout/stripe_card_form.dart`](../../../../../flutter-boilerplate/lib/views/checkout/stripe_card_form.dart),
sits in the checkout folder itself (one of the 6 files this pass's brief called out by name) — its
entire content is one line:

```dart
export '../../components/ui/stripe_card_form.dart' show StripeCardFormField;
```

Confirmed via `grep -rn "views/checkout/stripe_card_form\|checkout/stripe_card_form.dart"` across the
whole app: **zero importers**. [`page_content.dart`](../screen.md) imports
`components/ui/stripe_card_form.dart` directly, bypassing this re-export entirely. Not broken (nothing
depends on it, so its existence changes no behavior) but dead weight — a barrel file with no
consumer, left behind rather than genuinely wired in. See
[MOB-019](../../../../issues.md#mob-019).

## Calls

Neither `StripeElementsConfig` nor `StripeCardFormField` calls the API directly — both are purely
Stripe.js/`flutter_stripe`-facing UI. The actual network calls
(`createSetupIntent`/`confirmSetupIntent`/`subscribe`) are orchestrated by
[`_CheckoutPageContentState._handleSubscribe`](../screen.md#what-renders-here) in the parent screen —
see [api.md](../api.md).
