# Billing (screen)

**Route:** `/v1/:lang/settings/billing` (GoRouter name `v1SettingsBilling`)
**Router registration:** [`router.dart#L371-373`](../../../../../flutter-boilerplate/lib/app/router.dart) →
`SettingsBillingPageContent`
**Entry widget:** `SettingsBillingPageContent` in
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/settings/billing/page_view.dart)
**Web equivalent:** [settings/billing page](../../../../frontend/v1/settings/billing/page.md)

The real "manage my subscription" screen — not [premium](../../premium/screen.md), which is an
unrelated RBAC-demo screen that happens to share nav placement with this one's web counterpart.

## What renders here

`SettingsBillingPageContent` wraps `SettingsShellScaffold` around a 2-tab `TabsWidget` (Plan /
Invoices) — same two-tab structure as web. Unlike web's `getTierView()` (which resolves to one
identical component regardless of tier), mobile has no tier branching here at all — a single
`ConsumerWidget` for every tier, watching one `subscriptionProvider`. Renders, top to bottom on the
Plan tab, entirely as **inline private widgets in this same file** (no standalone widget files for
these five — a deliberate difference from the three genuinely standalone files documented under
[widgets/](#widgets) below):

```
SettingsBillingPageContent
├─ Tab: Plan
│   ├─ _SubscriptionCard      (tier, price, renewal/cancel date, cancel/upgrade/cancel-pending actions)
│   ├─ _PlanBenefitsSection   (feature diff accordion, same TIER_FEATURES-equivalent logic as web)
│   ├─ _PaymentMethodsSection (list + add/remove/set-default — see below)
│   └─ _BillingAddressSection (view ⇄ edit, via BillingAddressForm/BillingInfoDisplay)
└─ Tab: Invoices
    └─ _InvoiceHistorySection (paginated via InvoicePagination — see below)
```

## Cancel / downgrade — matches web exactly

`_SubscriptionCard`'s "Cancel Subscription" button calls
`billingActionsProvider.cancelSubscription()` → the same `cancelSubscription` GraphQL mutation web's
equivalent button calls. "Cancel pending change" re-calls `subscribe()` with the current tier — the
same T6 escape hatch web uses. See
[web page.md § Cancel / downgrade — what actually happens](../../../../frontend/v1/settings/billing/page.md#cancel--downgrade--what-actually-happens)
for the full server-side trace; nothing platform-specific here. "Upgrade Plan" navigates to
the [plans screen](../../plans/screen.md).

## ⚠ Payment methods: mobile has a real add/remove/set-default flow — web doesn't

`_PaymentMethodsSection` was **not** a thin wrapper around the standalone `payment_methods.dart`
file (that file's dead `PaymentMethods` widget class was deleted in `b98fac8a` — see
[Known issues](#known-issues)) — it's a
separate, fully-wired inline implementation with three real actions:

- **Remove** (`_removeMethod`) → `billingActionsProvider.removePaymentMethod(id)` → GraphQL
  `removePaymentMethod`.
- **Set default** (`_setDefault`) → `billingActionsProvider.setDefaultPaymentMethod(id)` → GraphQL
  `setDefaultPaymentMethod`.
- **Add a card** (`_showAddCardDialog`) → `createSetupIntent()` → GraphQL
  `createBillingSetupIntent`, then confirms it client-side via `flutter_stripe`'s
  `Stripe.instance.confirmSetupIntent(...)` with a native `StripeCardFormField` — a real,
  functioning card-entry flow, not a stub.

**Web's [PaymentMethods](../../../../frontend/v1/settings/billing/components/payment-methods.md) has
none of this** — it's read-only, despite the exact same three backend mutations being fully available
and even having already-built (but unused) client hooks on web. See ⚠
`CROSS-034` (resolved) — mobile is ahead of web here, the reverse of this
doc effort's usual direction.

## Invoices tab

`_InvoiceHistorySection` paginates `billingHistoryProvider` locally (5/page, same page size as web),
via [InvoicePagination](./widgets/invoice-pagination.md). Each row shows amount, date, a status badge,
and — if `pdfUrl` is present — opens it via `launchUrl` on tap (web's equivalent opens
`stripeInvoiceUrl` in a new tab; same underlying field, different interaction affordance).

### ⚠ Invoice status badge always shows the wrong color

```dart
trailing: Badge(
  text: inv.status,
  variant: inv.status == 'paid' ? BadgeVariant.success : BadgeVariant.warning,
),
```

Every real row's `status` is the literal string `'COMPLETED'` — that's the only value the backend's
`WalletTransaction` rows for a billing-history entry are ever written with (confirmed in both
`billing.service.ts`'s `persistUpgrade`/`applyLocalTierChange` and
`stripe-webhook.controller.ts`'s `upsertInvoiceTransaction`, both hardcoding `status: 'COMPLETED'`) —
never `'paid'`. So `inv.status == 'paid'` is **always false**: every invoice on this screen renders
with the warning/orange badge variant, showing the raw, un-localized text "COMPLETED" — never the
green "Paid" success state [web's `StatusBadge`](../../../../frontend/v1/settings/billing/components/invoice-table.md#statusbadge)
correctly shows for the exact same rows (web checks `=== "COMPLETED"`, the real value). See ⚠
`MOB-021` (resolved).

## Widgets

3 standalone, genuinely-used files in
[`lib/views/settings/billing/`](../../../../../flutter-boilerplate/lib/views/settings/billing/):
[billing-address-form.md](./widgets/billing-address-form.md) ·
[invoice-pagination.md](./widgets/invoice-pagination.md) ·
[billing-info-display.md](./widgets/billing-info-display.md)

## API

[api.md](./api.md)

## Known issues

- ⚠ `CROSS-034` (resolved) — mobile's payment-methods UI is materially
  more capable than web's (add/remove/set-default vs. read-only).
- ⚠ `MOB-020` — **resolved by deletion** (commit `b98fac8a`): this
  vertical's own `payment_methods.dart` (`PaymentMethods` widget class) was dead code — `_PaymentMethodsSection` above reimplements the same
  UI inline instead of using it. The same "scaffolded then inlined, original left behind" pattern this
  effort has found repeatedly elsewhere (e.g.
  [CROSS-013](../../../../issues.md#cross-013)/`MOB-006` (resolved)).
- ⚠ `MOB-021` (resolved) — invoice status badge always renders as
  "warning," never "success," and shows a raw unlocalized enum string.
- ⚠ `MOB-024` (resolved) —
  [BillingInfoDisplay](./widgets/billing-info-display.md) has no `vatNumber` field at all, so a VAT
  number entered via [BillingAddressForm](./widgets/billing-address-form.md) is saved correctly but
  never shown back once the form closes.
