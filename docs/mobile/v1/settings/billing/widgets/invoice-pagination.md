# InvoicePagination (widget)

**Source:** [`invoice_pagination.dart`](../../../../../../flutter-boilerplate/lib/views/settings/billing/invoice_pagination.dart)
**Used in:** [Billing screen](../screen.md)'s `_InvoiceHistorySection`
**Web equivalent:** [InvoicePagination (web)](../../../../../frontend/v1/settings/billing/components/invoice-table.md)

## Purpose

Stateless prev/page-label/next row — no per-page-number buttons (contrast web's
[`InvoicePagination.tsx`](../../../../../frontend/v1/settings/billing/components/invoice-table.md),
which renders one `PaginationLink` per page). Page state itself lives in the parent
(`_InvoiceHistorySectionState`'s `_page` field), not here.

## Constructor

`currentPage`, `totalPages` (both `int`), `onPrevious`/`onNext` (`VoidCallback?` — `null` disables the
corresponding button, already computed by the caller rather than by this widget), `isLoading` (unused
by the current caller — always defaults to `false`).

## Calls

None — purely presentational, callbacks supplied by the parent.
