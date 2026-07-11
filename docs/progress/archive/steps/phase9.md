# Phase 9 — Realtime UX close-out: make messaging, chat-rooms, and push actually work

> Execution tracker for the ninth phase of the [stack roadmap](../../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-04 · Status: **not started**

Re-scope note (2026-07-04): the phase 8 queue had phase 9 = cross-stack e2e.
A post-phase-8 code audit (triggered by two field reports: "messages window
is not receiving data" and "header clicks on notifications / messages /
friend-request don't redirect") found the realtime UX broken in practice even
though the phase 7/8 emit pipeline is sound. The WS transport deadlocks after
the first client-side navigation, the messages page-claim is rejected whenever
a thread is deep-linked, the thread renders upside down, receipts write to
nonexistent cache keys, chat-room switching never re-claims, and notification
clicks route nowhere. Berkay's directive: complete **messaging, chat-rooms,
and web push in one day**. E2e and CI shift down one slot (again).

## Audit (2026-07-04)

Verified sound, for the record: the emit topology (REALTIME.md §7) and both
emit paths (controller + WS) are correct; bounded conversations SQL (phase 8
T1) is index-shaped and cache-fronted; the notification create → `Item` +
`Count` renew + push-gating rule works; `/api/messages/[...path]` proxy maps
1:1 onto the Nest `@Controller('api')` routes; heartbeat, Redis presence
mirror, per-IP/per-user socket caps all in place. What follows is the last
inch that was never wired, ordered by blast radius.

### Findings — transport (kills everything downstream)

- **A1 — Web Locks leadership deadlocks after any navigation; never connects
  in dev.** The provider's main effect keys on `pathname` + `searchParams`
  (`RealtimeProvider.tsx:540`), so every client-side navigation tears down
  and rebuilds the socket. The teardown is fatal: leadership is held via
  `navigator.locks.request("rt-leader", …)` whose callback awaits a promise
  that only `beforeunload` resolves (`RealtimeProvider.tsx:426–434`); the
  effect cleanup (`:487–497`) disconnects the socket and removes the listener
  but **never resolves that promise**, so the lock stays held by a zombie
  invocation until tab unload. The re-run's lock request queues forever
  behind it — no client is ever created again, `status` parks at `"idle"`
  (red badge, disabled input), and because Web Locks are origin-scoped, other
  tabs can't become leader either. In dev it's worse: the App Router enables
  React StrictMode by default (no `reactStrictMode` key in `next.config.ts`),
  which double-invokes the effect, so **realtime never connects at all in
  dev**. Only a hard reload recovers a tab.
- **A2 — the `messages` page claim is rejected whenever `?user=` is
  present.** Header conversation clicks deep-link to `/messages?user=<id>`
  (`V1Shell.tsx:76`); the provider then claims
  `{page:"messages", params:{peer}}` (`RealtimeProvider.tsx:121–124`). The
  gateway allowlist says `messages: []` — no params
  (`realtime.gateway.ts:51`) — so `handlePage` replies
  `{type:"error"}` and **sets no claim** (`realtime.gateway.ts:463–472`).
  Every `emitToPage(userId, 'messages', …)` then finds zero sockets: no
  `direct-message`, no receipts, nothing. REALTIME.md:89 specs `peer` as an
  allowed optional param — the gateway diverges from its own spec. Second
  half of the same defect: even if `peer` were allowed, `buildPageKey`
  (`realtime.gateway.ts:572–578`) would index the socket under
  `page:messages:peer:<id>:<uid>` while all emit sites target
  `page:messages:<uid>` — still zero delivery.

### Findings — messages window

- **A3 — thread renders upside down / scrambled.** Backend pages are
  oldest→newest within each page (`messaging.service.ts:228`);
  `messages/page.tsx:100–101` does `pages.flatMap(p => p.messages).reverse()`
  — for one page that's newest-at-top with autoscroll pinned to the bottom
  (the *oldest* message), for 2+ pages the order is garbage. Incoming
  messages append correctly to the cache but render off-screen at the top.
- **A4 — "Load earlier" fetches an overlapping page.**
  `useConversation.ts:33–36` uses the **newest** message of an ascending page
  as the `before` cursor; must be the oldest (`messages[0]`). As-is:
  duplicate rows, duplicate React keys, `hasNextPage` never advances.
- **A5 — read receipts write to a nonexistent key.** The dispatcher uses
  `frame.senderId` as the peer (`RealtimeProvider.tsx:181`), but the backend
  emits the frame to the *message sender* with `senderId = <that same
  user>` (`messaging.controller.ts:233–239`) — so on the receiving client
  the write targets `["messages", <own id>]` and the drop-guard eats it.
  The peer from the recipient's perspective is `frame.readerId`.
- **A6 — delivered ticks are dead code.** Nothing in the frontend ever sends
  `delivered-ack` (grep: zero hits in `next-js-boilerplate/src`), and the
  backend frame carries `userId: message.senderId`
  (`messaging-ws.gateway.ts:139–144`) which the dispatcher misreads as the
  peer (`RealtimeProvider.tsx:201`). `MessageTick status="delivered"` is
  unreachable.
- **A7 — `Messages/Conversation` renew corrupts the sidebar.** The send path
  hardcodes `unread: 1` (`messaging.controller.ts:189–202`,
  `messaging-ws.gateway.ts:84–97`) — with 5 unread the badge shows 1. The
  markRead path sends `lastMessage: '', lastTime: ''`
  (`messaging.controller.ts:241–250`) and the client merge
  (`RealtimeProvider.tsx:275–284`) copies those empties over the real
  preview, then sorts by `new Date('') = NaN` — preview lost, order
  scrambled.
- **A8 — messages-page user search parses the wrong shape.**
  `/api/users/search` returns `{items, total}`
  (`app/api/users/search/route.ts:57`); the messages sidebar treats the
  response as a flat array (`messages/page.tsx:350`, `:361–368`) — `.filter`
  on an object → the quick-add search renders nothing, always.

### Findings — header routing (the reported redirect bug)

- **A9 — bell-dropdown rows only navigate for posts.**
  `NotificationDropdown.handleNavigate` (`NotificationDropdown.tsx:161–167`)
  routes only `payload.postId`. Friend-request rows carry
  `{kind:'friend-request'|'friend-accepted'}`
  (`messaging.service.ts:463–496`) and fall through — click marks read and
  **goes nowhere**. This is the reported "doesn't redirect" bug. (The mail
  icon opens a dropdown by design; its rows and "view all" do navigate.)
- **A10 — notification *page* rows don't navigate either**
  (`notification/page.tsx:179–205` — click only marks read).
- **A11 — dropdown mark-read never refreshes the list.** The dropdown's
  `markRead`/`markAllRead` (`NotificationDropdown.tsx:139–155`) POST but
  never invalidate `["notifications", …]` — rows stay visually unread until
  an unrelated renew lands.

### Findings — chat-room

- **A12 — switching rooms never re-claims.** `selectRoom` sets local state
  only (`chat-room/page.tsx:44–47`); the claim derives from the URL `?room`
  (`RealtimeProvider.tsx:140–143`), so the socket stays joined to the old
  room. Live traffic for the newly selected room never arrives; your own
  sends go to the new room's members but **you never see your own message**
  (no echo — you're not a member). REST history loads, then the room is
  inert.
- **A13 — presence UI is dead.** Online count hardcoded `"0"`
  (`chat-room/page.tsx:57`, `:93`), "online" tab says no-one-here; the
  backend broadcasts `room-counts`, `user-joined`, `user-left`,
  `online-users` (`messaging-ws.gateway.ts:165–190`,
  `realtime.gateway.ts:380–398`) and the page subscribes to none of them.
- **A14 — room ids are unvalidated server-side.** Claim params, the
  `room-message` handler, and REST `GET /api/rooms/:roomId/messages` accept
  arbitrary strings; `saveRoomMessage` writes any `roomId`
  (`messaging.service.ts:276–281`). Frontend's `CHAT_ROOMS` allowlist
  (general/random/tech/design/music) exists only client-side.

### Findings — push notifications

- **A15 — the service worker is only registered from the notification
  page.** `usePushNotifications` mounts only there
  (`notification/page.tsx:65–71`); a user who never visits `/notification`
  never registers `sw.js`, so DM offline push (gated on *no live socket*,
  which is exactly when they're not in the app) can never reach them.
- **A16 — push click routing ignores DM / friend payloads.**
  `sw.js` `notificationclick` routes `postId → feed#post-…`, else
  `/notification`. DM pushes carry `{kind:'direct-message', senderId}`
  (`messaging.controller.ts:212`, `messaging-ws.gateway.ts:119`) and should
  open `/messages?user=<senderId>`; friend pushes should open
  `/find-friends`. Worse: when any `/v1/` tab exists, the SW just focuses it
  without navigating, and its `navigate-post` postMessage has **no listener
  anywhere in the app** (grep: zero hits) — clicks on push are no-ops for an
  open tab.

### Findings — find-friends (phase 8 T3 leftovers)

- **A17 — `Friends/PendingList` renew invalidates only
  `["friends","requests"]`** (`RealtimeProvider.tsx:301–305`). Phase 8 T3's
  own spec said both keys — an accept changes the friends *list* too, so the
  other party's list goes stale until reload.
- **A18 — messages-page friends list still `useState` + raw `apiFetch`**
  (`messages/page.tsx:78`, `:115–126`) — the "adopt `["friends","list"]` in
  passing" from T3 never happened; friend accepts don't propagate to the
  messages sidebar.

### Findings — React hooks / memory (compiler-aware)

Context that reframes this whole area: the frontend **already runs the React
Compiler** (`next.config.ts:5` `reactCompiler: true`;
`babel-plugin-react-compiler@1.0.0`; React 19.2.4 / Next 16.2.9). Per the 2026
guidance (sources at foot of stage G), that means: manual `useMemo`/
`useCallback` are largely **redundant** — the compiler auto-memoizes — so
adding more is noise-to-harmful; the real wins are the things the compiler
**cannot** fix — effect cleanup, leaks, subscriptions, and Rules-of-React
violations that make the compiler silently bail out on a component.

- **H1 — degraded-retry leaks an `online` listener and can double-connect.**
  `RealtimeClient.scheduleDegradedRetry` (`realtime-client.ts:202–210`) adds
  `window.addEventListener("online", retry, {once:true})` **and** a 60 s
  `reconnectTimer`. `disconnect()` clears the timers
  (`realtime-client.ts:95–96`) but **never removes the `online` listener** —
  every disconnected degraded client leaks a closure over the whole client.
  And if `online` fires, `retry` reconnects but does **not** clear
  `reconnectTimer`, so the 60 s timer fires a *second* `connect()`. A1's
  client-churn-per-navigation multiplies both.
- **H2 — feed hash-scroll effect has no cleanup and re-arms on every posts
  change.** `feed/page.tsx:103–121`: on `#post-…` it starts a 200 ms
  `setInterval` + a 5 s `setTimeout`, returns **no cleanup**, and is keyed on
  `[posts]` — every pagination/live-update re-runs it, spawning overlapping
  intervals that outlive unmount. Reads `window.location.hash` (never
  changes) so the `posts` dep is wrong anyway.
- **H3 — messages friends/search fetch in effects with no cancellation.**
  `messages/page.tsx:165–196` fetches friends in one effect and re-fetches on
  every `search` keystroke in another (three `set-state-in-effect` disables,
  `:167`,`:190`,`:193`), no debounce, no `AbortController` — out-of-order
  responses can overwrite newer ones (classic stale-render race + unmounted
  set-state). Folds into T6's react-query migration; called out here so the
  cancellation/debounce requirement is explicit.
- **H4 — notification page auto-marks-all-read as a render side effect.**
  `notification/page.tsx:44–48` runs `markAllRead()` from an effect keyed on
  `notifications.length`, and `markAllRead` invalidates `["notifications"]`
  → refetch → effect may re-fire. Should be a guarded one-shot (ref latch) or
  an explicit on-open action, not effect-on-data.
- **H5 — render-phase ref write defeats the compiler.**
  `RealtimeProvider.tsx:349–350` assigns `userIdRef.current = user?.id`
  **at component top level** (render phase). Writing a ref during render is
  a Rules-of-React violation; under the compiler it can force a bail-out of
  the whole provider. Move to a tiny `useEffect`.
- **H6 — six `react-hooks` lint suppressions, one genuinely removable.**
  `usePageNavigation.tsx:49–54` sets `currentPage`/`suggestion` from
  `pathname` in an effect — textbook derived state; compute during render
  (`const currentPage = matchPage(pathname)`), deleting an effect, two
  `useState`s, and a disable. `useTheme.tsx:75–80` (mount theme sync) is a
  defensible hydration guard — keep, but documented, ideally replaced by an
  SSR cookie read. Remaining disables in `messages/page.tsx` disappear with
  T6/H3.
- **H7 — redundant manual memoization (optional, low-risk-only).** Under the
  compiler, `useMemo`/`useCallback` kept purely for referential stability are
  dead weight (e.g. `messages/page.tsx:93` `useMemo(... [conversationsData])`,
  various `useCallback` wrappers). **Do not** mass-delete — some (`feed`
  `loadMore`, swipe-gesture handlers) are effect deps where stability still
  matters, and churn is risky. Trim only the obviously-pointless ones touched
  while doing H1–H6; leave the rest for the compiler to no-op.
- **H8 — lint doesn't guard against regressions.** Neither
  `eslint-plugin-react-hooks` nor the compiler's ESLint rule is a direct
  dependency (they arrive transitively via `eslint-config-next`); the
  compiler-aware rule set (`react-hooks/exhaustive-deps` +
  `react-hooks/set-state-in-effect` + the react-compiler diagnostics) should
  be pinned and enforced so H1–H6 can't silently regress.

## D1 — decisions before the fixes

- **Transport lifecycle (A1).** The connection effect keys on
  `[token, queryClient]` only. Route changes must never touch the socket —
  the existing second effect (claim sender) is the only navigation-sensitive
  code. The lock callback stores its `resolve` so cleanup can release
  leadership deterministically, and the lock request gets an `AbortController`
  `signal` so a cleanup that fires while the request is still *queued* can
  cancel it. Leadership failover across tabs (queued waiters take over on tab
  close) is preserved — that part of the design was right.
- **Claim keying (A2).** Split allowlist params into **identity params**
  (part of the `pageClaims` key: `post.id`, `chat-room.room`) and **presence
  params** (`messages.peer` — stored on the socket and mirrored to Redis
  presence, excluded from the routing key). Emit sites keep targeting bare
  `messages`. This matches REALTIME.md §4's table exactly as written.
- **Receipts (A5/A6).** One rule: every receipt frame carries `peerId` =
  "the other user from the recipient-of-the-frame's perspective". Backend
  adds it (keeping old fields for forward-compat); the dispatcher reads only
  `peerId`. Delivered = "recipient's client received the `direct-message`
  frame": the provider auto-acks incoming DMs (`delivered-ack {messageId}`)
  when `msg.recipientId === me` — no new UI, no polling. Read stays REST
  (`POST /api/messages/read` on thread open).
- **Conversation renews carry server-true values (A7).** The send path
  computes the recipient's real per-peer unread (one indexed `count` on
  `[recipientId, readAt]` + `senderId`) instead of hardcoding 1; the
  markRead path sends `unread: 0` and *omits* `lastMessage`/`lastTime`; the
  client merge ignores `undefined`/empty fields and guards the NaN sort.
  No denormalized counters (phase 8 D1 still stands).
- **One notification click-router (A9/A10/A16).** A single
  `notificationTarget(payload, lang): string | null` mapping, used by the
  dropdown, the notification page, and mirrored in `sw.js`:
  `kind:'direct-message' → /messages?user={senderId}`,
  `kind:'friend-request'|'friend-accepted' → /find-friends`,
  `postId → /feed#post-{postId}`, default `→ /notification`.
- **Push registration is global, permission stays opt-in (A15).** The shell
  registers `sw.js` on mount (registration needs no permission); the
  subscribe prompt remains the explicit bell button on the notification
  page. No permission nagging.

## D2 — hooks/memory posture (React Compiler is on)

Decided 2026-07-04. The compiler changes the goal from "add memoization" to
"stop fighting the compiler and plug the leaks it can't see":

- **Fix leaks and missing cleanup first** (H1, H2) — highest blast radius,
  compounded by A1's per-navigation client churn.
- **Prefer derive-during-render over effect-then-setState** (H4, H5, H6) —
  fewer effects, fewer states, and it keeps components compiler-legal.
- **Every async started in an effect gets cancellation** — `AbortController`
  for fetch, cleared timers/listeners, closed sockets/observers (H2, H3).
- **Do not add `useMemo`/`useCallback` for referential stability** — the
  compiler does it. Remove redundant ones only opportunistically (H7).
- **Data fetching stays in TanStack Query, never in `useEffect`** — matches
  the one-store rule already in force; H3's migration finishes the job.
- **Pin and enforce the compiler-aware hooks lint** (H8) so none of this
  regresses.

These are close-out hardening, not a rewrite — scoped to the realtime/message
surfaces phase 9 already touches, plus the three shared hooks.

## Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day. Single-day order: A → B → C → D → E → F,
with Stage G (hooks/memory) **interleaved into the files each stage already
touches** (see stage G preamble), not run as a separate pass. If the day runs
short, T10 (presence UI) and T9 (room allowlist) are the only slip-safe
boxes — everything else is required for the gate.

### Stage A — transport resurrection (frontend, deployable alone)

- [ ] **T1 (M) — provider lifecycle split + lock release (A1).** Main effect
  deps → `[token, queryClient]`; move initial-claim computation off
  `pathname`/`searchParams` (read `claimRef`, which the claim effect owns —
  the post-auth `replayClaim`/`onAuthenticated` covers the mount race).
  Store the lock callback's `resolve`; cleanup calls it after
  `client.disconnect()`; pass an abort `signal` into
  `navigator.locks.request` and abort on cleanup so queued requests die too.
  Followers keep BroadcastChannel fan-out; `status` must transition via the
  leader's broadcasts only.
  *Verify:* dev server (StrictMode on): socket connects on first load;
  navigate feed → messages → post → messages for 2 min — status pill stays
  "connected" throughout, exactly one WS in devtools; second tab attaches as
  follower; closing the leader tab promotes the follower < 5 s.
- [ ] **T2 (S) — gateway claim keying + `peer` param (A2).**
  `PAGE_ALLOWLIST` becomes `{ allowed: string[], key: string[] }` per page
  (`messages: {allowed:['peer'], key:[]}`, `post: {allowed:['id'],
  key:['id']}`, `chat-room: {allowed:['room'], key:['room']}`, rest empty);
  `buildPageKey` uses only `key` params; required-param check runs on `key`
  params. `peer` lands in `ws.pageParams` → Redis presence as today.
  *Verify:* deep-link `/messages?user=<id>` on the dev stack: no error
  frame, `page:messages:<uid>` key populated (log or debugger), a DM from
  the other test user arrives live on the deep-linked view;
  `HGETALL presence:<uid>` shows `{"page":"messages","params":{"peer":…}}`.

### Stage B — messages window correctness

- [ ] **T3 (S) — thread order + pagination cursor (A3, A4).**
  `conversationMessages = [...pages].reverse().flatMap(p => p.messages)`
  (oldest page first, ascending inside — globally ascending, newest at the
  autoscrolled bottom); `getNextPageParam` → `lastPage.hasMore ?
  lastPage.messages[0]?.createdAt : undefined`.
  *Verify (two browsers):* 40+ message thread: newest at bottom, autoscroll
  lands on it; incoming message appears at the bottom < 1 s; "Load earlier"
  prepends 30 older rows, zero duplicate-key warnings, button disappears at
  history start.
- [ ] **T4 (M) — receipts pipeline end-to-end (A5, A6).** Backend:
  `message-read` frame gains `peerId: <readerId>`
  (`messaging.controller.ts:234`); `handleDeliveredAck` looks up
  `recipientId` too and emits `message-delivered {peerId: <recipientId>,
  messageId, deliveredAt}` (`messaging-ws.gateway.ts:127–146`); guard the
  update with `recipientId === ws.userId` so only the true recipient can
  ack. Frontend: dispatcher reads `frame.peerId` for both receipt types; the
  provider auto-sends `delivered-ack {messageId}` from the `direct-message`
  branch when `msg.recipientId === ownUserId`.
  *Verify (two browsers):* A sends while B is on the messages page → A's
  tick goes double-grey < 1 s (delivered); B opens the thread → A's tick
  goes read < 1 s; B on a *different* page receives nothing (emitToPage
  scoping) and the tick stays single — documented-correct.
- [ ] **T5 (S) — truthful conversation renews (A7).** Send path: compute the
  recipient's true unread for that peer and put it in the renew (both
  controller and WS gateway sites); markRead path: `unread: 0`, omit
  `lastMessage`/`lastTime`; client merge: skip `undefined`/`''` fields,
  fall back to `0` time in the sort guard.
  *Verify:* B sends 3 messages while A sits on feed → A's mail badge/list
  shows unread 3 (not 1); A opens the thread → badge clears, sidebar
  preview text and ordering intact.
- [ ] **T6 (S) — messages-page search + friends cache adoption (A8, A18).**
  Parse `{items}` from `/api/users/search` in the sidebar quick-add; replace
  the page's `friends` `useState`/`fetchFriends` with
  `useQuery(["friends","list"])` for the base list (keep the typed q-search
  as a local fetch — different result set).
  *Verify:* typing in "search users" under Chats lists candidates again;
  pushed-domain `useState` grep over the page: only form/UI state remains.

### Stage C — header + notification routing (the reported bug)

- [ ] **T7 (S) — `notificationTarget()` + click routing (A9, A10, A11).**
  New `src/lib/notifications/target.ts` implementing the D1 map; dropdown
  and notification page: `markRead(id)` → `router.push(target)` when
  non-null; both mark-read paths invalidate `["notifications"]`; provider's
  `Friends/PendingList` case invalidates `["friends","list"]` too (A17).
  *Verify:* click a friend-request notification in the bell → lands on
  find-friends with the pending tab populated; click a post notification →
  feed scrolls to the post; unread dot clears immediately in the dropdown;
  accepting on device B updates A's friends list < 1 s.

### Stage D — chat-room completion

- [ ] **T8 (S) — room switching via URL (A12).** `selectRoom` →
  `router.replace(`?room=${r}`, {scroll:false})`; the claim effect does the
  rest (leave old room, join new — gateway callbacks already handle
  membership + broadcasts). Initial room state reads `?room` for
  back/forward consistency.
  *Verify (two browsers):* both switch general → tech without reload; both
  see each other's messages in tech < 1 s; sender sees own echo; switching
  back re-joins general.
- [ ] **T9 (S) — server-side room allowlist (A14).** Shared `ROOMS` const in
  the backend (`general|random|tech|design|music`); reject unknown rooms in
  the chat-room claim (error frame), `room-message` handler (drop), and REST
  `getRoomMessages` (404).
  *Verify:* hand-crafted claim/`room-message` for `room:"nope"` is
  rejected; REST 404s; the five real rooms unaffected.
- [ ] **T10 (M, slip-safe) — room presence UI (A13).** Page subscribes to
  `room-counts`, `user-joined`, `user-left`; header count = current room's
  live count; "online" tab lists current room members (from `user-joined`
  member snapshots); rooms list shows per-room counts.
  *Verify (two browsers):* counts move on join/leave/switch < 1 s; member
  names render; no stale members after a tab closes (heartbeat reaps ≤ 60 s).

### Stage E — push notifications completion

- [ ] **T11 (M) — global SW + click routing + in-app navigation (A15,
  A16).** Register `sw.js` from the shell (registration only — no
  permission prompt); rewrite `notificationclick` to build the URL via the
  D1 map (mirror `notificationTarget`) and, for an existing `/v1/` client,
  `postMessage({type:'navigate', url})` then focus; add one global
  `navigator.serviceWorker` message listener in the shell that
  `router.push(url)` (replaces the orphaned `navigate-post` contract —
  delete that branch from `sw.js`).
  *Verify (prod-mode build, two browsers):* B closes the app entirely; A
  sends a DM → OS notification; click cold-opens `/messages?user=A` with the
  thread live. Repeat with a backgrounded-but-open tab → tab focuses *and*
  navigates. Friend request push → find-friends. Post push → feed#post.
- [ ] **T12 (S) — push payload audit.** Every `push.sendToUser` call site
  carries a routable payload: DM sites ✓ (`kind`,`senderId`), friend sites ✓
  (`kind`), post/comment/reaction notifications must include `postId`
  (`post.service.ts:55`, `comment.service.ts:52`, `reactions.service.ts:99`
  — verify each, fill gaps). Keep the 120-char body truncation.
  *Verify:* grep + one manual push per kind from the dev stack routes
  correctly through T11's click handler.

### Stage F — docs + gate

- [ ] **T13 (S) — REALTIME.md + tracker bookkeeping.** Update §4 (claim
  table: identity vs presence params), §6b (receipt frames carry `peerId`;
  `delivered-ack` client→server frame), §7 (delivered row), §10 unchanged;
  add the push click-routing map; note the room allowlist. Fix phase8.md's
  queue table (9 = this re-scope; 10–13 shift).
  *Verify:* doc matches code on every frame name/field mentioned; queue
  tables agree across phase8/phase9.
- [ ] **T14 (M) — verification sweep + prod gate.** Backend: unit tests +
  build + lint. Frontend: typecheck + build + lint. Dev-stack walk of all
  three loops (messages incl. receipts + load-earlier, chat-rooms incl.
  switching + presence, push incl. cold-open routing) with the two test
  users. Then deploy and re-run the **phase 7 gate walk** (all six boxes in
  [phase7.md](phase7.md)) — this time it must pass *with navigation between
  pages during the walk*, which is exactly what A1 broke.
  *Verify:* all green; the walk includes ≥ 5 client-side navigations per
  browser with the status pill never leaving "connected".

### Stage G — React hooks / memory hardening (compiler-aware)

Do this stage **interleaved with the code it touches**, not as a separate
pass: H1 lands with T1 (same file, same churn story), H3/H6-messages land with
T6, H5 lands with T1. T17/T18 are the standalone bits. Guiding rule: fewer
effects, full cleanup, no new memoization (D2).

- [ ] **T15 (S) — realtime-client retry leak (H1).** In
  `scheduleDegradedRetry`, name the `online` handler, store it, and
  `removeEventListener("online", …)` in `disconnect()` and at the top of
  `retry`; clear `reconnectTimer` inside `retry` before reconnecting. Land it
  with T1 (same lifecycle story).
  *Verify:* connect → force `down` (kill backend) → `disconnect()`: zero
  lingering `online` listeners (`getEventListeners(window)` in devtools);
  toggling offline→online after a degraded park triggers exactly one
  reconnect, never two.
- [ ] **T16 (S) — feed hash-scroll cleanup + correct dep (H2).** Key the
  effect on the hash (once per hash, not `[posts]`); capture `timer` +
  `timeout` ids and `return () => { clearInterval(timer);
  clearTimeout(timeout); }`; stop the interval on first hit as today.
  *Verify:* navigate to `/feed#post-<id>` then away within 1 s — no interval
  survives (add a temporary log or watch the profiler); repeated feed updates
  don't stack intervals.
- [ ] **T17 (S) — derive nav state; drop the effect (H6).**
  `usePageNavigation.tsx`: replace the `pathname` effect + `currentPage`/
  `suggestion` `useState` with render-time derivation
  (`const currentPage = matchPage(pathname)`), removing the
  `set-state-in-effect` disable. Document `useTheme`'s remaining mount-sync
  disable inline as an intentional hydration guard (or, if cheap, read the
  theme cookie during SSR and delete it too).
  *Verify:* nav highlighting/back-suggestion identical across route changes;
  `set-state-in-effect` disables down to the theme one (justified) and any
  that T6 removes; typecheck + lint clean.
- [ ] **T18 (S) — provider render-phase ref write (H5) + lint pin (H8).**
  Move `userIdRef.current = user?.id` into a `useEffect([user?.id])`. Add
  `eslint-plugin-react-hooks` (compiler-aware) + the react-compiler ESLint
  rule as explicit deps and enable them in `eslint.config` so
  `exhaustive-deps`, `set-state-in-effect`, and compiler bail-out diagnostics
  fail CI.
  *Verify:* `next lint` reports the compiler rule active (introduce a
  deliberate render-phase ref write in a scratch file → error, then revert);
  provider still tracks the current user id in the frame processor; no new
  warnings across `src`.

**Guidance distilled into D2 / stage G (web, 2026):** React docs *You Might
Not Need an Effect* (derive-in-render, effects are for external systems only);
LogRocket *15 common useEffect mistakes* and freeCodeCamp *Fix memory leaks in
React* (cleanup for every timer/listener/subscription; `AbortController` for
in-flight fetches on unmount); Steve Kinney / react.dev on React 19 + the
Compiler (manual `useMemo`/`useCallback` become redundant — memoize only for
proven hotspots or external-lib stability, never reflexively). See §Sources at
end of file.

## Enhancements deliberately NOT tasked (backlog, phase 12)

Backend: delivered-on-connect sweep (mark queued messages delivered when a
recipient's MESSAGE socket registers — today delivered fires only on the
messages page, by design); per-user WS message-rate limiting (caps exist for
sockets/IPs, not frames); notification list cursor endpoint is ready but
unpaginated in the UI; DM push body preview is a product choice (currently
sends 120 chars of content — revisit for privacy). Frontend: notification
page "load more" (backend `hasMore`/`cursor` already supported); optimistic
send bubbles with `tempId` reconciliation (room path already has `tempId`
plumbed server-side); typing indicators (needs a new throttled frame type —
presence params from T2 make the peer visible server-side already).

## Verify loop (phase gate)

- [ ] **Messages:** two browsers: badge → dropdown → deep-link → live thread
  → ticks sent/delivered/read → load-earlier clean → reload mid-chat
  resyncs. With ≥ 3 navigations mid-loop.
- [ ] **Chat-rooms:** two browsers switch rooms freely; echo + cross-user
  delivery < 1 s; presence counts track joins/leaves; unknown rooms
  rejected.
- [ ] **Push:** app fully closed: DM, friend-request, and post pushes each
  arrive and click-route to the right page (cold open + warm tab).
- [ ] **Transport:** 5-minute navigation soak — status pill never drops;
  kill backend 30 s → single resync, claims replayed; two tabs = one
  socket; leader close → follower promotion.
- [ ] **Audits:** pushed-domain `useState` grep over `src/app/v1` still
  zero; no `page:messages:peer:` keys in the claim index; `EXPLAIN` spot-
  check on conversations + notification list still index-bounded.
- [ ] **Hooks/memory:** no `addEventListener`/`setInterval`/`setTimeout`/
  `new IntersectionObserver` without a paired cleanup in a component effect;
  no `fetch`/`apiFetch` inside `useEffect` (data stays in TanStack Query);
  no ref writes during render; `set-state-in-effect` disables reduced to the
  documented theme guard; a 5-minute navigation soak shows no unbounded
  listener/timer growth in the devtools memory/performance panel.

## Deploy notes (prod = eys.gen.tr)

External openresty proxy fronts `/ws` — probe with `curl --http1.1`;
`NEXT_PUBLIC_REALTIME_WS_URL` and `NEXT_PUBLIC_VAPID_PUBLIC_KEY` are baked at
build time — any change requires a frontend image rebuild; root `.env` is
uncommitted on the server; use the two WS test users for the E2E walks.

## Phase queue (updated 2026-07-04)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1–4 (done) | See [phase4.md](phase4.md) queue table | — |
| 5 (skipped-renumbered) | — reserved — | — |
| 6 (done, re-scoped) | Realtime consolidation: socket, renew protocol, emit points | [phase6.md](phase6.md) |
| 7 (done) | Page-claim realtime: presence in Redis, page-scoped push, transport fixes, hardening | [phase7.md](phase7.md) |
| 8 (done) | Realtime close-out: bounded conversations SQL, notification index, find-friends cache, deletions | [phase8.md](phase8.md) |
| **9 (this file)** | Realtime UX close-out: transport deadlock, claim keying, thread order, receipts, header routing, chat-room switching, push completion | this file |
| 10 | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7+9 realtime loops | [todo/01](../../todo/01-stack-integration.md) |
| 11 | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../../todo/01-stack-integration.md) |
| 12 | Backend warts + compose hardening + k8s | [todo/02](../../todo/02-backend.md), [todo/04](../../todo/04-devops.md) |
| 13 | Backlog: OTel/metrics, remaining push polish, social auth, seed, publishing, backups | [todo/02](../../todo/02-backend.md)–[05](../../todo/05-docs-maintenance.md) |

## Sources (React hooks / memory, stage G)

- React docs — *You Might Not Need an Effect*: https://react.dev/learn/you-might-not-need-an-effect
- React docs — *Synchronizing with Effects* (cleanup contract): https://react.dev/learn/synchronizing-with-effects
- LogRocket — *15 common useEffect mistakes*: https://blog.logrocket.com/15-common-useeffect-mistakes-react/
- freeCodeCamp — *How to Fix Memory Leaks in React*: https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/
- Steve Kinney — *useMemo and useCallback in React 19*: https://stevekinney.com/courses/react-performance/usememo-usecallback-in-react-19
- react.dev — *memo* reference (when memoization still helps): https://react.dev/reference/react/memo
