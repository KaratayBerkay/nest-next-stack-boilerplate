# DowngradeSection

**Source:** [`DowngradeSection.tsx`](../../../../../next-js-boilerplate/src/views/checkout/DowngradeSection.tsx)
**Used in:** [checkout page](../page.md)
**Mobile equivalent:** [DowngradeSection widget](../../../../mobile/v1/checkout/widgets/downgrade-section.md)
(same name, same slight misnomer, same actual purpose — independently arrived at on both platforms)

## Purpose

The no-card-needed confirmation button for anything that isn't a brand-new FREE→paid subscribe: a
full cancellation to FREE, **or** a paid↔paid change (upgrade or downgrade between BASIC/MEDIUM/
PREMIUM). Despite the name, it is not exclusively for downgrades — see
[page.md § What renders here](../page.md#what-renders-here) for exactly which `changeType`s route
here.

## Props (`DowngradeSectionProps`)

| Prop | Purpose |
|---|---|
| `targetTier` | tier passed straight to `subscribe()` |
| `error` / `setError` | lifted to the parent so the same error banner styling is shared with the immediate-charge branch |
| `onSuccess(effectiveAt)` | parent callback — shows `CheckoutSuccessView`, `effectiveAt` is `null` for cancel/immediate-tier-change, a real date for a scheduled paid↔paid change |
| `confirmLabel` | pre-formatted button text (`"Confirm change to X"` / `"Confirm downgrade to X"`) |
| `redirectDelayMs` | how long to show the success view before redirecting to `/pricing` |

## ⚠ This is the component that hits the broken BFF gate

`handleDowngrade` calls `subscribe(targetTier)` — **only one argument**. No `paymentMethodId` (this
branch is never supposed to need one — the backend's `handleFullCancellation`/`handleTierChange`
paths genuinely don't charge anything here), and no `currentTier` either. That second omission is
what makes [CROSS-030](../../../../issues.md#cross-030) bite: the BFF route this hits
(`/api/billing/subscribe`) can't tell "a real upgrade with no card" apart from "a re-selection of the
current tier" without a `currentTier` value to compare against, and this component never sends one —
so every paid↔paid attempt from here 400s before reaching the backend. Full evidence and the
call-chain diagram: [page.md § Paid↔paid tier changes are broken on web](../page.md#-paidpaid-tier-changes-are-broken-on-web).

Confirmed this is genuinely the *only* code path in this vertical that can attempt a paid↔paid
change — [`StripeCardForm`](./stripe-card-form.md) only ever runs for the FREE→paid case.

## Calls

- [api.md § Subscribe / change / cancel a plan](../api.md#subscribe--change--cancel-a-plan)
- Backend: [billing/endpoints.md#subscribe-to-a-plan](../../../../backend/billing-usage/billing/endpoints.md#subscribe-to-a-plan)
  (in practice, only reachable from this component for the `paid → FREE` case today — see
  [CROSS-030](../../../../issues.md#cross-030))
