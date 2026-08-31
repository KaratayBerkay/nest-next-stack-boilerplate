# BillingAddressForm / BillingAddressField / BillingInfoDisplay

**Source:** [`BillingAddressForm.tsx`](../../../../../../next-js-boilerplate/src/views/settings/billing/BillingAddressForm.tsx),
[`BillingAddressField.tsx`](../../../../../../next-js-boilerplate/src/views/settings/billing/BillingAddressField.tsx),
[`BillingInfoDisplay.tsx`](../../../../../../next-js-boilerplate/src/views/settings/billing/BillingInfoDisplay.tsx)
**Used in:** [Billing page](../page.md), Plan tab (side card) — `FreePageView`'s `isEditingAddress`
state toggles between the display and the form.
**Mobile equivalent:** [BillingAddressForm (mobile)](../../../../../mobile/v1/settings/billing/widgets/billing-address-form.md),
[BillingInfoDisplay (mobile)](../../../../../mobile/v1/settings/billing/widgets/billing-info-display.md)

Documented together — one view/edit pair over the same `BillingAddress` shape.
`BillingAddressField` is a single reused label+input leaf with no logic of its own, folded in here
rather than given its own file.

## `BillingInfoDisplay`

Read-only list of whichever address fields are non-empty (`name`, `street`, `city`, `state`,
`country`, `zipCode`, `vatNumber` — each conditionally rendered), or an empty-state message, plus an
"Edit" link that flips the parent's `isEditingAddress` flag. No fetch of its own — `address` is a prop.

## `BillingAddressForm`

Seven `BillingAddressField`s in a 2-column grid (street spans both columns), local `useState` seeded
from the `address` prop, "Save"/"Cancel" buttons. `onSave(formData)` is the only thing this form does
on submit — persistence happens in the parent via `useUpsertBillingAddress()` (see [api.md](../api.md)).

### ⚠ The "Cancel" button reuses the wrong translation key

```tsx
<Button type="button" variant="outline" onClick={onCancel}>
  {t.cancelSubscription || "Cancel"}
</Button>
```

`t.cancelSubscription` is always defined (`messages/en/settings/messages.json`: `"Cancel subscription"`)
— so this button, whose only job is to close the address-edit form without saving, literally reads
**"Cancel subscription"** rather than "Cancel." A user could reasonably read that as "this will cancel
my plan" while just trying to back out of editing their billing address. See ⚠
`FE-015` (resolved).

## Calls

- `BillingInfoDisplay`/`BillingAddressForm`: none directly — `FreePageView` supplies `address` as a
  prop (from `billingAddressQueryOptions()`) and wires `onSave`/`onEdit`/`onCancel` to local state plus
  [`useUpsertBillingAddress()`](../api.md#billing-address) — see [api.md](../api.md).
