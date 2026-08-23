# DowngradeSection (widget)

**Source:** [`downgrade_section.dart`](../../../../../flutter-boilerplate/lib/views/checkout/downgrade_section.dart)
**Used in:** [checkout screen](../screen.md)
**Web equivalent:** [DowngradeSection component](../../../../frontend/v1/checkout/components/downgrade-section.md)
(same name, same slight misnomer, same actual purpose — independently arrived at on both platforms;
see that doc for the naming note)

## Purpose

The no-card-needed confirmation button, shown for both the `cancel` and `scheduled` change types
(i.e. anything that isn't a brand-new FREE→paid subscribe — see
[screen.md § What renders here](../screen.md#what-renders-here)). Genuinely simpler than its web
counterpart: this widget itself has no submit logic at all, purely a dumb button.

## Constructor

```dart
class DowngradeSection extends StatelessWidget {
  final String? error;
  final VoidCallback onConfirm;
  final String confirmLabel;
}
```

`onConfirm` is `_CheckoutPageContentState._handleChange` — all the actual `subscribe()` call, loading
state, and error handling live in the parent screen, not here (contrast web's
[`DowngradeSection.tsx`](../../../../frontend/v1/checkout/components/downgrade-section.md), which
owns its own submit handler internally).

## Confirmed: this is the widget behind the working paid↔paid path

`_handleChange` (the screen-level handler this button triggers) calls
`billing.subscribe(_tier)` with no payment method — the exact call that
[correctly reaches the backend's deferred-schedule logic on mobile](../screen.md#-paidpaid-tier-changes-work-correctly-here--confirmed-unlike-web),
unlike web's equivalent flow. See [CROSS-030](../../../../issues.md#cross-030).

## Calls

Indirect only — `onConfirm` is supplied by the parent screen and resolves to:

```
DowngradeSection (onConfirm)
  → _CheckoutPageContentState._handleChange → billingStateProvider.subscribe()
    → StripeServer.subscribe()   — lib/api/server/billing/stripe.dart
      → backend: mutation SubscribeToPlan
```

- [api.md § Subscribe / change / cancel a plan](../api.md#subscribe--change--cancel-a-plan)
- Backend: [billing/endpoints.md#subscribe-to-a-plan](../../../../backend/billing-usage/billing/endpoints.md#subscribe-to-a-plan)
