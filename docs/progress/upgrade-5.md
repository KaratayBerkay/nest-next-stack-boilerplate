# Upgrade audit #5 — performance: closing the gap to a 2-second budget

> Written 2026-07-12. Unlike `upgrade.md`–`upgrade-4.md` (security/correctness/
> code-quality), this pass is scoped purely to **performance** across both apps,
> targeting a ~2-second budget on four axes Berkay confirmed in scope:
>
> 1. **Page load** — LCP/TTI on the 9 core tier-split pages (feed, posts/[uuid],
>    messages, chat-room, premium, notification, find-friends, users, settings).
> 2. **API response time** — GraphQL/REST p95 under normal load.
> 3. **WS/realtime latency** — messaging/notification gateway round-trip.
> 4. **End-to-end critical flows** — login → feed, post creation, checkout,
>    total wall-clock, not just a single endpoint.
>
> Findings are verified against current code (file:line, not commit messages).
> No load test or Lighthouse run backs the "2s" number yet — finding #B9 and
> #F3 below are exactly that gap, and are called out as blocking the audit's
> own headline claim until they exist. Everything else here is a static-code
> read: query shapes, render strategy, caching, bundling — the parts of a 2s
> budget that are visible without running traffic.

**Priorities:** `P0` = most likely to blow the 2s budget today · `P1` =
high-value, real but smaller/likelier-under-load risk · `P2` = nice to have,
marginal at current scale. **Effort:** S (< ½ day) · M (1–2 days) · L (multi-day).

---

## Backend (`nest-js-boilerplate/`)

1. **P0 (M) — Unbounded, over-fetching `include`s on the two hottest reads.**
   `src/post/post.service.ts:144-166` (`findAll`, the feed query) includes the
   full `author` row and **all** `reactions` on every post in addition to
   `_count`, redundant and unbounded. `findOne:168-193` (post detail) includes
   every comment (each with its own author + reactions + reply count) with no
   `take` — a post with thousands of comments/reactions does O(n) row fetches
   and returns a multi-MB payload in one request. This is the single biggest
   risk to both the API-response and page-load budgets, since feed/post-detail
   are on the critical path of nearly every page. Fix: `select` only the
   fields each caller needs, paginate comments (`take`+cursor), drop the
   duplicate `reactions: true` where `_count` already answers the question.

2. **P1 (S/M) — No full-text/trigram index behind post search.** `findAll`'s
   `title`/`content` search (`post.service.ts:150-153`) uses
   `contains`/`insensitive`, i.e. `ILIKE '%term%'`. `schema.prisma`'s `Post`
   model (`:647-676`) only indexes `authorId`, `status+publishedAt`, and
   `categoryId` — nothing backs the search predicate, so it sequential-scans
   the table and gets linearly slower as posts grow. Fix: `pg_trgm` GIN index
   or a dedicated FTS column.

3. **P1 (M) — No cache-aside layer for hot reads.** Redis
   (`token-store.service.ts`, `caching/`) covers session/permission/unread/
   presence only. Feed queries, post detail, profile lookups, and
   `subscriptionTier` (checked by `TierGuard` on every gated request) all hit
   Postgres on every request with no TTL cache in front. Mirror the
   token-store pattern for these.

4. **P1 (M) — `realtime.gateway.ts` has no cross-instance fan-out.** Broadcasts
   go through in-memory `Map`s only (e.g. `wss.clients.forEach` around
   `:200`/`:860`) — confirmed no `@socket.io/redis-adapter` or equivalent in
   `package.json` or the gateway. Single-instance today this is fine and fast;
   the moment this deploys to >1 replica, messages silently stop reaching
   sockets connected to a different pod, which is a correctness bug more than
   a latency one but belongs in this audit because "fix WS scaling" and "keep
   realtime under budget" are the same piece of work. Bump to **P0** before
   any multi-replica deploy.

5. **P1 (M) — Synchronous per-friend notification fan-out blocks the mutation
   response.** `post.service.ts:50-65` (post creation) `Promise.all`s an
   insert + COUNT + 2 socket emits **per friend**, all before returning to the
   caller — response time scales linearly with friend count instead of being
   O(1). `notification.service.ts:85` (also hit from `comment.service.ts:57`
   and `reactions.service.ts:137`) similarly awaits an extra `unreadCount()`
   query sandwiched between two realtime emits before returning. Mail is
   already correctly queued via BullMQ (`mail.service.ts` →
   `mail.processor.ts`) — move the notification fan-out onto the same queue
   rather than doing it inline in the request path.

6. **P2 (S) — GraphQL has no DataLoader anywhere in `src/`.** Not biting today
   only because #1's eager `include`s trade N+1 for guaranteed over-fetch —
   fixing #1 by switching to field-level `select` without adding DataLoader
   would reintroduce classic per-parent N+1 on nested resolvers. Do these two
   together, not #1 alone.

7. **P2 (S) — Prisma connection pool left at driver default.**
   `prisma.service.ts:23-26` passes `PrismaPg` only a `connectionString`, no
   `max`; node-postgres defaults to `max: 10`. `k8s/secret.example.yaml:14-16`
   already documents a `connection_limit` knob that nothing sets. Fine at dev
   scale, a likely bottleneck under concurrent load once #1's queries get
   cheaper and throughput goes up.

8. **P2 (S) — `messaging-ws.gateway.ts:83-108`'s two count queries are
   sequential when they're independent.** `getUnreadCount` then
   `getTotalUnreadCount`, both awaited in series before the ack — trivial
   `Promise.all` fix, shaves one round trip off every DM send.

9. **P1 (M) — No load-testing baseline exists.** `docs/todo/02-backend.md:33-34`
   already flags this as open; confirmed still true (no k6/autocannon config
   anywhere in the repo — the only load-test artifact is a bespoke WS script,
   `test/load-test/ws-chat-load.mjs`, with no HTTP/GraphQL equivalent or CI
   wiring). **This is the gap that makes every "under 2s" claim in this doc
   unverified** — everything above is inferred from code shape, not measured
   p95s. Should be the first thing built once #1/#3 land, so there's a before/
   after number.

10. **P2 (S) — Compression is gzip-only, no brotli.** `main.ts:71` uses
    Express's `compression()` middleware (default gzip, gets no benefit from
    brotli's better ratio on JSON-heavy GraphQL responses). Small win, cheap
    to add (`compression` supports brotli via `zlib` in newer Node, or swap
    to a brotli-aware middleware).

## Frontend (`next-js-boilerplate/`)

1. **P0 (L) — Client-fetch-after-mount is the dominant pattern on all 9 core
   pages.** Each page's `page.tsx` is a Server Component only for auth/tier
   routing (`getSessionUser()`); actual content loads client-side after
   hydration via `useSuspenseQuery` → `apiFetch(...)`:
   `views/feed/FreeFeedList.tsx:65-82` (feed), `views/posts/[uuid]/
   PostDetailBaseView.tsx:95-98` (post hero content), `views/messages/
   FreePageView.tsx:54-62,96-100` (friends + conversations, 2 round trips),
   `views/find-friends/FreeFindFriendsContent.tsx:30-38`. The `Suspense`
   boundary in `FeedBaseView.tsx:51-53` gives a skeleton, not real content, so
   LCP still waits on a full CSR round trip through the BFF. This is the
   single biggest lever on the page-load axis of the budget. Fix: fetch
   initial content server-side in `page.tsx` and hydrate the query cache
   (TanStack Query supports this), or stream server-fetched `Suspense`
   boundaries instead of client-fetched ones.

2. **P0 (S/M) — `next/image` is essentially unused; a real `<img>` is likely
   the LCP element.** Only 2 files in the whole app use `next/image`
   (`(demos)/images/page.tsx`, `NavigationOverlay.tsx`) — everything else uses
   raw `<img>`: `components/feed/PostContent.tsx:17-22`,
   `components/ui/avatar/avatar.tsx:48`, `views/share/PageContent.tsx:188`.
   Worst instance: `views/posts/[uuid]/PostDetailBaseView.tsx:231` sets
   `loading="lazy"` on the post's hero image — almost certainly the LCP
   element on `/posts/[uuid]`, and it's explicitly deferred. Fix: `next/image`
   with `priority` on above-the-fold hero/avatar images, `sizes` set,
   `loading="lazy"` reserved for genuinely below-the-fold images.

3. **P1 (S) — No bundle analyzer or size budget.** Confirmed absent (`next.config.
   ts`, `package.json` scripts) — matches the two still-open P1 items in
   `docs/todo/03-frontend.md:40-42`. `next/dynamic` is used in only 3 files,
   none of the 9 core pages. Add `@next/bundle-analyzer`, capture a baseline,
   wire a size-budget assertion into `frontend-ci.yml` (already exists per
   `upgrade-4.md` #3) so bundle growth is visible before it costs LCP.

4. **P1 (M) — Zero HTTP caching / ISR anywhere in the app.**
   `src/lib/backend.ts`'s `graphqlFetch` (`:241-264`) and `backendFetch`
   (`:49-76`) never set `cache`/`next.revalidate` — Next defaults to
   fully dynamic/uncached. No page exports `revalidate`; the only
   `revalidatePath`/`revalidateTag` usage is the `(demos)/caching` teaching
   page, not real routes. Every navigation re-fetches from the backend with
   no server-side cache layer at all. Fix: tag/revalidate cacheable reads
   (public feed, post detail before personalization) so repeat navigations
   don't pay full backend latency.

5. **P1 (S/M) — `AuthProvider` does a client round trip even when SSR already
   has the user.** `features/auth/hooks/useAuth.tsx:56-84`: `initialUser` is
   used to seed state, but the `useEffect` **still** fires
   `apiFetch(AUTH_TOKEN_URL)` on mount in both the `ssrUser` branch (`:67`)
   and the plain `initialUser` branch (`:77`) to fetch the WS access token.
   That token is what gates realtime start —
   `lib/realtime/useRealtimeCoordination.ts:39-40` (`if (!token) return;`) —
   so chat/feed live-updates/presence can't begin until SSR → hydrate →
   `/api/auth/token` resolves, serializing an extra network hop in front of
   every realtime feature on every page load. Fix: have the SSR layer hand
   down the access token alongside `initialUser` (or a short-lived cookie the
   client can read synchronously) instead of re-fetching it.

6. **P2 (S) — Stripe SDK statically imported, not code-split off checkout.**
   `components/StripeProvider.tsx:3-4` and `features/billing/ui/
   StripeCardForm.tsx` import `@stripe/react-stripe-js`/`@stripe/stripe-js` at
   module scope, shipping Stripe's bundle to every page that pulls in the
   provider tree, not just the checkout page. Fix: `next/dynamic` with
   `ssr: false` around the Stripe-dependent component.

7. **P2 (S) — Ad hoc `useEffect`+`fetch` bypasses the shared query cache in
   places.** `integrations/tanstack-query/QueryProvider.tsx:8-20` gives a
   proper shared `QueryClient` (good, in use on the 4 pages above), but e.g.
   `views/settings/PageContent.tsx` still fetches ad hoc — inconsistent
   caching/dedup discipline page to page. Route remaining ad hoc fetches
   through the same `useSuspenseQuery`/`useQuery` layer.

8. **P1 (M) — No Lighthouse CI / Core Web Vitals baseline.** Same gap as
   backend #9: `docs/todo/03-frontend.md:40-41` already flags this as open,
   confirmed still true. Without it, "under 2s LCP" for the 9 core pages is
   this doc's inference from code shape, not a measured number. Should land
   together with #1 and #2 above so there's a before/after.

---

## What's already fine (not re-litigated)

Fonts (`next/font/google` in `app/layout.tsx:3`, no external `<link>`
font-loading), `output: "standalone"` + security headers in `next.config.ts`,
no `middleware.ts` doing a per-navigation network call (none exists at all),
mail already correctly queued through BullMQ, and the shared
`QueryProvider`/TanStack Query dedup layer existing at all (#F7 is about
consistency, not the layer's absence). GraphQL complexity limiting exists
(`src/complexity/complexity.plugin.ts:15`, `MAX_COMPLEXITY=200`), just not yet
wired to env per the pre-existing todo item.

## Suggested execution order

Roughly effort-adjusted, sequenced so measurement (#B9/#F8) lands right after
the changes big enough to need proving:

1. **B1** (M) — fix the feed/post-detail over-fetch; pairs with **B6**
   (DataLoader) so it doesn't just trade over-fetch for N+1.
2. **F1 + F2** (L + S/M) — SSR/hydrate the 4 client-fetch-after-mount pages,
   fix the hero-image `next/image`/`priority` gap. These two are the biggest
   levers on the page-load axis.
3. **B9 + F8** (M each) — stand up k6/autocannon for the backend and
   Lighthouse CI for the frontend now that #1/#2 above give something worth
   measuring against a before/after.
4. **B3 + F4** (M each) — cache-aside for hot backend reads, HTTP caching/ISR
   on cacheable frontend routes.
5. **B5** (M) — move notification fan-out onto the existing BullMQ queue.
6. **F5** (S/M) — stop re-fetching the WS token when SSR already has a user.
7. Remaining P1/P2 items (**B2, B7, B8, B10, F3, F6, F7**) — small,
   independent, pick up opportunistically.
8. **B4** (WS Redis adapter) — bump to blocking priority the moment a
   multi-replica deploy is planned; otherwise fine to defer.
