# BillingInfoDisplay (widget)

**Source:** [`billing_info_display.dart`](../../../../../../flutter-boilerplate/lib/views/settings/billing/billing_info_display.dart)
**Used in:** [Billing screen](../screen.md)'s `_BillingAddressSection`, when not editing
**Web equivalent:** [BillingInfoDisplay (web)](../../../../../frontend/v1/settings/billing/components/billing-address.md)

## Purpose

Read-only address block — conditionally renders whichever of `name`/`email`/`addressLine1`/
`addressLine2`/`city`/`state`/`zip`/`country` are non-null. No "Edit" trigger of its own (unlike web's
version, which owns the edit button) — `_BillingAddressSectionState` renders its own `TextButton`
alongside this widget instead.

Note the field set doesn't map 1:1 onto the backend's `BillingAddress` shape: this widget accepts an
`email` field the backend model has no equivalent of (always `null` in practice, since
`_BillingAddressSectionState` only ever passes through fields it read from `myBillingAddress`, which
has no `email`), and has no `vatNumber` field at all, unlike both the backend model and web's
equivalent display — so a VAT number saved via [BillingAddressForm](./billing-address-form.md) (which
does collect and submit one) is never shown back to the user anywhere on this screen once saved. See ⚠
[MOB-024](../../../../../issues.md#mob-024).

## Constructor

All eight fields (`name`, `email`, `addressLine1`, `addressLine2`, `city`, `state`, `zip`, `country`)
optional `String?`.

## Calls

None — pure presentation.
