# Frontend (`next-js-boilerplate`)

Next.js App Router, BFF pattern (see
[../architecture.md § BFF proxy pattern](../architecture.md#bff-proxy-pattern--nextjs-sits-between-the-browser-and-the-backend)) —
the browser never calls the NestJS backend directly.

## Scope of this documentation

`next-js-boilerplate/src` has 195 `page.tsx` files repo-wide. **35 are real application pages**; the
rest are component-showcase/demo galleries (a shadcnblocks marketing-block gallery, a UI-kit gallery,
a forms gallery, and several Next.js framework-pattern demos) that exist to exercise the design
system, not as product functionality. Only the real pages get individual docs — the galleries are
indexed once in [_reference/showcase-index.md](./_reference/showcase-index.md).

## Page index

| Vertical | Route(s) | Status |
|---|---|---|
| [Auth](./auth/) | `/auth/{login,register,forgot-password,reset-password,verify-email,undo-password-change}` | ✅ Phase 1a |
| Marketing | [`(marketing)/pricing`](./pricing/page.md), [`(marketing)/about`](./about/page.md) | pricing ✅ Phase 4a — about ✅ Phase 5 |
| [Home](./v1/page.md) | `v1/` root landing | ✅ Phase 5 |
| [Messaging](./v1/messages/) | `v1/messages`, [`v1/chat-room`](./v1/chat-room/page.md) | ✅ Phase 3b |
| Social | `v1/friends`, `v1/find-friends(/requests)` | ✅ Phase 2a |
| Posts/Feed | `v1/feed`, `v1/posts/[uuid]`, `v1/share` | ✅ Phase 2b |
| [Notifications](./v1/notification/page.md) | `v1/notification` | ✅ Phase 3a |
| [Users](./v1/users/) | `v1/users/{list,detail/[uuid]}` | ✅ Phase 2a |
| [Billing](./billing-funnel.md) | `(marketing)/pricing → v1/plans → v1/checkout/[tier] → v1/settings/billing` — **not** `v1/premium`, see [billing-funnel.md](./billing-funnel.md#correction-to-this-efforts-own-original-plan) | ✅ Phase 4 |
| [Admin](./v1/admin/README.md) | `v1/admin`, `v1/admin/audit-logs` | ✅ Phase 5 |
| [Premium](./v1/premium/page.md) | `v1/premium` — **not** a subscription page, a live RBAC/tier-gate tech demo sharing nav placement with Billing, see [CROSS-035](../issues.md#cross-035) | ✅ Phase 4b |
| [Settings](./v1/settings/) | `v1/settings/{account,api-keys,billing,general,privacy,security,sessions,usage}` | security/sessions/api-keys ✅ Phase 1b — account/general/privacy ✅ Phase 2a — billing/usage ✅ Phase 4b (usage written post-Phase-5, see [usage/page.md](./v1/settings/usage/page.md)) |

## Reference

- [app-shell.md](./app-shell.md) — shared authenticated chrome (`src/views/v1/[lang]/`), not a page
- [billing-funnel.md](./billing-funnel.md) — the 5-step billing narrative hub (Phase 4)
- [_reference/showcase-index.md](./_reference/showcase-index.md) — the excluded demo/showcase galleries
