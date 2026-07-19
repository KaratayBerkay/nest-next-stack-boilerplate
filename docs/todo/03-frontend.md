# 03 — Frontend (Next.js) enhancements

Per `docs/frontend/STATUS.md` the docs-coverage project is done (58/~60 verified, 110+
tests); the one blocked item is upstream. What remains is wiring against the real stack
and production-grade extras the checklist deliberately left to "the consuming app".

## P0 — Wire the real stack (see 01-stack-integration.md for the compose side)

- [ ] **Cross-stack auth e2e** — the two unchecked boxes in `docs/frontend/TODO.md` §16
      (register→login→me→logout round-trip; refresh flow). Everything else in the auth
      workstream is done and waiting on this proof.
- [ ] **Messaging UI against `ws://localhost:3003`** — once the `messaging-ws` compose
      service exists, add an e2e that exercises `NEXT_PUBLIC_MSG_WS_URL` end-to-end.

## P1 — Web Push, end to end (M)

The backend already has a `push-notification` module and VAPID env plumbing
(`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT` in
`prod/backend/.env.production.example`); the frontend has no service worker or
subscription UI. This is the highest-value cross-stack feature that's half-built:

- [ ] Service worker + `PushManager` subscription flow, posting the subscription to the
      backend's existing endpoint.
- [ ] Notification permission UX + a demo page in the demos header pattern.
- [ ] e2e with Playwright's notification permission fakes.

## P1 — Error reporting & session diagnostics (S/M)

`onRequestError` + OTel instrumentation exist, but errors go nowhere durable.

- [ ] Sentry (or GlitchTip, self-hosted to match the ELK spirit) for both client and
      server errors, wired through `instrumentation.ts` so it coexists with
      `@vercel/otel`.
- [ ] Source-map upload in the standalone Docker build.

## P1 — Quality budgets in CI (S each)

- [x] **Accessibility**: `@axe-core/playwright` pass over the demo pages — home-page
      axe runs clean in CI; auth-gated pages (feed, UI gallery) skip when no backend
      is available (CI_NO_BACKEND). Full coverage blocked on backend-in-CI (see 01).
- [x] **Performance**: Lighthouse CI — `lighthouserc.json`, `pnpm lighthouse:ci` script,
      and CI step (frontend-ci.yml:63) all in place; budgets assert CLS ≤0.1, LCP ≤4s, TBT ≤300ms.
- [x] **Bundle analysis**: `@next/bundle-analyzer` dep installed, `ANALYZE=true next build`
      wired in `next.config.ts`, `pnpm analyze` script exists.

## P2 — Nice to have

- [ ] **#25 runtimes** — still blocked upstream (`cacheComponents` removes
      `export const runtime`); re-check each Next.js minor and unblock the checklist's
      last item when possible.
- [ ] **Component workshop** — `components.md` inventories the UI; promote it to
      Storybook (or keep the md but add visual regression via Playwright screenshots).
- [ ] **PWA manifest + offline page** — natural companion to the Web Push work.
- [x] **React Compiler** — enabled (`reactCompiler: true` in `next.config.ts`), documented
      as evaluated and adopted.
- [ ] **Rate-limit-aware BFF** — surface backend `429`/`Retry-After` from the throttle
      module in the BFF fetch helper (`src/lib/backend.ts`) instead of generic errors.
