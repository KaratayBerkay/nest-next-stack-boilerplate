# Frontend (`next-js-boilerplate`)

Next.js App Router, BFF pattern (see
[../architecture.md § BFF proxy pattern](../architecture.md#bff-proxy-pattern--nextjs-sits-between-the-browser-and-the-backend)) —
the browser never calls the NestJS backend directly.

## Scope of this documentation

`next-js-boilerplate/src` has 195 `page.tsx` files repo-wide. **35 are real application pages**; the
rest are component-showcase/demo galleries (a shadcnblocks marketing-block gallery, a UI-kit gallery,
a forms gallery, and several Next.js framework-pattern demos) that exist to exercise the design
system, not as product functionality. Only the real pages get individual docs — the galleries are
indexed once in [_reference/showcase-index.md](./_reference/showcase-index.md) (Phase 5).

## Page index

| Vertical | Route(s) | Status |
|---|---|---|
| Auth | `/auth/{login,register,forgot-password,reset-password,verify-email,undo-password-change}` | ⬜ Phase 1 |
| Marketing | `(marketing)/{about,pricing}` | ⬜ Phase 4 (pricing, part of the billing funnel) / Phase 5 (about) |
| Home | [`v1/`](./v1/) root landing | ⬜ Phase 5 |
| [Messaging](./v1/messages/) | `v1/messages`, `v1/chat-room` | messages ✅ — chat-room ⬜ Phase 3 |
| Social | `v1/friends`, `v1/find-friends(/requests)` | ⬜ Phase 2 |
| Posts/Feed | `v1/feed`, `v1/posts/[uuid]`, `v1/share` | ⬜ Phase 2 |
| Notifications | `v1/notification` | ⬜ Phase 3 |
| Users | `v1/users/{list,detail/[uuid]}` | ⬜ Phase 2 |
| Billing | `(marketing)/pricing → v1/plans → v1/checkout/[tier] → v1/premium → v1/settings/billing` | ⬜ Phase 4 |
| Admin | `v1/admin`, `v1/admin/audit-logs` | ⬜ Phase 5 |
| Settings | `v1/settings/{account,api-keys,billing,general,privacy,security,sessions,usage}` | ⬜ split across Phases 1/2/4 |

## Reference

- [app-shell.md](./app-shell.md) — shared authenticated chrome (`src/views/v1/[lang]/`), not a page (Phase 5)
- [billing-funnel.md](./billing-funnel.md) — the 5-step billing narrative hub (Phase 4)
- [_reference/showcase-index.md](./_reference/showcase-index.md) — the excluded demo/showcase galleries (Phase 5)
