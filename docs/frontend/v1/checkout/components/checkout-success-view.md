# CheckoutSuccessView

**Source:** [`CheckoutSuccessView.tsx`](../../../../../next-js-boilerplate/src/views/checkout/CheckoutSuccessView.tsx)
**Used in:** [checkout page](../page.md)
**Mobile equivalent:** [CheckoutSuccessView widget](../../../../mobile/v1/checkout/widgets/checkout-success-view.md)

## Purpose

Terminal success state for both checkout branches — an icon + message + "redirecting…" note, shown
in place of the form once `subscribe()` resolves successfully. Pure presentational component, no
state, no API call.

## Props (`CheckoutSuccessViewProps`)

| Prop | Purpose |
|---|---|
| `isDowngrade` | picks the icon/color (green check vs. amber down-arrow) when `message` isn't supplied |
| `message` | pre-built, specific success string (e.g. "Your plan will change to Premium on March 3") — see [`buildSuccessMessage`](../page.md) in `lib/checkout/plan-change.ts` |
| `downgradeMsg` / `upgradeMsg` | generic fallbacks used only when `message` is falsy |
| `redirectingMsg` | the secondary "redirecting…" line |

`message ?? (isDowngrade ? downgradeMsg : upgradeMsg)` — in practice `message` is always supplied by
the parent (`buildSuccessMessage` never returns a falsy value for any of the three `changeType`s), so
the `downgradeMsg`/`upgradeMsg` fallback is effectively unreachable from this page's own call site;
kept as a defensive default rather than a real fallback path.

## Calls

None — purely presentational, receives everything as props. The actual redirect timer
(`setTimeout(() => router.push(PRICING_PATH), redirectDelayMs)`) lives in the parent
(`CheckoutContent`/`DowngradeSection`/`StripeCardForm`'s success callbacks), not in this component.
