# InvoiceTable / InvoicePagination / StatusBadge

**Source:** [`InvoiceTable.tsx`](../../../../../../next-js-boilerplate/src/views/settings/billing/InvoiceTable.tsx),
[`InvoicePagination.tsx`](../../../../../../next-js-boilerplate/src/views/settings/billing/InvoicePagination.tsx),
[`StatusBadge.tsx`](../../../../../../next-js-boilerplate/src/views/settings/billing/StatusBadge.tsx)
**Used in:** [Billing page](../page.md), Invoices tab
**Mobile equivalent:** [`_InvoiceHistorySection`](../../../../../mobile/v1/settings/billing/screen.md#what-renders-here) +
[InvoicePagination (mobile)](../../../../../mobile/v1/settings/billing/widgets/invoice-pagination.md) —
see Known issues below for a real status-badge bug on the mobile side.

Documented together — `InvoicePagination` and `StatusBadge` are small, tightly-coupled leaves with no
independent data source.

## Purpose

Client-side-paginated (5/page) table of the caller's billing history. Each row: an invoice number
(regex-extracted from the transaction's `reference` string, e.g. `subscription:PREMIUM` → falls back
to the raw reference if no digits are found — in practice this app's `reference` values are never
actually numbered, so this extraction rarely produces anything but the fallback), date, price (or an
em-dash for zero-amount bookkeeping rows), a status badge, and a "View invoice" link.

## Data: real Stripe data, mirrored locally — not a live API call

`transactions` (passed in as a prop from `FreePageView`) comes from `myBillingHistory`, which reads
**Postgres `WalletTransaction` rows**, not a live Stripe API call — see
[api.md § Billing history](../api.md#billing-history). Real invoices are written into that table by the
backend's `invoice.paid` Stripe webhook handler at the time Stripe actually charges the card; this
table only ever displays what's already been mirrored, filtered to `type: FEE` rows (the zero-amount
`ADJUSTMENT` rows written for scheduled cancellations/tier-changes are deliberately excluded — those
surface via [PlanDetails](./plan-details.md)'s pending/cancelling copy instead). Contrast
[PaymentMethods](./payment-methods.md), which **is** a live Stripe API read on every request — this is
a real, worth-knowing asymmetry between the two cards on this same page.

## `StatusBadge`

Two states only: `status === "COMPLETED"` → success/green "Paid"; anything else → error/red "Unpaid".
In practice every row this table ever receives has `status: "COMPLETED"` (that's the only value the
backend ever writes for a `FEE` row) — the "Unpaid" branch is defensive, not something a real user is
expected to see here today.

## `tx.stripeInvoiceUrl`

When present, links directly to Stripe's own hosted invoice page (`target="_blank"`) — an external
link, not proxied through this app. `null` for the zero-amount rows `getBillingHistory` already
excludes, so in practice every row rendered here has a working link.

## Known issues

- ⚠ `MOB-021` (resolved) — mobile's equivalent invoice badge compares
  against the wrong literal (`'paid'` instead of `'COMPLETED'`), so it never shows the success state
  this component correctly shows for every real row.

## Calls

- `billingHistoryQueryOptions()` → [api.md § Billing history](../api.md#billing-history) — the only
  network call in this trio; `InvoicePagination` and `StatusBadge` are pure presentation.
