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

> **Control run (2026-07-13):** commit `b999fc6` claims "implement all 18
> items". Re-verified every item against current code (not the commit
> message) via two parallel static-review passes, one per app. **Not
> gate-clean — 8/18 fully pass, 7/18 are real-but-incomplete, 3/18 don't hold
> up.** Status marker + evidence added inline to each item below. Nothing has
> been fixed as part of this control run — findings only.
>
> Backend: 5 pass (B2, B4, B7, B8, B10), 3 partial (B1, B3, B5), 2 fail
> (B6, B9). Frontend: 3 pass (F5, F6, F7), 4 partial (F1, F2, F3, F4), 1 fail
> (F8). Two findings are worth flagging above the rest: **B1 introduced a
> regression** (`whoReacted` GraphQL field now returns `undefined` names for
> every reactor, because the trimmed `reactions.select` dropped the `user`
> relation it depends on), and **B9's load-test script targets a REST
> endpoint (`/api/posts`) that doesn't exist** — this backend is GraphQL-only,
> so the script 404s on every request and the audit's core "unverified 2s
> claim" gap is still open.

> **Second control run (2026-07-13, same day, commit `d1413ce`):** commit
> message claims "close all 13 upgrade-5 remaining audit gaps." Re-verified
> every touched item against current code. **Genuine progress — backend is
> now gate-clean-ish (8/10 pass, 2 partial, 0 fail), frontend is closer but
> not there (4/8 pass, 3 partial, 1 still fail) — and one claimed fix is a
> new regression.**
>
> Backend: **B3, B4, B5, B6 now fully pass** (profile cache + invalidation,
> `emitToUser` Redis publish, fire-and-forget unread count, and a real
> request-scoped DataLoader wired into `PostResolver.author` that also
> quietly finishes B1's author-over-fetch by replacing the eager `include`
> with a batched loader). **B9 goes fail→partial**: `load-test/baseline.js`
> now hits real GraphQL and stops 404ing, but it's still not referenced by
> any `package.json` script or CI workflow, so it still doesn't run itself.
> **B1 stays partial**: the `whoReacted` regression is fixed (reactions now
> select `user.name`), but the duplicate `reactions` list fetched alongside
> `_count.reactions` on every post — the actual over-fetch the finding asked
> to trim — is still there; the commit message waves it off as "already
> limited by take," which isn't what was asked.
>
> Frontend: **F2, F5, F6, F7 pass.** **F1 and F8 stay partial** with smaller
> footprints than before (F1: messages page's friends list is now SSR'd, but
> its conversations fetch and the entire `find-friends` page — both named in
> the original finding — are untouched; F8: 3 of 4 LHCI URLs now resolve, but
> the 4th still points at a post id, `example-post`, that doesn't exist
> anywhere in the repo). **F3 still fails** — worse, it's mislabeled: the
> commit credits "F3: add Lighthouse CI step to frontend-ci.yml," but that
> change is F8's ask (wire LHCI into CI), not F3's (a bundle-size-budget
> assertion on top of the already-wired analyzer); no size-budget assertion
> exists anywhere after this commit. **F4 is a new regression**: `next: {
> revalidate: 60 }` was added unconditionally to both `graphqlFetch` and
> `backendFetch` in `next-js-boilerplate/src/lib/backend.ts` — the single
> shared client behind ~90 call sites, including every mutation (login,
> register, reactions, checkout, notifications/read, sessions/revoke).
> `graphqlFetch` takes no per-call override, so nothing can opt out. For
> anonymous requests (no Cookie/Authorization header — e.g. the login
> mutation itself, pre-auth), this puts mutation responses straight into
> Next's Data Cache for 60s: a transient login failure with the same
> credentials can be replayed from cache instead of hitting the backend
> again. For authenticated requests, Next documents that Cookie/Authorization
> headers auto-exclude a fetch from the Data Cache on a dynamic route — but
> that exclusion is known-unreliable for POST (vercel/next.js#52405), and
> `graphqlFetch` always POSTs. Either this "fix" is a no-op for most
> authenticated traffic, or it risks caching personalized/mutation responses
> — neither is what F4 asked for, and it wasn't caught because nothing in the
> test suite exercises Next's fetch cache semantics.

**Priorities:** `P0` = most likely to blow the 2s budget today · `P1` =
high-value, real but smaller/likelier-under-load risk · `P2` = nice to have,
marginal at current scale. **Effort:** S (< ½ day) · M (1–2 days) · L (multi-day).

---

## Backend (`nest-js-boilerplate/`)

1. ⚠️ **Partial.** **P0 (M) — Unbounded, over-fetching `include`s on the two hottest reads.**
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

   **Verified 2026-07-13:** `post.service.ts` findAll/findOne now `select`
   a trimmed `author` and paginate comments with a fixed `take: 20` (no
   cursor arg actually exposed, so it's page-1-only pagination, not real
   cursor pagination). Two problems remain: (a) `reactions` is still fetched
   as a list (`take: 50`/`take: 100`) *alongside* `_count.reactions` — the
   duplicate the finding asked to drop is still there; (b) **regression**:
   the trimmed `reactions.select` never selects `user.name`, but
   `post.resolver.ts` `whoReacted` (a real PREMIUM-gated GraphQL field)
   reads `r.user?.name` — every reactor name now resolves to `undefined`.
   Not caught by `post.resolver.spec.ts` since its mock hand-supplies `user`.

   **Verified again 2026-07-13 (commit `d1413ce`):** the regression is
   fixed — `post.service.ts` findAll/findOne both now select
   `user: { select: { name: true } }` inside `reactions`, so `whoReacted`
   resolves real names again. Bonus: the per-post `author` eager-select was
   removed entirely and replaced by `PostResolver.author`, a real
   `@ResolveField` batched through `DataloaderService.getUserLoader()` — this
   quietly finishes the "author" half of this finding via B6's DataLoader
   rather than a `select` trim. But the duplicate-fetch half of the finding
   is untouched: `reactions` is still fetched as a full list (`take: 50`/
   `take: 100`) *alongside* `_count.reactions` on every post, exactly as
   before — the commit message dismisses this as "already limited by take —
   no unbounded query," which answers a different question than the one the
   finding asked ("drop the duplicate `reactions: true` where `_count`
   already answers the question"). Still ⚠️ **Partial**, narrower than before.

2. ✅ **Fixed** (was already true, re-confirmed). **P1 (S/M) — No full-text/trigram index behind post search.** `findAll`'s
   `title`/`content` search (`post.service.ts:150-153`) uses
   `contains`/`insensitive`, i.e. `ILIKE '%term%'`. `schema.prisma`'s `Post`
   model (`:647-676`) only indexes `authorId`, `status+publishedAt`, and
   `categoryId` — nothing backs the search predicate, so it sequential-scans
   the table and gets linearly slower as posts grow. Fix: `pg_trgm` GIN index
   or a dedicated FTS column.

   **Verified 2026-07-13:** `prisma/migrations/20260711000000_add_outbox_
   updatedat_and_pgtrgm/migration.sql` has `CREATE EXTENSION IF NOT EXISTS
   pg_trgm` + a GIN index on `title`; `.../20260711000001_add_post_content_
   gin_index/migration.sql` adds the GIN index on `content`. Real, applied
   migrations, not just a schema comment.

3. ✅ **Fixed (as of second pass, `d1413ce`).** **P1 (M) — No cache-aside layer for hot reads.** Redis
   (`token-store.service.ts`, `caching/`) covers session/permission/unread/
   presence only. Feed queries, post detail, profile lookups, and
   `subscriptionTier` (checked by `TierGuard` on every gated request) all hit
   Postgres on every request with no TTL cache in front. Mirror the
   token-store pattern for these.

   **Verified 2026-07-13:** `src/caching/cache-aside.service.ts` is a real
   get/set/invalidate/`getOrFetch` implementation, correctly wired into
   `post.service.ts` findAll/findOne (30s/60s TTL) with invalidation on post
   create/update. Two gaps: (a) profile lookups and `subscriptionTier` are
   never cached — `CacheAsideService` is imported nowhere outside
   `post.service.ts`; (b) `comment.service.ts` and `reactions.service.ts`
   never invalidate the post cache, so a new comment or reaction doesn't
   bust `cache:post:{id}` — post detail can serve stale comment/reaction
   data for up to 60s after a write.

   **Verified again 2026-07-13 (commit `d1413ce`):** ✅ **Fixed**, both
   gaps closed. `profile.resolver.ts`'s `myProfile` now goes through
   `cache.getOrFetch('cache:profile:{userId}', ..., 60)`, and
   `profile.service.ts`'s update invalidates that key. `comment.service.ts`
   and `reactions.service.ts` now call `cache.invalidate('cache:post:{id}')`
   and `cache.invalidate('cache:feed:*')` on every create/update/delete path
   (both use Redis `KEYS`+`DEL` under the hood, which supports the glob
   pattern). `subscriptionTier`/`TierGuard` reads `req.user.tier` off the
   already-authenticated request rather than hitting Postgres directly, so
   that part of the original finding wasn't a live gap to begin with.

4. ✅ **Fixed** (last gap closed in second pass). **P1 (M) — `realtime.gateway.ts` has no cross-instance fan-out.** Broadcasts
   go through in-memory `Map`s only (e.g. `wss.clients.forEach` around
   `:200`/`:860`) — confirmed no `@socket.io/redis-adapter` or equivalent in
   `package.json` or the gateway. Single-instance today this is fine and fast;
   the moment this deploys to >1 replica, messages silently stop reaching
   sockets connected to a different pod, which is a correctness bug more than
   a latency one but belongs in this audit because "fix WS scaling" and "keep
   realtime under budget" are the same piece of work. Bump to **P0** before
   any multi-replica deploy.

   **Verified 2026-07-13:** `realtime.gateway.ts` has genuine bidirectional
   Redis pub/sub — a subscriber on `WS_CHANNEL` re-broadcasts locally with a
   re-entrancy guard, and `broadcastAll`/`broadcastToRoom`/`emitToTopic`/
   `emitToService`/`emitToPage` all publish. Gap: `emitToUser` never
   publishes — used by `messaging.resolver.ts` for `message-read` events,
   which still won't cross instances.

   **Verified again 2026-07-13 (commit `d1413ce`):** ✅ **Fixed.**
   `emitToUser` now publishes `{ target: 'emitToUser', userId, frame }` to
   `WS_CHANNEL`, and the Redis subscriber's `switch` gained an `'emitToUser'`
   case that re-broadcasts locally via `this.emitToUser(userId, frame)` —
   genuinely closes the last gap, `message-read` events now cross instances.

5. ✅ **Fixed (as of second pass, `d1413ce`).** **P1 (M) — Synchronous per-friend notification fan-out blocks the mutation
   response.** `post.service.ts:50-65` (post creation) `Promise.all`s an
   insert + COUNT + 2 socket emits **per friend**, all before returning to the
   caller — response time scales linearly with friend count instead of being
   O(1). `notification.service.ts:85` (also hit from `comment.service.ts:57`
   and `reactions.service.ts:137`) similarly awaits an extra `unreadCount()`
   query sandwiched between two realtime emits before returning. Mail is
   already correctly queued via BullMQ (`mail.service.ts` →
   `mail.processor.ts`) — move the notification fan-out onto the same queue
   rather than doing it inline in the request path.

   **Verified 2026-07-13:** the friend-post fan-out genuinely moved off the
   request path — `post.service.ts` post-creation now calls
   `notificationQueue.enqueueFriendPostNotification(...)` (fire-and-forget
   `.catch()`), processed by a real BullMQ `notification.processor.ts`
   mirroring mail's pattern. But the finding's second half — the
   `unreadCount()` query sandwiched between two realtime emits in
   `notification.service.ts:~85`, also hit from comment/reaction creation —
   is untouched, still synchronous, still in the request path.

   **Verified again 2026-07-13 (commit `d1413ce`):** ✅ **Fixed.**
   `notification.service.ts`'s `create()` now fires `this.unreadCount(...)
   .then(...).catch(() => {})` instead of `await`ing it before the count
   emit — the mutation response no longer waits on that query.

6. ✅ **Fixed (as of second pass, `d1413ce`).** **P2 (S) — GraphQL has no DataLoader anywhere in `src/`.** Not biting today
   only because #1's eager `include`s trade N+1 for guaranteed over-fetch —
   fixing #1 by switching to field-level `select` without adding DataLoader
   would reintroduce classic per-parent N+1 on nested resolvers. Do these two
   together, not #1 alone.

   **Verified 2026-07-13:** `src/common/dataloader/dataloader.service.ts`
   has real `getUserLoader`/`getPostLoader`, and `DataloaderModule` is
   registered globally in `app.module.ts`. But no resolver anywhere calls
   `.load()` — a repo-wide grep for `DataloaderService`/`getUserLoader`/
   `getPostLoader` outside the dataloader files themselves returns nothing.
   The N+1 risk this item exists to close (once #1's `select` change is live)
   is unmitigated. Bonus latent bug if this ever does get wired in: loaders
   are cached on a singleton service (no `Scope.REQUEST`), so DataLoader's
   per-key cache would never expire except on app restart — permanent stale
   user/post data across all requests, not just per-request memoization.

   **Verified again 2026-07-13 (commit `d1413ce`):** ✅ **Fixed.**
   `DataloaderService` is now `@Injectable({ scope: Scope.REQUEST })` (fixes
   the latent stale-cache bug too, since a fresh instance — and fresh
   `DataLoader` — is created per request), and `PostResolver` now has a real
   `@ResolveField() async author(@Parent() post: Post)` that calls
   `this.dataloader.getUserLoader().load(post.authorId)`. Multiple posts on
   one feed page now batch into a single `user.findMany` instead of N+1.

7. ✅ **Fixed.** **P2 (S) — Prisma connection pool left at driver default.**
   `prisma.service.ts:23-26` passes `PrismaPg` only a `connectionString`, no
   `max`; node-postgres defaults to `max: 10`. `k8s/secret.example.yaml:14-16`
   already documents a `connection_limit` knob that nothing sets. Fine at dev
   scale, a likely bottleneck under concurrent load once #1's queries get
   cheaper and throughput goes up.

   **Verified 2026-07-13:** `prisma.service.ts` now passes
   `max: config.get<number>('DATABASE_POOL_MAX', 20)` into the real
   `PrismaPg`/`pg.Pool` constructor.

8. ✅ **Fixed.** **P2 (S) — `messaging-ws.gateway.ts:83-108`'s two count queries are
   sequential when they're independent.** `getUnreadCount` then
   `getTotalUnreadCount`, both awaited in series before the ack — trivial
   `Promise.all` fix, shaves one round trip off every DM send.

   **Verified 2026-07-13:** `messaging-ws.gateway.ts` now wraps both counts
   in `Promise.all([...])`.

9. ⚠️ **Partial (upgraded from fail in second pass).** **P1 (M) — No load-testing baseline exists.** `docs/todo/02-backend.md:33-34`
   already flags this as open; confirmed still true (no k6/autocannon config
   anywhere in the repo — the only load-test artifact is a bespoke WS script,
   `test/load-test/ws-chat-load.mjs`, with no HTTP/GraphQL equivalent or CI
   wiring). **This is the gap that makes every "under 2s" claim in this doc
   unverified** — everything above is inferred from code shape, not measured
   p95s. Should be the first thing built once #1/#3 land, so there's a before/
   after number.

   **Verified 2026-07-13:** `load-test/baseline.js` exists at repo root and
   does hit HTTP, not just WS — but it targets `/api/posts`/`/api/posts/:id`
   as REST endpoints, and **no such REST controller exists**: Post is
   GraphQL-only (`post.resolver.ts`). This script 404s on every request
   against the real backend. It's also not referenced by any `package.json`
   script or `.github/workflows/*.yml` — nobody runs it. No GraphQL load
   test exists at all, so the audit's headline "no measured p95s" gap is
   still fully open.

   **Verified again 2026-07-13 (commit `d1413ce`):** script now works —
   `FEED_QUERY`/`POST_QUERY` are real GraphQL documents POSTed to `/graphql`
   matching the actual schema, no more 404s. But it's still not wired
   anywhere: `nest-js-boilerplate/package.json` only has `load:run` for the
   pre-existing WS script (`test/load-test/ws-chat-load.js`); no script and
   no CI workflow runs `load-test/baseline.js`. So "a human can now get a
   real number by running it manually" is true, but "a load-testing
   baseline exists" (automated, repeatable, before/after-comparable) still
   isn't. Minor: the "search" block reuses `FEED_QUERY`, which only declares
   `$cursor`/`$take`, with an extra `search` variable the query never
   references — GraphQL silently drops unused variables, so this block
   doesn't actually exercise the ILIKE/trigram search path B2 added an index
   for, just repeats the plain feed query under a misleading label.

10. ✅ **Fixed.** **P2 (S) — Compression is gzip-only, no brotli.** `main.ts:71` uses
    Express's `compression()` middleware (default gzip, gets no benefit from
    brotli's better ratio on JSON-heavy GraphQL responses). Small win, cheap
    to add (`compression` supports brotli via `zlib` in newer Node, or swap
    to a brotli-aware middleware).

    **Verified 2026-07-13:** `main.ts` now configures
    `compression({ brotli: { params: { [zlib.constants.BROTLI_PARAM_QUALITY]:
    5 } } })`; `compression@1.8.1` genuinely supports brotli natively, so
    this isn't a no-op.

## Frontend (`next-js-boilerplate/`)

1. ⚠️ **Partial — 2 of 4 named pages.** **P0 (L) — Client-fetch-after-mount is the dominant pattern on all 9 core
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

   **Verified 2026-07-13:** `app/v1/[lang]/feed/page.tsx` and
   `app/v1/[lang]/posts/[uuid]/page.tsx` now do real server-side
   `graphqlFetch` and pass `initialFeedData`/`initialPostData` down; the
   Free/Medium/Premium list and detail views wire that into
   `useSuspenseQuery`'s `initialData` with `staleTime: 30_000`, so the
   client genuinely doesn't refetch on mount for these two. But `views/
   messages/FreePageView.tsx` and `views/find-friends/
   FreeFindFriendsContent.tsx` — 2 of the 4 pages named in this finding —
   were not touched by the fix commit and are still fully client-fetch-
   after-mount, unchanged.

   **Verified again 2026-07-13 (commit `d1413ce`):** narrower gap, still
   ⚠️ **Partial.** `messages/page.tsx` now does a server-side
   `backendFetch(MESSAGES_FRIENDS_URL)` and passes `initialFriends` down;
   `FreePageView.tsx`'s friends `useQuery` now sets `initialData:
   initialFriends, staleTime: 30_000` — that round trip is genuinely gone.
   But the *second* round trip this finding named on the same page —
   conversations, via `useConversations()` — is untouched (no SSR data,
   still a plain client fetch), and `find-friends/
   FreeFindFriendsContent.tsx` (`git log` confirms its last touch predates
   this audit) is completely untouched — still `useSuspenseQuery` +
   `apiFetch` with no `initialData`. 1 of the 2 named round trips on 1 of
   the 4 named pages closed; the commit message's "SSR pre-fetch friends
   list for messages page" is accurate but oversells the finding as done.

2. ⚠️ **Partial — worst offender fixed, 2 named files untouched.** **P0 (S/M) — `next/image` is essentially unused; a real `<img>` is likely
   the LCP element.** Only 2 files in the whole app use `next/image`
   (`(demos)/images/page.tsx`, `NavigationOverlay.tsx`) — everything else uses
   raw `<img>`: `components/feed/PostContent.tsx:17-22`,
   `components/ui/avatar/avatar.tsx:48`, `views/share/PageContent.tsx:188`.
   Worst instance: `views/posts/[uuid]/PostDetailBaseView.tsx:231` sets
   `loading="lazy"` on the post's hero image — almost certainly the LCP
   element on `/posts/[uuid]`, and it's explicitly deferred. Fix: `next/image`
   with `priority` on above-the-fold hero/avatar images, `sizes` set,
   `loading="lazy"` reserved for genuinely below-the-fold images.

   **Verified 2026-07-13:** `PostDetailBaseView.tsx`'s hero image now uses
   `next/image` with `priority` and no `loading="lazy"`; `PostContent.tsx`
   also converted. But `components/ui/avatar/avatar.tsx:48` and `views/
   share/PageContent.tsx:188` — both explicitly named in this finding — are
   confirmed still raw `<img>`, untouched by the fix commit.

   **Verified again 2026-07-13 (commit `d1413ce`):** ✅ **Fixed** for what
   this finding asked. Both named files now use `next/image` with explicit
   `width`/`height` (avatar) or `fill` (share preview). One caveat: both
   pass `unoptimized`, which turns off Next's actual resize/format
   optimization — you get CLS protection from explicit dimensions and
   default lazy-loading, not the compression/responsive-`srcset` gain that
   was the point of the original P0 finding for hero images. That's fine
   here since neither is the LCP element on its page (small avatar
   thumbnails, a post-upload preview), unlike the `PostDetailBaseView.tsx`
   hero image this finding was really about — but worth knowing if `next/
   image` coverage gets audited again and someone assumes "uses next/image"
   means "gets next/image's optimization."

3. ⚠️ **Partial — analyzer wired, no CI budget.** **P1 (S) — No bundle analyzer or size budget.** Confirmed absent (`next.config.
   ts`, `package.json` scripts) — matches the two still-open P1 items in
   `docs/todo/03-frontend.md:40-42`. `next/dynamic` is used in only 3 files,
   none of the 9 core pages. Add `@next/bundle-analyzer`, capture a baseline,
   wire a size-budget assertion into `frontend-ci.yml` (already exists per
   `upgrade-4.md` #3) so bundle growth is visible before it costs LCP.

   **Verified 2026-07-13:** `next.config.ts` now conditionally wraps the
   config with `@next/bundle-analyzer` behind `ANALYZE=true`. But no
   size-budget assertion was added to `frontend-ci.yml` — this finding
   explicitly asked for both, only the analyzer half landed.

   **Verified again 2026-07-13 (commit `d1413ce`):** ❌ **Still not fixed**
   — and mislabeled. The commit message lists "F3: add Lighthouse CI step to
   frontend-ci.yml," but that's the only change to `frontend-ci.yml` in this
   commit (a `pnpm lighthouse:ci` step), and it's F8's ask (wire the
   already-existing `lighthouserc.json` into CI), not F3's (a bundle
   *size-budget* assertion on top of the analyzer). No size-budget check —
   `bundlewatch`, a `next.config.ts` webpack `performance.maxAssetSize`, a
   CI step that fails on bundle growth, anything — exists anywhere in the
   repo after this commit. This finding is exactly where the control run
   left it; the "13 gaps closed" commit message double-counted F8's fix as
   also closing F3.

4. ⚠️ **Partial — narrower than the finding.** **P1 (M) — Zero HTTP caching / ISR anywhere in the app.**
   `src/lib/backend.ts`'s `graphqlFetch` (`:241-264`) and `backendFetch`
   (`:49-76`) never set `cache`/`next.revalidate` — Next defaults to
   fully dynamic/uncached. No page exports `revalidate`; the only
   `revalidatePath`/`revalidateTag` usage is the `(demos)/caching` teaching
   page, not real routes. Every navigation re-fetches from the backend with
   no server-side cache layer at all. Fix: tag/revalidate cacheable reads
   (public feed, post detail before personalization) so repeat navigations
   don't pay full backend latency.

   **Verified 2026-07-13:** `src/app/api/posts/route.ts` and `.../posts/
   [id]/route.ts` now set `Cache-Control: public, max-age=30…/60…`, and
   `staleTime: 30_000` is on the feed/post queries. But `src/lib/
   backend.ts`'s `graphqlFetch`/`backendFetch` — the actual target of this
   finding — were not touched at all, no `cache`/`next.revalidate` anywhere
   in that file. The SSR `page.tsx` calls added by #1 still hit the backend
   fully uncached; only the client-facing BFF route responses got headers,
   which is narrower than what this finding asked for.

   **Verified again 2026-07-13 (commit `d1413ce`):** ⚠️ **Partial, and a
   new regression.** `backend.ts` is touched now: both `graphqlFetch` and
   `backendFetch` unconditionally add `next: { revalidate: 60 }` to every
   `fetch()` call. The problem is these are the *shared, low-level* client
   functions — confirmed via repo-wide grep, ~90 call sites use
   `graphqlFetch` alone, covering essentially all backend traffic, not just
   the cacheable public reads this finding meant. `graphqlFetch` in
   particular takes no `RequestInit`/cache override parameter, so no caller
   can opt out. It's always a POST, and it's what mutations go through too
   — confirmed directly: `app/api/auth/login/route.ts`'s `LOGIN_QUERY`,
   `app/api/reactions/route.ts`'s `CREATE_REACTION_MUTATION`,
   `notifications/read`, `sessions/revoke(-others)`, `profile/update`,
   `api-keys/[id]` all call it.
   - For anonymous requests (no Cookie/session header — e.g. login itself,
     pre-auth) this puts the response straight into Next's Data Cache for
     60s with no auth header to trigger any exclusion: two identical login
     POSTs (same credentials, e.g. a retry after a transient failure) within
     that window get the *cached* response replayed, not a fresh call to
     the backend.
   - For authenticated requests, Next.js is documented to auto-exclude
     fetches carrying Cookie/Authorization headers from the Data Cache on a
     dynamic route (which these are, since `backend.ts` calls `cookies()`)
     — but that exclusion is a known-unreliable case specifically for POST
     (`vercel/next.js#52405`), and every `graphqlFetch` call is POST. So
     this is genuinely one of two outcomes, not a clean fix either way: the
     `revalidate: 60` is a no-op for most authenticated traffic (Next
     ignores it), or it's a live risk of caching personalized query/mutation
     responses across requests. Nothing in the test suite would catch
     either, since neither is exercised outside a real Next.js server.
   - Separate from the caching-semantics question: even in the "it's a
     no-op for authenticated requests" reading, this still doesn't do what
     F4 asked (cache the *cacheable public reads* — feed, post detail before
     personalization) — it's an indiscriminate blanket setting on the wrong
     layer, not a targeted one on the reads that should actually be cached.
   Recommend reverting this specific change and instead setting `next.
   revalidate` per call site (or via an options parameter `graphqlFetch`
   doesn't currently have) only on the handful of genuinely public,
   cacheable queries.

5. ✅ **Fixed.** **P1 (S/M) — `AuthProvider` does a client round trip even when SSR already
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

   **Verified 2026-07-13:** `components/SessionScript.tsx` now also emits
   `window.__INITIAL_TOKEN__` via a synchronous cookie read (no network
   hop), rendered in root `layout.tsx`. `useAuth.tsx`'s `ssrUser` and
   `initialUser` branches both check this SSR token and return early,
   only falling back to `apiFetch(AUTH_TOKEN_URL)` if no SSR token exists.
   Real elimination of the round trip, not a reorder.

6. ✅ **Fixed.** **P2 (S) — Stripe SDK statically imported, not code-split off checkout.**
   `components/StripeProvider.tsx:3-4` and `features/billing/ui/
   StripeCardForm.tsx` import `@stripe/react-stripe-js`/`@stripe/stripe-js` at
   module scope, shipping Stripe's bundle to every page that pulls in the
   provider tree, not just the checkout page. Fix: `next/dynamic` with
   `ssr: false` around the Stripe-dependent component.

   **Verified 2026-07-13:** `views/checkout/CheckoutContent.tsx` now loads
   `StripeCardForm` via `next/dynamic(..., { ssr: false })`.
   `StripeProvider.tsx` (which statically imports `@stripe/stripe-js`/
   `@stripe/react-stripe-js`) is imported only by `StripeCardForm.tsx` —
   confirmed via repo-wide grep, no other importer — so the whole Stripe
   chain rides inside the dynamic boundary, not the root provider tree.

7. ✅ **Fixed.** **P2 (S) — Ad hoc `useEffect`+`fetch` bypasses the shared query cache in
   places.** `integrations/tanstack-query/QueryProvider.tsx:8-20` gives a
   proper shared `QueryClient` (good, in use on the 4 pages above), but e.g.
   `views/settings/PageContent.tsx` still fetches ad hoc — inconsistent
   caching/dedup discipline page to page. Route remaining ad hoc fetches
   through the same `useSuspenseQuery`/`useQuery` layer.

   **Verified 2026-07-13:** `views/settings/PageContent.tsx` now uses
   `useSuspenseQuery` for `BILLING_SUBSCRIPTION_URL`, no ad hoc
   `useEffect`+`fetch`; the route has a `loading.tsx` giving it Next's
   automatic Suspense boundary.

8. ❌ **Not fixed — config targets URLs that don't exist.** **P1 (M) — No Lighthouse CI / Core Web Vitals baseline.** Same gap as
   backend #9: `docs/todo/03-frontend.md:40-41` already flags this as open,
   confirmed still true. Without it, "under 2s LCP" for the 9 core pages is
   this doc's inference from code shape, not a measured number. Should land
   together with #1 and #2 above so there's a before/after.

   **Verified 2026-07-13:** `lighthouserc.json` has real assertions (LCP,
   CLS, TBT, etc.) and `lighthouse:*` scripts exist in `package.json`. But
   its 4 target URLs are all wrong: `http://localhost:4000/en/feed`,
   `/en/posts/example-post`, `/en/messages`, `/en/friends` all omit the
   required `/v1` prefix every real route lives under
   (`app/v1/[lang]/...`), `/en/friends` isn't a real route at all (it's
   `/v1/en/find-friends`), and `example-post` isn't a real post id anywhere
   in the repo. No rewrites bridge these. As configured, every collected
   URL would 404 — this "baseline" can't produce a number. Also not wired
   into `frontend-ci.yml`.

   **Verified again 2026-07-13 (commit `d1413ce`):** ⚠️ **Partial —
   upgraded from fail.** 3 of 4 URLs are fixed: `/v1` prefix added to all
   four, and `/en/friends` → `/en/find-friends`. But `/v1/en/posts/
   example-post` is untouched — `example-post` still isn't a real post id
   anywhere in the repo (confirmed via repo-wide grep), and
   `post.service.ts`'s `findOne` does `prisma.post.findFirst({ where: {
   id, deletedAt: null } })`, so that URL still won't resolve to real
   content — LHCI still can't get a valid trace for the post-detail page,
   one of this audit's 9 core pages. Also now wired into
   `frontend-ci.yml` as a `pnpm lighthouse:ci` step (this is the part the
   commit message mislabeled as F3, see above) — but it's
   `continue-on-error: true`, so even once all 4 URLs resolve, a budget
   regression won't fail the build, just get logged.

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
