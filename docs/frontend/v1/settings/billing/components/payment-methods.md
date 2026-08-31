# PaymentMethods

**Source:** [`PaymentMethods.tsx`](../../../../../../next-js-boilerplate/src/views/settings/billing/PaymentMethods.tsx)
**Used in:** [Billing page](../page.md), Plan tab (third card)
**Mobile equivalent:** [`_PaymentMethodsSection`](../../../../../mobile/v1/settings/billing/screen.md#what-renders-here) —
**materially more capable**, see Known issues below.

## Purpose

Lists the caller's saved cards (brand icon, masked last4, expiry, a "Default" badge on whichever one
is `isDefault`). Renders one of: a loading skeleton, an empty state, or the grid of cards.

## ⚠ Read-only — no add, remove, or set-default action anywhere in this file

This component only ever renders `<Card>`s — there is no button, icon, or menu item anywhere in
`PaymentMethods.tsx` that calls `useRemovePaymentMethod()` or `useSetDefaultPaymentMethod()` (both
exist, fully built, in [api.md](../api.md) — this is the file that would call them and doesn't), nor
any "Add a card" affordance that would call `useBillingActions().createSetupIntent()`. A web user
cannot remove an old card, change which card is default, or add a new one from this page at all.
Contrast [mobile's equivalent](../../../../../mobile/v1/settings/billing/screen.md#what-renders-here),
which has working versions of all three (remove, set-default, and an add-card dialog backed by
`flutter_stripe`). See ⚠ `CROSS-034` (resolved).

## Props (`PaymentMethodsProps`)

`className` only — everything else is fetched internally via `useQuery(paymentMethodsQueryOptions())`.

## Calls

- `paymentMethodsQueryOptions()` → [api.md § `myPaymentMethods`](../api.md#payment-methods) — the only
  network call this component makes.
