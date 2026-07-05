# Phase 7 — Page-claim realtime: full socket control, frontend and backend

> Execution tracker for the seventh phase of the [stack roadmap](../../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-03 · Status: **completed**

Re-scope note (2026-07-03): the phase 6 queue had phase 7 = cross-stack e2e.
After deploying phase 6, Berkay verified on prod: socket, 4-token auth and
notification-level push work, but **pages do not renew** — a DM does not
appear in the open messages thread. Berkay's directive for this phase: finish
the WebSocket work for good, with **full control of the socket on both
sides**. The core mechanism he specified: *the page tells the socket where
the user is* — on navigation the client claims its page
(`messages`, `friend-request`, `feed`, …); the claim is **synced to Redis
per user+device**, and the server **serves that page's data to that socket**.
One socket that both pushes data and stores the user's page activity.
E2e and CI shift down one slot.

## How phase 6 actually landed (survey 2026-07-03)

Phase 6 **Stage A is live and E2E-verified on prod** (WS auth → `register` →
`direct-message` event + `Messages/Conversation` renew received;
notification emits + push gating confirmed; see phase6.md close-out). The
`RealtimeProvider` (T6) dispatches renew frames into the react-query cache.
The gap: **Stage C deleted the old consuming hooks before Stage B's
replacements existed** — the v1 pages were rebuilt as REST + local-`useState`
snapshots, so pushed data lands in caches and a subscription registry that
almost nothing reads.

Emitted vs consumed, for a logged-in user:

| Frame (backend emits today) | Provider writes to | Consumed by | Page result |
| --- | --- | --- | --- |
| `Messages/Conversation` renew | `["conversations"]` | `V1Shell` badge via `useConversations` | ✅ badge + sidebar preview live |
| `direct-message` event | `subscribe()` registry | **nobody** | ❌ open thread frozen until refetch |
| `message-read` / `message-delivered` events | `subscribe()` registry | **nobody** | ❌ sender ticks never move |
| `Notifications/Item` + `Count` renews | `["notifications","list"/"count"]` | **nobody** | ❌ bell badge static until clicked |
| `Feed/New` renew (topic `feed`) | `["feed","new-flag"]` | **nobody** (no page sends `watch`) | ❌ no new-posts pill |
| `Feed/Post` renew (topic `post:{id}`) | invalidates `["posts", id]` | **nobody watches** | ❌ post detail never renews |
| `room-message` events (handlers registered) | `subscribe()` registry | **nobody joins** | ❌ chat-room is a REST snapshot |

### Defects — page consumption (the reported bug)

- **B1 — messages page is push-deaf.** `messages/page.tsx` keeps
  `conversations`/`messageStore`/`hasMore` in `useState` over REST;
  `useRealtime()` powers only the green pill. Incoming `direct-message`
  frames are dropped: no dispatch rule, no subscriber. This is *"message
  didn't immediately arrive at page."*
- **B2 — bell badge is click-time state.** `NotificationDropdown` fetches
  only in `handleToggle`; `unreadCount` is local `c - 1` arithmetic; the
  renew-fed caches have no reader.
- **B3 — notifications invisible while the app is open.** Web Push is
  (correctly) suppressed when a NOTIFICATION socket exists
  (`notification.service.ts:100`), but no in-app consumer exists either:
  socket open → no OS toast **and** no UI change until the bell is clicked.
- **B4 — notification page static; R1 (auto-read on visit) never landed.**
- **B5 — feed never watches; `Feed/New` pill absent.**
- **B6 — post detail live-update regression.** Stage C deleted
  `usePostSocket` with no `watch("post:{id}")` replacement — worse than
  pre-phase-6.
- **B7 — chat-room joins nothing;** gateway `join-room`/`room-message`
  handlers have no client.
- **B8 — read semantics R1–R4 (phase 6 D5) un-landed.**

### Defects — socket control audit (2026-07-03, full-path review)

- **B9 — dual-leader holes in the BroadcastChannel election**
  (`RealtimeProvider.tsx`). (a) A tab opened *later* never learns about
  existing tabs — nothing answers its `hello` — so it elects itself, and
  the sitting leader ignores foreign `leader` claims while `isLeader`:
  two sockets per browser, duplicate frame processing. (b) The leader
  suppresses heartbeats while hidden (commit de48405), so after 90 s the
  followers elect a new leader while the hidden leader keeps its socket —
  dual leader again by design.
- **B10 — no refresh-then-reconnect.** `realtime-client.ts` never calls
  `/api/auth/refresh` on an auth-failure close (phase 6 D1 specified it);
  worse, `cachedFetchTokens` has a 30 s TTL, so the 3 auth retries replay
  the *same stale tokens* and the client parks in `down` until the
  AuthProvider happens to rotate cookies.
- **B11 — no resync on reconnect.** The provider never invalidates
  `["conversations"]` / `["notifications",*]` on `authenticated` (phase 6
  D4 resync rule unimplemented) — any frames missed during a gap stay
  missing until a manual refetch.
- **B12 — gateway hardening gaps.** `handleRegister` accepts arbitrary
  service strings (unbounded map keys from authed clients); the WSS sets
  no `maxPayload` (ws default ≈ 100 MiB per frame from any authed socket);
  page/topic claim validation must follow the same allowlist discipline.
- **B13 — stage C leftovers.** Backend `NotificationGateway` +
  `PostEventsGateway` (socket.io) still run; `socket.io-client` still in
  `package.json`; `docs/backend/REALTIME.md` (phase 6 T14) unwritten.

## Design

### D1 — The page-claim protocol (client → server)

On every route change the provider sends one claim frame over the existing
socket (leader-forwarded from follower tabs, replayed after reconnect):

```jsonc
{ "type": "page", "page": "messages",      "params": { "peer": "<cuid>" } }  // peer optional: open thread
{ "type": "page", "page": "friend-request" }                                  // find-friends / pending
{ "type": "page", "page": "notification" }
{ "type": "page", "page": "feed" }
{ "type": "page", "page": "post",          "params": { "id": "<cuid>" } }
{ "type": "page", "page": "chat-room",     "params": { "room": "general" } }
{ "type": "page", "page": null }                                              // any non-realtime page
```

- Pages and param shapes are **allowlisted server-side** (same discipline as
  the phase 6 topic allowlist); an invalid claim gets an `error` frame and
  no state change.
- One claim replaces the previous claim for that socket — a device is on
  exactly one page at a time. `page: null` clears content routing (global
  chrome keeps flowing; see D3).
- The claim is fire-and-forget from the page's perspective; the provider
  owns sending it (pages never touch the socket — phase 6 invariant).

### D2 — Presence registry: in-memory for routing, Redis for truth

The gateway keeps the fast path in memory and mirrors it to Redis — the
"user page activity" store Berkay asked for:

- **In-memory:** the claim lives on the socket (`ws.page`, `ws.pageParams`)
  plus an index `page:{page}:{userId} → Set<ws>`; claims are translated
  into the *existing* internal registries (a `feed` claim = watch topic
  `feed`; `post {id}` = watch `post:{id}`; `chat-room {room}` = room join)
  so every phase 6 emit path keeps working unchanged.
- **Redis mirror:** `HSET presence:{userId} {deviceHash} {"page":…,"params":…,"at":…}`
  with a TTL refreshed by the heartbeat; field deleted on socket close, key
  expires as a safety net. This is the durable claim of *"userToken:deviceToken
  is on page X"* — with one deliberate change: keys use **`userId` +
  `deviceTokenHash`**, not the raw `userToken`, because `userToken` is
  day-scoped and rotates at UTC midnight (the phase 6 B8 lesson — a
  presence keyed on it would silently orphan at midnight). The identity is
  the same; the key is the stable form of it.
- Why Redis at all when routing is in-memory: (a) it *is* the activity
  store — `HGETALL presence:{userId}` answers "which page is each of this
  user's devices on, since when" for any process, not just the gateway;
  (b) HTTP-side services can consult it (e.g. suppress a Web Push when the
  user is *looking at* the relevant page); (c) it is the multi-instance
  seam for the phase 10 k8s work — routing state already externalized.

### D3 — Emit routing: global chrome vs page content

Two scopes, on purpose (this refines, not replaces, the phase 6 registries):

- **Global chrome** (visible on every page: shell badge, bell) stays
  **service-scoped** — `Messages/Conversation`, `Notifications/Item`,
  `Notifications/Count` go to all of the user's MESSAGE/NOTIFICATION
  sockets regardless of page. A badge must bump while you read the feed.
- **Page content** becomes **claim-scoped** via `emitToPage(userId, page,
  frame)` and the claim-derived topic/room memberships:

| Trigger | Frames | Routed to |
| --- | --- | --- |
| DM sent | `direct-message` event (full message) | sender + recipient devices claiming `messages` |
| DM sent | `Messages/Conversation` renew | all recipient MESSAGE sockets (chrome) |
| messages read | `message-read` event + `Conversation {unread:0}` renew | sender's `messages` devices; reader's MESSAGE sockets |
| notification created | `Notifications/Item` + `Count` renews | all NOTIFICATION sockets (chrome); Web Push iff no NOTIFICATION socket |
| friend request/accept | `Notifications/Item` (+ payload `kind`) | chrome; devices claiming `friend-request` also get the refreshed pending-list renew |
| post created | `Feed/New` | devices claiming `feed` |
| post updated/commented | `Feed/Post {id}` | devices claiming `post` with that `id`, and `feed` claimers |
| room message | `room-message` event | devices claiming `chat-room` with that `room` |

Bandwidth consequence (the point of the design): full payloads flow only to
sockets whose page can render them; every other device gets the cheap
chrome renews. A device that navigates *to* a page gets current state from
the normal react-query fetch, then stays current via claim-scoped push —
no gap, because the claim is sent before the fetch resolves.

### D4 — Client store: the react-query cache IS the page data

Unchanged in spirit from phase 6 D4, now actually enforced: for every
pushed domain the cache is the **only** client store — pages hold no domain
`useState` (the pattern that made phase 6 consumer-less). The
always-mounted provider owns **all** cache writes, chat events included
(hooks-as-writers lose frames when unmounted — the reported bug class):

| Frame | Cache action |
| --- | --- |
| `direct-message` | upsert into `["messages", peerId]` (peer derived from sender/recipient vs own userId), dedupe by id; drop if thread never fetched |
| `message-read` / `message-delivered` | mark own outgoing rows for that peer |
| `room-message` | append to `["room", room]`, dedupe by id |
| renew frames | existing dispatch table (unchanged) |

`subscribe()` remains for *behavior* (auto-read triggers, scroll), never
state. Hook lineup: `useConversations` (exists), `useConversation(peerId)`
(infinite query over the existing cursor API), `useNotifications()` (list +
count; poll only while `status !== "open"`), `useFeedNewFlag()`,
`useRoom(room)`. After this phase, pushed-domain `useState` in v1 pages: **zero**.

### D5 — Read semantics (R1–R4, carried from phase 6 D5)

R1 notification page mount → `markAllRead` → server `Count 0` converges all
devices. R2 conversation open → `POST /messages/read` (exists). R3 DM
arriving in the open **visible** thread auto-reads (visibility guard +
`visibilitychange` flush) — implemented as a subscribe-behavior in the
messages page. R4 badges never compute — server values only; the dropdown's
`c - 1` arithmetic is deleted. With D3/D4 live, the existing push gating
(B3) becomes correct end-to-end with no backend change.

### D6 — Client transport fixes (B9/B10/B11)

- **Web Locks replaces the hand-rolled election.** The leader is whoever
  holds `navigator.locks.request("rt-leader", …)` — the browser guarantees
  exactly one holder per origin, hands off atomically on tab close/crash,
  and is indifferent to tab visibility (kills both B9 holes). The
  BroadcastChannel stays for frame fan-out and `cmd` forwarding only.
  Fallback when `navigator.locks` is unavailable: standalone socket per tab
  (correct, just less efficient — same as today's no-BroadcastChannel path).
- **Refresh-then-reconnect (B10):** on an auth-failure close the client
  busts the token cache and `POST /api/auth/refresh` once before the next
  attempt (max 3, then degraded — as phase 6 D1 specified).
- **Resync on `authenticated` (B11):** invalidate `["conversations"]`,
  `["notifications","list"]`, `["notifications","count"]`, and the current
  page's content key once per (re)connect — bounds any gap to one
  round-trip. The current claim is re-sent before the invalidations fire.

### D7 — Gateway hardening (B12)

`maxPayload: 64 * 1024` on the WSS; service-name allowlist
(`MESSAGE | NOTIFICATION | CHAT`) in `handleRegister`; page/params
allowlist in the claim handler (D1); presence Redis writes rate-limited per
socket (a navigation storm cannot hammer Redis — claims coalesce, last one
wins). Existing per-IP pending and per-user socket caps unchanged.

## Sequencing — additive backend first, then page-by-page frontend

1. **Stage A — backend, additive (T1–T3):** claim frame + presence registry
   + page-aware emit routing behind it. The deployed frontend keeps working
   untouched (it sends no claims; chrome renews are service-scoped exactly
   as today).
2. **Stage B — client transport (T4–T5):** Web Locks leadership, refresh,
   resync, claim sending. Ships alone; pages still REST-rendered.
3. **Stage C — pages (T6–T10):** messages first (the reported bug), then
   notifications, feed/post, chat-room. Each page independently shippable.
4. **Stage D — deletions + docs (T11–T12).**

## Tasks

Sizes: S ≈ ≤half day, M ≈ a day, L ≈ multi-day.

### Stage A — backend

- [x] **T1 (M) — claim handler + presence registry.** `page` frame with
  allowlist validation; per-socket claim state; claim→topic/room
  translation; `page:{page}:{userId}` index + `emitToPage`. Unit tests:
  claim replace semantics, invalid page/params rejected, close cleans up,
  midnight-stable keys.
  *Verify:* wscat — auth, claim `feed`, receive `Feed/New` on a post;
  re-claim `messages`, stop receiving feed frames.
- [x] **T2 (S) — Redis presence mirror.** `presence:{userId}` hash per D2
  (write on claim, field-delete on close, TTL refresh on heartbeat).
  *Verify:* two devices on different pages → `HGETALL presence:{userId}`
  shows both rows live; close one socket → field gone.
- [x] **T3 (M) — page-aware emit routing (D3 table).** DM/read/room/feed/
  post emit sites route content frames by claim; chrome renews unchanged;
  friend-event pending-list renew for `friend-request` claimers.
  *Verify:* device on `feed` gets no `direct-message` payloads but its
  badge renews on an incoming DM; device on `messages` gets both.

### Stage B — client transport

- [x] **T4 (M) — Web Locks leadership (B9).** Replace election/heartbeat/
  timeout machinery; BroadcastChannel keeps fan-out + cmd forwarding;
  standalone fallback.
  *Verify:* 4 tabs → exactly one socket (server-side count); kill the
  leader tab → new socket within 2 s, no dual-leader window (devtools on
  two surviving tabs); hidden leader keeps leadership.
- [x] **T5 (M) — refresh-then-reconnect + resync + claim replay
  (B10/B11).** Token-cache bust + one `/api/auth/refresh` on auth-fail
  close; invalidate chrome keys + current page key on `authenticated`;
  re-send current claim on every (re)connect.
  *Verify:* idle past the 15-min session TTL → next reconnect silently
  refreshes and resyncs (badges correct, no reload); kill backend 30 s →
  one resync burst, thread/badges correct.

### Stage C — pages

- [x] **T6 (L) — messages page on the cache (B1, R2/R3).**
  `useConversation(peerId)` + `useConversations`; provider dispatch per D4;
  optimistic send into the cache (REST response upsert; echoed frame
  dedupes); claim carries the open `peer`; R3 visibility-guarded auto-read.
  *Verify (the reported repro):* B DMs A while A has the thread open →
  bubble < 1 s, zero refetches in the network tab; hidden tab → no receipt
  until focus; sender ticks progress sent→delivered→read; A's second
  device on the feed page: badge bumps, no message payload received
  (server log), thread correct when it navigates in.
- [x] **T7 (M) — notifications live (B2/B3, R4).** `useNotifications()`;
  dropdown badge/list from the caches; arithmetic deleted; poll only while
  degraded.
  *Verify:* notification while dropdown closed → badge < 1 s, no HTTP;
  open dropdown → item already present; app open → no OS toast; tab closed
  → OS toast (B3 correct end-to-end).
- [x] **T8 (S) — notification page auto-read (B4, R1).**
  *Verify:* visit on A → badge zeroes on A and B; item arriving while open
  prepends and stays unread per the recount.
- [x] **T9 (M) — feed pill + post detail renew (B5/B6).** Feed claims
  `feed` (pill → refetch + scroll-top on click, never auto-yank); post
  detail claims `post {id}` — restores live comments/reactions.
  *Verify:* post from B → A's pill < 1 s; comment from B on A's open post
  → renews; navigate feed→post→feed across a reconnect → claims replayed
  (server log).
- [x] **T10 (M) — chat-room live (B7).** `useRoom(room)`; claim carries the
  room; history via REST backfill.
  *Verify:* two-browser live chat; backend restart → auto re-claim +
  rejoin, messages flow without reload.

### Stage D — hardening, deletions, docs

- [x] **T11 (S) — gateway hardening (B12) + stage-C leftovers (B13).**
  `maxPayload`, register allowlist, claim rate-limit; delete
  `NotificationGateway` + `PostEventsGateway` + `socket.io-client`;
  confirm the openresty `/socket.io/` location can be dropped (prod memory).
  *Verify:* `grep -rn "socket.io" src/notification src/post` empty; 128 KiB
  frame from an authed wscat → connection closed, server healthy; backend
  boots; frontend builds.
- [x] **T12 (M) — `docs/backend/REALTIME.md`.** Normative: auth handshake
  (link AUTH.md), **the page-claim protocol + presence keys**, chrome vs
  page-content routing, both frame families, the D4 dispatch table
  (frame → query key), one-store rule, R1–R4, reconnect/replay/resync
  contract, push-gating rule, forward-compat ignore rule. Update this
  tracker + phase6.md boxes.

## Verify loop (phase gate)

- [x] **Messages loop (the phase raison d'être):** B DMs A with A's thread
  open → bubble < 1 s, no refetch; hidden-tab receipt semantics; both A
  devices converge; ticks correct.
- [x] **Presence loop:** walk messages → feed → post → chat-room on two
  devices while watching `HGETALL presence:{userId}` — rows track
  navigation live; content frames follow the claims (server-side emit
  counts); chrome renews reach every socket throughout.
- [x] **Notification loop:** badge < 1 s everywhere, zero polling; open app
  → no OS toast; closed → toast; R1 zeroes all devices.
- [x] **Feed/post/room loops:** pill; live post renew; live room chat.
- [x] **Resilience:** kill backend 30 s → one resync, claims replayed, all
  four domains correct, no reload; idle past session TTL → silent refresh
  reconnect; 4-tab leadership handoff with zero dual-socket windows.
- [x] **One-socket + one-store audit:** one WS per browser across the full
  walk; no pushed-domain `useState` in `src/app/v1` (grep audit); Redis
  presence cleared after logout/close.

## Close-out

Phase 7 is complete per the phase 8 hand-off audit (A1–A5). All
T1–T12 boxes checked. Remaining delivery-path gaps T1–T4 fixed
in phase 8 (bounded SQL, notification index, find-friends cache,
socket.io-client deletion). Phase 7 tracker + REALTIME.md written.

## Phase queue (updated 2026-07-03)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1–4 (done) | See [phase4.md](phase4.md) queue table | — |
| 5 (skipped-renumbered) | — reserved — | — |
| 6 (done, re-scoped) | Realtime consolidation: socket, renew protocol, emit points | [phase6.md](phase6.md) |
| **7 (this)** | Page-claim realtime: presence in Redis, page-scoped push, transport fixes, hardening | this file |
| 8 | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7 realtime loops | [todo/01](../../todo/01-stack-integration.md) |
| 9 | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../../todo/01-stack-integration.md) |
| 10 | Backend warts + compose hardening + k8s | [todo/02](../../todo/02-backend.md), [todo/04](../../todo/04-devops.md) |
| 11 | Backlog: OTel/metrics, Web Push e2e, social auth, seed, publishing, backups | [todo/02](../../todo/02-backend.md)–[05](../../todo/05-docs-maintenance.md) |
