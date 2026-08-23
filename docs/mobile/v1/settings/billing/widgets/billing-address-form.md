# BillingAddressForm (widget)

**Source:** [`billing_address_form.dart`](../../../../../../flutter-boilerplate/lib/views/settings/billing/billing_address_form.dart)
**Used in:** [Billing screen](../screen.md)'s `_BillingAddressSection`, when editing
**Web equivalent:** [BillingAddressForm (web)](../../../../../frontend/v1/settings/billing/components/billing-address.md)

## Purpose

Seven `TextField`s (name, street, city, state, zip, country, VAT) seeded from `initialData`, a
"Save Address" button calling `onSave(Map<String, dynamic>)`. Unlike web's
[`BillingAddressField`](../../../../../frontend/v1/settings/billing/components/billing-address.md),
there's no shared reusable field widget here — each `TextField` is written out directly with its own
`InputDecoration(labelText: ...)`, and every label is a hardcoded English string (`'Full name'`,
`'Street address'`, etc.) rather than an `AppLocalizations` lookup — worth noting if this ever needs a
non-English release, though not filed as its own issue (this repo already has a well-established,
separately-tracked "hardcoded string despite a matching ARB key" pattern, e.g.
[MOB-015](../../../../../issues.md#mob-015); this file wasn't checked against the ARB catalogue for a
specific matching key, so it isn't asserted here as another confirmed instance of that same finding).

No "Cancel" button here (unlike web's equivalent) — `_BillingAddressSectionState` in
[`page_view.dart`](../screen.md) provides its own way back to the display view, not by wiring a
`onCancel` down into this widget.

## Constructor

`initialData` (`Map<String, dynamic>?`), `onSave` (`ValueChanged<Map<String, dynamic>>`, required).

## Calls

None directly — `onSave` is supplied by `_BillingAddressSectionState`, which calls
`billingActionsProvider.updateAddress(data)` → see [api.md](../api.md).
