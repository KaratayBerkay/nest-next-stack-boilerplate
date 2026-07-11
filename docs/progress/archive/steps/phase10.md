# Phase 10 — Realtime UX round 2: DM unread everywhere, live feed renew, chat-room presence, transport state UX

> Execution tracker for the tenth phase of the [stack roadmap](../../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-04 · Status: **not started**

Scope note (2026-07-04): Phase 9 landed 14 of 15 code tasks (transport
deadlock, claim keying, thread order, receipts, header routing, chat-room
switching, push completion, hooks/memory hardening) and both apps build clean.
This phase (a) rolls forward the Phase 9 remainder — room presence UI, the
lint pin, docs/bookkeeping, the formal gate, and minor polish — and (b) adds a
new batch of field reports from Berkay: DM "sent but not read" must surface
everywhere, the post feed never live-renews on likes/comments, chat-room
presence still reads 0, the chat-room socket is unstable on first arrival, and
the messages-page connection indicator should become a proper 3-state badge
with a "loading until stable" state. No new code was written for this tracker
(planning only).

## Carried from Phase 9 (verified incomplete)

For the record, these Phase 9 code tasks are **done and verified in code**:
T1/T2 transport + claim keying, T3 thread order + cursor, T4 receipts
(`peerId` + auto-ack + recipient guard), T5 truthful renews, T6 search +
friends cache, T7 notification routing, T8 room switching, T9 room allowlist,
T11 global SW + click routing, T12 push payloads carry `postId`, T15
realtime-client retry leak, T16 feed hash-scroll cleanup, T17 derive nav
state, T18(H5) render-phase ref write. Backend `nest build` and frontend
`next build` both pass. What follows is the last mile that never landed.

- **C1 — Room presence UI never built (Phase 9 T10 / A13).** Online counts
  are still hardcoded `"0"` (`chat-room/page.tsx:61,97,139,145`); the page
  subscribes to none of the backend's `room-counts`, `user-joined`,
  `user-left`, `online-users` broadcasts. Re-reported live below (CR2).
- **C2 — Compiler-aware hooks lint not pinned (Phase 9 T18 / H8).** Neither
  `eslint-plugin-react-hooks` nor the react-compiler ESLint rule is a direct
  dependency; `eslint.config.mjs` is unchanged. The rules run only
  transitively via `eslint-config-next` (warnings, not CI-failing), and the
  compiler bail-out diagnostic is off — so H1–H6 aren't regression-guarded.
- **C3 — Docs + tracker bookkeeping not done (Phase 9 T13).**
  `docs/backend/REALTIME.md` not updated (§4 identity-vs-presence params, §6b
  `peerId` / `delivered-ack` frames, §7 delivered row, push click map, room
  allowlist); `phase8.md`'s queue table not fixed; **`phase9.md` still reads
  "Status: not started" with none of its 14 completed boxes ticked.**
- **C4 — Formal verification gate not run (Phase 9 T14).** Builds + lint pass
  (confirmed); but the two-user dev-stack walk and the prod deploy + Phase 7
  gate re-walk are unproven. Note: bare `pnpm typecheck` currently fails on a
  **stale `.next/types/validator.ts`** (dated 2026-07-02, references the
  long-removed `api/auth/refresh` route) — a clean `next build` clears it, so
  the gate must build before it typechecks.
- **C5 — Minor polish left by Phase 9.**
  - `messages/page.tsx:168` — leftover unused
    `eslint-disable react-hooks/set-state-in-effect` directive (from T6's
    effect removal); lint flags it as unused.
  - `notification/page.tsx:52` — the H4 one-shot effect now emits an
    **unguarded** `exhaustive-deps` warning (`[notifications.length]` omits
    `markAllReadOnce`); document/disable it or add the dep behind the ref latch.
  - `useTheme.tsx:77` — the `set-state-in-effect` disable is undocumented; T17
    asked for an inline "intentional hydration guard" note (or SSR cookie read).
  - `messages/page.tsx` friends `useQuery` dropped the old `res.ok` guard
    (`.then(r => r.json())`); degrades to `[]` via react-query, acceptable but
    less robust.
- **C6 — Peripheral: `/api/auth/refresh` route is missing.**
  `realtime-client.ts:178` does `fetch("/api/auth/refresh", {method:"POST"})`,
  but there is no such route (auth routes are `device-handshake`, `login`,
  `logout`, `me`, `oauth`, `register`, `token`) and no rewrite → it 404s and
  soft-falls-back to existing tokens, so WS token refresh is a silent no-op.
  Pre-existing (not a Phase 9 regression) but it undermines T1's "kill backend
  → resync" story once a token actually expires, and it's what generates the
  stale-validator typecheck error above.

## New findings — Message delivery ("sent but not read")

Spec (Berkay): a DM is **not read** when either (i) the receiver is not on the
messages page, or (ii) the receiver is on the messages page but the sender's
conversation window is not open. In both cases the unread must be visible
everywhere; opening that conversation window turns all of that peer's messages
read.

- **M1 — DM unread never reaches the notification bell.** The send path emits
  only a `Conversation` renew with per-peer unread
  (`messaging.controller.ts:189–202`, `messaging-ws.gateway.ts:84–97`, correct
  since Phase 9 T5). `notifications.create` inside messaging is
  **FRIEND_REQUEST-only** (`messaging.service.ts:62–68`). The bell count comes
  from `["notifications","count"]` ← `GET /api/notifications/unread-count`
  (`useNotifications.ts:41–48`) and **excludes DM unread entirely.** Berkay's
  requirement: the bell shows the **total unread-DM count**, delivered via WS
  renew and web-push, alongside the existing per-conversation badge.
- **M2 — Per-conversation badge exists; aggregate + read-clear semantics do
  not.** The sidebar badge already renders `c.unread`
  (`messages/page.tsx:429–431`, fed by the T5 renew). Missing: (a) an
  aggregate unread-DM number surfaced on the bell (M1), and (b) a guarantee
  that opening the sender's conversation window marks **all** that peer's
  messages read (ticks → read via the T4 receipt pipeline), clears that peer's
  sidebar badge, **and** decrements the bell aggregate. Both "not read"
  sub-cases (receiver off-page; receiver on-page but this thread closed) must
  count toward the aggregate until the window opens.
- **M3 — Push for offline unread carries a count, not just the latest body.**
  DM push today sends the message body gated on no-live-socket (Phase 9 T11).
  Extend the payload so the OS/bell can show the **total** unread-DM count
  ("3 unread messages"), consistent with M1's ws renew, so push and in-app
  agree.

## New findings — Chat room

- **CR1 — WS unstable on first arrival to the chat-room page.** On a cold load
  of `/chat-room` the socket/claim does not settle deterministically — live
  room traffic and presence only start flowing after a re-render or a
  navigation. Suspect interaction between the T8 `Suspense`/`?room` read and
  the claim-effect/connect ordering in `RealtimeProvider` (the claim can fire
  before the leader socket is authenticated on first paint). Needs a
  deterministic "claim replays once connected" path for the initial room, and
  a loading state until then (see U1).
- **CR2 — Online count stuck at 0 (live re-report of C1/T10).** With two users
  actively chatting in `#general`, the header/rooms count still shows `0`
  (`chat-room/page.tsx:61,97,139,145`). Requirement: a **total online count
  per room**, the current room's count in the header, and a live member list —
  built on the backend broadcasts (`room-counts`, `user-joined`, `user-left`,
  `online-users`) the page currently ignores.
- **CR3 — Deliver/accept from all online users must be guaranteed.** Verify
  (and fix if needed) that the gateway fans an incoming `room-message` to
  **all** online members of that room (including the sender's own echo) and
  accepts sends from **every** online member. Phase 9 T8 fixed room *switching*
  and T9 the allowlist; this is the steady-state N-user delivery guarantee with
  an explicit multi-user verify.

## New findings — Post feed live renew

- **F1 — The feed page never watches the `feed` topic.** `feed/page.tsx` has
  **zero** realtime usage (no `useRealtime`, no `watch("feed")`). The backend
  correctly emits `renew:"Feed"` to the `feed` topic on every post/comment/
  reaction (`post.service.ts:69`, `comment.service.ts:63,94,121`,
  `reactions.service.ts:33,55,83`), but with no watcher those frames are
  **never delivered** to the client. This is the root cause of "likes/comments
  show in notifications but the post itself only updates on hot-reload":
  notifications ride the auto-registered `NOTIFICATION` service, the feed
  renew rides a topic nobody subscribed to.
- **F2 — The post-detail page never watches `post:<id>`.** Same defect for
  `posts/[uuid]/page.tsx` — the backend also emits to the `post:<id>` topic
  (`comment.service.ts:68,99,126`, `reactions.service.ts:38,60,88`,
  `post.service.ts:105,128`) but the detail view doesn't `watch` it.
- **F3 — The Feed/Post renew handler invalidates the wrong query key.**
  `dispatchRenew` `case "Feed"` → `type:"Post"` invalidates
  `["posts", frame.id]` (`RealtimeProvider.tsx:307–311`), but the feed **list**
  key is `["feed","list",search]` (`feed/page.tsx:40`). So even once F1/F2
  deliver the frame, the list card's like/comment counts still won't refresh.
  Fix: invalidate `["feed","list"]` (and `["posts", id]` for the detail view),
  or patch the single post in the list cache.

## New findings — Transport state UX

- **U1 — Binary connected/disconnected is misleading while connecting.** The
  messages page derives `connected = status === "open"`
  (`messages/page.tsx:216`) and flips a red "disconnected" pill for every
  non-open state — including the normal `connecting`/`authenticating`/`backoff`
  window on first load. Requirement: **until the socket is stable, show a
  loading (Suspense) state**, not a red "disconnected" signal.
- **U2 — Replace the pill with a 3-state bordered badge.** Berkay wants a badge
  like the header profile avatar (ring style: `ring-2` — see `V1Shell.tsx:473`,
  `NotificationDropdown.tsx:22`) with three states:
  - **red border** — offline (`idle` | `down`),
  - **breathing light-green border** — connecting (`connecting` |
    `authenticating` | `backoff`),
  - **solid green border** — online (`open`).
  Replaces the dot+text pill at `messages/page.tsx:239–247`; input-gating
  (`:583,:585,:596`) keys off "online" as today.

## Decisions

- **DM unread aggregate (M1–M3).** One server-true number: the bell count
  source (`/api/notifications/unread-count` or a sibling) includes total unread
  DMs; the messaging send path emits a **count-bearing renew** to the
  recipient's `NOTIFICATION` service sockets (so the bell updates live) and the
  offline web-push carries the same total. Opening a conversation window issues
  the existing `POST /api/messages/read` (T4/T5), which must also renew the bell
  aggregate down. No denormalized counters — count via the same indexed query
  as Phase 9 `getUnreadCount`, aggregated across peers.
- **Feed live renew (F1–F3).** The feed page and post-detail page own their
  topic subscription: `watch("feed")` / `watch("post:<id>")` on mount,
  `unwatch` on unmount, replayed on reconnect (the client already replays
  `topicWatches` — `realtime-client.ts:160`). The renew handler targets the
  list key. Topic allowlist (`feed|post:[a-z0-9]+`) is unchanged.
- **Transport UX (U1/U2).** A shared `connectionState` derivation maps the
  6-value `RealtimeStatus` to `offline | connecting | online`; a small
  presence-ring component consumes it. "Loading until stable" = render the
  thread's Suspense/skeleton while `connecting`, the live thread while
  `online`, and an offline affordance only on `offline`.
- **Chat-room stability (CR1).** The initial-room claim must be
  connect-gated: claim on `onAuthenticated`/reconnect rather than assuming the
  socket is live at first paint (mirror the Phase 9 T1 replay path). Presence
  (CR2) uses the backend broadcasts as-is; no new server frames needed.

## Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day. Suggested order: **A (carry-over) → D (feed,
highest user-visible payoff) → B (DM unread) → C (chat-room) → E (UX) → F
(gate)**. C1/T1 and CR2/T8 are the same presence work — do once.

### Stage A — Phase 9 carry-over close-out

- [ ] **T1 (S) — Lint pin (C2).** Add `eslint-plugin-react-hooks`
  (compiler-aware) + the react-compiler ESLint rule as explicit devDeps; enable
  `exhaustive-deps`, `set-state-in-effect`, and the compiler bail-out
  diagnostic in `eslint.config.mjs` as **errors** so H1–H6 fail CI.
  *Verify:* introduce a deliberate render-phase ref write in a scratch file →
  `next lint` errors; revert → clean; no new errors across `src`.
- [ ] **T2 (S) — Minor polish sweep (C5).** Remove the unused disable at
  `messages/page.tsx:168`; guard/annotate the `notification/page.tsx:52`
  exhaustive-deps warning; document `useTheme.tsx:77`; restore an `res.ok`
  guard on the friends `useQuery`.
  *Verify:* `next lint` clean of those four; friends list still loads.
- [ ] **T3 (S) — `/api/auth/refresh` route (C6).** Add the missing BFF refresh
  route (or repoint `realtime-client.ts:178` at the existing `/api/auth/token`
  contract) so WS token refresh actually rotates.
  *Verify:* expire the access token mid-session → WS reconnect refreshes and
  resyncs (no 404 in network tab); a clean `next build` regenerates
  `.next/types` with no `refresh` reference.
- [ ] **T4 (S) — Docs + bookkeeping (C3).** Update `REALTIME.md` (§4 identity
  vs presence params, §6b `peerId`/`delivered-ack`, §7 delivered row, push
  click map, room allowlist) and add the new §s for feed topic-watch, DM-unread
  aggregate, and connection-state mapping; fix `phase8.md`'s queue table; tick
  `phase9.md`'s completed boxes and set its status.
  *Verify:* doc matches code on every frame name/field; queue tables agree
  across phase8/9/10.

### Stage B — DM unread everywhere

- [ ] **T5 (M) — DM unread → notification bell aggregate (M1, M3).** Backend:
  include total unread DMs in the bell count source and emit a count-bearing
  renew to the recipient's `NOTIFICATION` sockets on send; extend the offline
  web-push payload with the same total (keep body truncation). Frontend: the
  bell count reflects DM unread live.
  *Verify (two browsers):* B on feed, A sends 3 DMs → B's bell shows +3 live;
  B fully closed → push shows the unread total; counts agree.
- [ ] **T6 (S) — Open-thread read-clear + aggregate decrement (M2).** Opening
  the sender's conversation window marks all that peer's messages read (ticks →
  read via T4 pipeline), clears the sidebar badge, and decrements the bell
  aggregate; both "not read" sub-cases counted until the window opens.
  *Verify:* with 3 unread from A, B opens A's thread → A's ticks go read, B's
  sidebar badge clears, B's bell aggregate drops by 3; B on messages page with a
  *different* thread open still counts A's as unread.

### Stage C — Chat-room presence + stability

- [ ] **T7 (M) — Room presence UI end-to-end (C1, CR2).** Subscribe to
  `room-counts`, `user-joined`, `user-left`, `online-users`; header shows the
  current room's live online count; rooms list shows per-room counts; "online"
  tab lists members.
  *Verify (two browsers):* both in `#general` → count reads **2**, not 0;
  counts move on join/leave/switch < 1 s; no stale members after a tab closes
  (heartbeat reaps ≤ 60 s).
- [ ] **T8 (S) — First-arrival WS stability (CR1).** Make the initial-room
  claim connect-gated (replay on `onAuthenticated`/reconnect); show a loading
  state until the room socket is live (see U1).
  *Verify:* cold-load `/chat-room?room=tech` in two browsers → messages +
  presence flow < 1 s with no reload/navigation; status settles to online
  without flicker.
- [ ] **T9 (S) — N-user deliver/accept guarantee (CR3).** Confirm/fix that the
  gateway fans `room-message` to all online room members (sender echo included)
  and accepts sends from every online member.
  *Verify (three browsers):* each message from any member appears for all three
  < 1 s, sender sees own echo; leaving mid-thread stops delivery to that member.

### Stage D — Post feed live renew

- [ ] **T10 (S) — Feed page watches the `feed` topic (F1).** `watch("feed")`
  on mount / `unwatch` on unmount via `useRealtime`; relies on the existing
  reconnect replay.
  *Verify (two browsers):* A likes/comments B's post → B's feed card updates
  its counts < 1 s **with no hot-reload**; navigate away/back → exactly one
  watch, no leak.
- [ ] **T11 (S) — Post-detail watches `post:<id>` (F2).** Same for
  `posts/[uuid]/page.tsx`, keyed on the post id.
  *Verify:* on the detail page, a like/comment from another client updates live.
- [ ] **T12 (S) — Fix Feed/Post renew invalidation key (F3).** Invalidate
  `["feed","list"]` (and `["posts", id]` for the detail view) — or patch the
  single post in the list cache — in `dispatchRenew` `case "Feed"`.
  *Verify:* the T10/T11 updates actually re-render the card/counts, not just
  fire an invalidation against an unused key.

### Stage E — Transport state UX

- [ ] **T13 (S) — Loading-until-stable (U1).** Render the thread's
  Suspense/skeleton while `connecting`/`authenticating`/`backoff`; only show an
  offline affordance on `idle`/`down`.
  *Verify:* first load shows a skeleton, not a red "disconnected", then the live
  thread once online.
- [ ] **T14 (S) — 3-state connection badge (U2).** Shared `connectionState`
  mapping + a presence-ring badge (mirror header `ring-2`): red = offline,
  breathing light-green = connecting, solid green = online; replaces the
  `messages/page.tsx:239–247` pill.
  *Verify:* kill/restore backend and watch the badge cycle red → breathing
  green → solid green; input enables only on solid green.

### Stage F — Docs + gate

- [ ] **T15 (M) — Verification sweep + prod gate.** Backend build + unit tests +
  lint; frontend clean `next build` (clears the stale `.next`) + typecheck +
  lint. Dev-stack two-user walk of all four new loops (DM unread everywhere,
  chat presence + stability, feed/post live renew, 3-state badge) plus the
  Phase 9 loops. Then deploy to eys.gen.tr and re-run the **Phase 7 gate walk**
  with navigation, plus the new loops.
  *Verify:* all green; ≥ 5 client-side navigations per browser with the badge
  never dropping to offline while the backend is up.

## Verify loop (phase gate)

- [ ] **DM unread:** two browsers — receiver off-page and receiver-on-page-but-
  thread-closed both raise the bell aggregate + sidebar badge; opening the
  thread clears both and turns ticks read; push carries the total when closed.
- [ ] **Feed/post:** likes/comments/new-posts renew the feed card and the
  detail view live (no hot-reload), with exactly one topic watch per mounted
  page and none leaked after unmount.
- [ ] **Chat-room:** cold-load is stable < 1 s; online count reads the true
  member count (2 in `#general`, not 0); N-user deliver/accept + echo verified;
  unknown rooms still rejected (Phase 9 T9).
- [ ] **Transport UX:** badge cycles red → breathing green → solid green across
  a backend kill/restore; loading state (not "disconnected") shows while
  connecting.
- [ ] **Carry-over:** `phase9.md` boxes ticked; REALTIME.md matches code; lint
  pin fails CI on a planted violation; `/api/auth/refresh` no longer 404s;
  clean `next build` → `tsc` passes.
- [ ] **No regressions:** pushed-domain `useState` grep over `src/app/v1` still
  zero; no `addEventListener`/`setInterval`/`setTimeout`/`IntersectionObserver`
  without paired cleanup; no `fetch`/`apiFetch` in `useEffect`.

## Deploy notes (prod = eys.gen.tr)

External openresty proxy fronts `/ws` — probe with `curl --http1.1`;
`NEXT_PUBLIC_REALTIME_WS_URL` and `NEXT_PUBLIC_VAPID_PUBLIC_KEY` are baked at
build time — any change requires a frontend image rebuild; root `.env` is
uncommitted on the server; backend build needs `DATABASE_URL` present (a
missing var fails `prisma generate` in prebuild before any TS compiles); use
the two WS test users for the E2E walks.

## Phase queue (updated 2026-07-04)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1–4 (done) | See [phase4.md](phase4.md) queue table | — |
| 5 (skipped-renumbered) | — reserved — | — |
| 6 (done, re-scoped) | Realtime consolidation: socket, renew protocol, emit points | [phase6.md](phase6.md) |
| 7 (done) | Page-claim realtime: presence in Redis, page-scoped push, transport fixes, hardening | [phase7.md](phase7.md) |
| 8 (done) | Realtime close-out: bounded conversations SQL, notification index, find-friends cache | [phase8.md](phase8.md) |
| 9 (done, 14/15 code tasks) | Realtime UX close-out: transport deadlock, claim keying, thread order, receipts, header routing, chat-room switching, push completion | [phase9.md](phase9.md) |
| **10 (this file)** | Realtime UX round 2: DM unread everywhere, live feed renew, chat-room presence + stability, transport-state UX, + Phase 9 carry-over | this file |
| 11 | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7+9+10 realtime loops | [todo/01](../../todo/01-stack-integration.md) |
| 12 | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../../todo/01-stack-integration.md) |
| 13 | Backend warts + compose hardening + k8s | [todo/02](../../todo/02-backend.md), [todo/04](../../todo/04-devops.md) |
| 14 | Backlog: OTel/metrics, remaining push polish, social auth, seed, publishing, backups | [todo/02](../../todo/02-backend.md)–[05](../../todo/05-docs-maintenance.md) |
