# Billing & Usage

Subscriptions, payments (Stripe), and quota/limit tracking. ✅ Complete (Phase 4).

| Module | Interfaces | Docs |
|---|---|---|
| [billing](./billing/) | GraphQL resolver, REST controller (Stripe webhook only) | [README](./billing/README.md) · [endpoints](./billing/endpoints.md) · [stripe](./billing/stripe.md) |
| [usage](./usage/) | REST controller | [README](./usage/README.md) · [endpoints](./usage/endpoints.md) |

Frontend: [`(marketing)/pricing`](../../frontend/pricing/page.md) →
[`v1/plans`](../../frontend/v1/plans/page.md) →
[`v1/checkout/[tier]`](../../frontend/v1/checkout/page.md) →
[`v1/premium`](../../frontend/v1/premium/page.md) →
[`v1/settings/billing`](../../frontend/v1/settings/billing/page.md) (the 5-step funnel — see
[billing-funnel.md](../../frontend/billing-funnel.md) for the full narrative). Mobile: the same 5
screens under [`mobile/v1/`](../../mobile/v1/README.md) (see
[mobile/billing-funnel.md](../../mobile/billing-funnel.md)).

## How the pieces fit together

`billing` is one GraphQL resolver (`BillingResolver`, class-guarded, no REST surface of its own)
covering the whole subscription lifecycle — plan pricing, checkout, cancel, paid↔paid tier changes,
billing history, payment methods — plus one REST controller, `StripeWebhookController`, the
sole entry point for Stripe's async event delivery (signature-verified, documented in full in
[stripe.md](./billing/stripe.md)). `usage` is a separate, smaller module: quota tracking (message
count, upload storage) read by both `billing`-adjacent settings pages and enforced (inconsistently —
see [Known issues](#known-issues)) at write time by other feature modules.

**Call shape, confirmed for real this phase** (see
[conventions.md § 9](../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)):
billing is the cleanest example of platform-uniform call shape found anywhere in this effort — **web
is 100% BFF-proxied** (every operation goes through a `app/api/billing/**/route.ts` route handler,
zero exceptions, zero WebSocket involvement) and **mobile is 100% direct GraphQL** (every file posts
straight to `/graphql`, zero REST-shaped calls, zero BFF hop). Neither client ever holds a Stripe
secret key — both use the standard SetupIntent-client-secret + Stripe Elements/`flutter_stripe`
pattern.

## Known issues

- [CROSS-029](../../issues.md#cross-029) (HIGH) — the marketing pricing page is unreachable for
  logged-out visitors; three independent bugs stack to cause it.
- [CROSS-030](../../issues.md#cross-030) (HIGH) — every paid↔paid tier change from web checkout fails
  with a misleading error; a validation bug in one Next.js BFF route, not a backend defect.
- [CROSS-032](../../issues.md#cross-032) (MED) — mobile never applies a live tier change pushed over
  WebSocket; web does.
- [BE-018](../../issues.md#be-018)/[BE-020](../../issues.md#be-020) (MED) — the Stripe webhook has no
  throttle exemption, which can in turn cause a new subscription's first billing-history row to be
  permanently wrong.
- [BE-021](../../issues.md#be-021) (INFO) — `Wallet`'s balance/transfer schema is fully modeled and
  entirely unused; billing only uses it as a bookkeeping anchor.
- Full list: [issues.md](../../issues.md).
