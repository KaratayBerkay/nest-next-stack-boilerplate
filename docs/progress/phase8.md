# Phase 8 — Realtime close-out: delivery-path DB hardening + audit gaps

> Execution tracker for the eighth phase of the [stack roadmap](../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-03 · Status: **not started**

Re-scope note (2026-07-03): the phase 7 queue had phase 8 = cross-stack e2e.
Before running the phase 7 gate walk, a close-out audit of the landed T1–T12
found the build ~95% real but not gate-ready: the friend-request leg is
push-deaf at the last inch (the exact defect class phase 7 existed to kill),
one T11 deletion never landed, and the conversations aggregation — the query
behind every DM badge/unread refetch — scans the user's full message history
on every cache miss. Berkay's directive: first decide whether the DB needs
enhancements for notification/count delivery, then fix the gaps. The
decision is D1 below. E2e and CI shift down one slot (again).

## Close-out audit (2026-07-03)

Verified sound, for the record:

- All four phase 7 commits landed (`2493319`, `2be9108`, `90d6b38`,
  `89078fa`); `docs/backend/REALTIME.md` exists.
- Old `NotificationGateway`/`PostEventsGateway` deleted; `src/notification`
  and `src/post` clean of socket.io. Remaining backend socket.io usage is
  the pre-phase-6 demo modules (`src/ws`, `src/ws-enhancers`) — deliberate
  boilerplate showcases, keep.
- One-store rule holds on every *tasked* page: messages, feed, post detail,
  chat-room carry no pushed-domain `useState` (what remains is form/UI
  state).
- The messages emit pipeline is real end-to-end (`emitToPage` sites on both
  controller and WS paths); notification counts are server-recomputed (R4)
  over exactly-matching indexes.

### Findings

- **A1 — friend-request page push-deaf at the last inch.** The pipeline
  works upstream: find-friends claims `friend-request`
  (`RealtimeProvider.tsx:127`), the backend emits `Friends/PendingList`
  renews on send/accept/decline (`messaging.controller.ts:82–125`), the
  provider invalidates `["friends","requests"]`
  (`RealtimeProvider.tsx:301`) — and **no component reads that key**.
  `find-friends/page.tsx` holds `friends`/`friendRequests` in `useState`
  over raw `apiFetch` (lines 111–112); invalidating a key with zero
  observers is a no-op, so an incoming request bumps the bell but the open
  pending list never refreshes. Root cause: stage C (T6–T10) never had a
  find-friends task — the D3 friend-request row's frontend half was never
  assigned.
- **A2 — `socket.io-client` still shipped.** Phase 7 T11/B13 said delete
  it; `next-js-boilerplate/package.json` still lists it. Zero imports in
  `src` — dead dependency.
- **A3 — phase 7 tracker not closed by its own rules.** phase7.md line 5
  still says `Status: **not started**`; the six phase-gate boxes are
  unchecked (they are manual two-device prod walks — correctly so).
- **A4 — conversations aggregation is unbounded.**
  `getConversations` (`messaging.service.ts:123`) does a `findMany` with
  **no `take`** over every message the user ever sent or received,
  `include`s full sender+recipient rows per message, then reduces in JS to
  last-message + unread per peer. The send and read paths bust both
  parties' `conversations:` cache (`:239–240`, `:292–293`) and the renew
  triggers a refetch — so under active chat, every message re-reads all
  messages. O(history) work on the hottest realtime refetch path; grows
  without bound.
- **A5 — notification list sorts instead of walking an index.**
  `findByUser` (`notification.service.ts:108`) pages by
  `orderBy createdAt desc` but the only index is `[userId, readAt]` —
  Postgres scans the user's rows then sorts per fetch. Fine today, degrades
  linearly as per-user notifications accumulate.

## D1 — DB decision: what notification/count delivery needs (and doesn't)

Decided 2026-07-03, before the fixes:

- **Counts need no schema change.** `Notification @@index([userId,
  readAt])` covers `unreadCount` and `markAllRead` exactly; `Message
  @@index([recipientId, readAt])` covers per-peer unread. The R4 pattern
  (server recount → renew carrying the value) is already correct and cheap.
- **No denormalized counters, no summary table.** A trigger- or
  service-maintained unread counter (or a `Conversation` row per pair) is
  the classic next step — rejected here: the renew protocol already bounds
  staleness, the 30 s Redis cache bounds read pressure, and both A4/A5 are
  fixable with a bounded query + one index, adding no new write paths to
  keep consistent. Revisit only if k8s-scale p95 (phase 11) says otherwise.
- **Two changes are warranted:** bound the conversations aggregation in SQL
  (T1 — no schema change; served by the existing `[senderId, recipientId]`
  and `[recipientId, readAt]` indexes) and add the notification list
  pagination index (T2 — one line + migration).

## Tasks

Sizes: S ≈ ≤half day, M ≈ a day.

### Stage A — backend delivery path (deployable alone)

- [ ] **T1 (M) — bound `getConversations` (A4).** Replace the full-history
  `findMany` with bounded SQL: `DISTINCT ON (peer)` last-message-per-friend
  + one `GROUP BY "senderId"` unread count (`WHERE "recipientId" = me AND
  "readAt" IS NULL`), peer user rows via one `findMany` on ids. Output
  shape and ordering (last-message desc) identical; 30 s cache +
  bust-on-write unchanged.
  *Verify:* `EXPLAIN` shows both queries on `[senderId, recipientId]` /
  `[recipientId, readAt]`, no `Message` seq scan; REST payload before/after
  identical on the dev stack (test users); badge/unread loop still live
  over WS.
- [ ] **T2 (S) — notification list index (A5).**
  `@@index([userId, createdAt(sort: Desc)])` on `Notification` +
  date-named migration, applied to dev.
  *Verify:* `prisma migrate status` clean; `EXPLAIN` on the `findByUser`
  query walks the index instead of sorting per page.

### Stage B — frontend gap

- [ ] **T3 (M) — find-friends onto the caches (A1).**
  `useQuery(["friends","requests"])` + `useQuery(["friends","list"])`
  replace the two `useState`s; the provider's `Friends/PendingList` case
  invalidates **both** keys (an accept changes the friends list too);
  send/accept/decline mutations invalidate locally for same-tab snappiness.
  The messages-page friend-picker may adopt `["friends","list"]` in passing
  iff trivial — same key, no new machinery.
  *Verify (two browsers):* B sends A a request while A has find-friends
  open → pending list updates < 1 s, no manual refetch; A accepts → B's
  page reflects the friendship < 1 s; pushed-domain `useState` grep on the
  page: zero.
- [ ] **T4 (S) — delete `socket.io-client` (A2).** Drop from
  `next-js-boilerplate/package.json` + lockfile.
  *Verify:* `grep socket.io-client next-js-boilerplate/package.json` empty;
  frontend builds.

### Stage C — docs + sweep

- [ ] **T5 (S) — phase 7 bookkeeping (A3).** phase7.md: fix the status
  header, add a close-out note pointing here, renumber its phase-queue
  table; gate boxes stay open until the prod walk.
  *Verify:* phase7.md status reflects reality; queue tables here and there
  agree.
- [ ] **T6 (S) — verification sweep.** Backend unit tests + build; frontend
  typecheck + build; exercise `/messages/conversations` and the
  notification list against the running stack.
  *Verify:* all green; payload shapes unchanged.

## Verify loop (phase gate)

- [ ] **The phase 7 gate walk passes on prod, post-fix** — all six boxes in
  [phase7.md](phase7.md) (messages, presence, notification, feed/post/room,
  resilience, one-socket + one-store audits), run with these fixes
  deployed.
- [ ] **Friend-request loop:** the T3 two-browser verify, on prod.
- [ ] **DB audit:** `EXPLAIN` on the conversations + notification-list
  queries shows index-bounded plans on prod-sized data; no `Message` seq
  scans observed during the walk.
- [ ] **Leftover audit re-run:** `socket.io-client` gone from the frontend
  lockfile; pushed-domain `useState` grep over `src/app/v1` still zero.

## Phase queue (updated 2026-07-03)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1–4 (done) | See [phase4.md](phase4.md) queue table | — |
| 5 (skipped-renumbered) | — reserved — | — |
| 6 (done, re-scoped) | Realtime consolidation: socket, renew protocol, emit points | [phase6.md](phase6.md) |
| 7 (tasks done, gate open) | Page-claim realtime: presence in Redis, page-scoped push, transport fixes, hardening | [phase7.md](phase7.md) |
| **8 (this)** | Realtime close-out: bounded conversations SQL, notification index, find-friends cache, deletions, gate walk | this file |
| 9 | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7 realtime loops | [todo/01](../todo/01-stack-integration.md) |
| 10 | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../todo/01-stack-integration.md) |
| 11 | Backend warts + compose hardening + k8s | [todo/02](../todo/02-backend.md), [todo/04](../todo/04-devops.md) |
| 12 | Backlog: OTel/metrics, Web Push e2e, social auth, seed, publishing, backups | [todo/02](../todo/02-backend.md)–[05](../todo/05-docs-maintenance.md) |
