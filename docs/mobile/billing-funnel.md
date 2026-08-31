# Billing funnel

Mirrors [frontend/billing-funnel.md](../frontend/billing-funnel.md) — same real 4-step shape, same
correction to this effort's own original 5-step plan (`v1/premium` is not part of the funnel; see
below). Screen names below use `screen.md`/`api.md` in place of `page.md`/`api.md`.

## The real 4 steps

1. **[`/pricing`](./pricing/screen.md)** — top-level route, redirects immediately to step 2.
   **Currently broken for a logged-out visitor**, same net effect as web though a different
   mechanism — see `CROSS-029` (resolved).
2. **[`v1/plans`](./v1/plans/screen.md)** — plan comparison (session-gated). Feature-list *copy* is
   hardcoded here too, independently from web — see [CROSS-031](../issues.md#cross-031).
3. **[`v1/checkout`](./v1/checkout/screen.md)** — payment collection or plan change. Unlike web,
   mobile's paid↔paid tier-change path works correctly (it posts directly to the backend GraphQL
   mutation with no intermediate BFF validation bug) — see `CROSS-030` (resolved) for
   the web-side contrast.
4. **[`v1/settings/billing`](./v1/settings/billing/screen.md)** — ongoing subscription management:
   current plan, invoices, payment methods (a rare case where mobile's UI is *more* complete than
   web's here — see `CROSS-034` (resolved)), cancel.

## Correction to this effort's own original plan

Same correction as the web funnel: `v1/premium` was assumed to be step 4 (a post-purchase status
page) when this effort's plan was first written, before any billing screen had actually been read.
It's really an unrelated NestJS RBAC tier-gate tech demo — see
[CROSS-035](../issues.md#cross-035) — documented at [`v1/premium/screen.md`](./v1/premium/screen.md)
as its own thing, not as part of this funnel. Its live code additionally has its own real bug,
permanently-zero growth stats — `MOB-023` (resolved) — and 7 of its 8 source files are
dead code duplicating the live implementation — `MOB-022` (resolved).

## Cancel / downgrade

Identical mechanism to web — see [frontend/billing-funnel.md § Cancel / downgrade](../frontend/billing-funnel.md#cancel--downgrade-not-a-separate-funnel).
Both platforms call the same backend mutations.
