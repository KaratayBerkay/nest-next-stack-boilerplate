# Phase 6 — Realtime consolidation: one socket, renew protocol, solid read semantics

> Execution tracker for the sixth phase of the [stack roadmap](../../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-03 · Status: **closed 2026-07-03 — Stage A (T1–T5) + provider (T6) shipped & verified; T7–T14 re-scoped into [phase7.md](phase7.md)**

Close-out (2026-07-03): Stage A and the `RealtimeProvider` are live on prod
and E2E-verified (WS auth → `register` → `direct-message` event +
`Messages/Conversation` renew received end-to-end; notification emits + push
gating confirmed). Two deploy defects were found and fixed during rollout:
the frontend image must be **rebuilt** with `REALTIME_WS_URL` set (the
missing var baked the `ws://localhost:3000/ws` fallback — the "WS never
connects" incident), and Google OAuth returned an empty `providerAccountId`,
merging every Google login into the first user (fixed + fail-closed guard,
commit 6392386). The frontend page consumption (T7–T11), stage-C leftovers
(T12–T13 remainder) and REALTIME.md (T14) move to [phase7.md](phase7.md) —
its survey has the emitted-vs-consumed matrix.

Re-scope note (2026-07-03): the phase 4 queue had phase 5 = cross-stack e2e and
phase 6 = root CI. Berkay re-prioritized after reviewing the realtime UX: the
current socket architecture (2× raw WS + 2× socket.io + polling, duplicated
client state, client-drifted unread counts, dead notification socket) is not
acceptable. This phase consolidates all realtime traffic into **one
authenticated WebSocket per tab** with a **server-authoritative renew
protocol** and fixes the read/unread semantics end to end. The e2e suite and CI
phases move down the queue and will cover these flows when they land.

## Current state (survey 2026-07-03)

Sockets held by a logged-in user sitting on `/v1/{lang}/messages`:

| # | Owner | Transport | Auth | Purpose |
| --- | --- | --- | --- | --- |
| 1 | `V1Shell` → `useMessaging` | raw WS `/ws` | 4-token first frame | sidebar unread badge only |
| 2 | `messages` page → `useMessaging` | raw WS `/ws` (second connection) | 4-token | conversations, DMs |
| 3 | `NotificationDropdown` → `useNotifications` | socket.io `/notifications` | broken (never connects) | supposed to push notifications; 30 s poll does the real work |
| 4 | `rooms` page → `useChatRoom` | raw WS `/ws` (third) | 4-token | chat rooms |
| 5 | post detail → `usePostSocket` | socket.io default namespace | **none** | `post-updated` |
| 6 | service worker | Web Push | VAPID | offline notifications (stays) |

`find-friends` mounts `useMessaging` too (socket #3 on that page) even though
it only needs the friends REST helpers — the socket is pure waste there.

### Defects (each mapped to a task below)

- **B1 — realtime notifications are dead.** `useNotifications.ts:33` expects
  `{ token }` from `/api/auth/token`, which returns
  `{ accessToken, rbacToken, deviceToken, userToken }`. `token` is always
  `undefined` → `connectSocket()` returns early → the socket.io connection
  never opens. The badge only updates via the 30 s `unread-count` poll. This
  is the root cause of "notifications/feed don't renew on arrival".
- **B2 — duplicated client state + fetch storms.** Shell and messages page
  each mount `useMessaging` → two `/ws` sockets, two independent
  `conversations` arrays; every `authenticated` event triggers
  `fetchConversations + fetchFriends + fetchFriendRequests` per instance.
  Sync between the copies is accidental (server `message-read` broadcasts
  happen to reach both sockets because both belong to the same user).
- **B3 — client-drifted counts.** `unreadCount` is maintained by local
  `+1`/`-1` arithmetic in each hook instance. Any missed frame (reconnect
  gap, race) drifts the badge until a full reload. The backend already
  recomputes drift-free unread counts into the Redis session hash
  (`notification.service.ts:121-127`) but never pushes them to clients.
- **B4 — `PostEventsGateway` is unauthenticated** (`cors: '*'`, no token
  check): anyone can open a socket.io connection and join any `post:{id}`
  room. Leak severity is low (only "post X changed" pings) but it is an
  open unauthenticated socket surface consuming server FDs.
- **B5 — notification click routing dead-ends.** `NotificationDropdown`
  `handleNavigate` only handles `payload.postId`; the notification page has
  no navigation at all (`page.tsx:139` only marks read); `sw.js` only
  special-cases `postId`; FRIEND_REQUEST notifications carry an empty
  payload; the find-friends pending tab is not deep-linkable
  (`Tabs defaultValue="add"`, no URL param).
- **B6 — no auto-read.** Visiting the notification page does not mark
  notifications read (manual "Mark all read" button only), so the badge
  survives the very act of reading.
- **B7 — duplicate delivery when online.** `NotificationService.create`
  always sends Web Push even when the user has a live socket. The MESSAGE
  path already gates push on `hasServiceConnection`; NOTIFICATION can't yet,
  because nothing registers a NOTIFICATION service.
- **B8 — midnight re-key gap in service routing.** Sockets register under
  the *day-scoped* `userToken` captured at auth time
  (`messaging-ws.gateway.ts:245`, map keys `SERVICE:userToken:deviceHash`).
  Emit-side lookups derive a **fresh** token
  (`broadcastDirectMessage` → `deriveUserToken(recipientId)`). A socket that
  authenticated before UTC midnight is keyed under *yesterday's* token, so
  after midnight every lookup misses: `sendToService` stops reaching it and
  `hasServiceConnection` reports the user offline → wrong Web Push
  duplicates. Long-lived connections make this a certainty, not an edge
  case (the WS never re-auths; only the heartbeat keeps it alive).
- **B9 — socket.io fallback bypasses revocation.** `NotificationGateway`
  accepts a *bare JWT* ("legacy clients" path,
  `notification.gateway.ts:53-65`) with no Redis session check, no
  userToken/RBAC verification. A revoked session keeps receiving
  notifications until the JWT expires (≤ 15 min) — the only auth path in
  the stack that escapes phase-2 instant revocation.

### What already works and is kept

The `/ws` gateway's 4-token first-frame auth (JWT verify → derived userToken
compare → Redis compound-key HGETALL → RBAC recompute, uniform
`"Auth failed"` on all branches), per-IP pending caps, per-user socket caps,
heartbeat, the `register {services}` fan-out maps (commit c4046ec — the
*mechanism* is right, only its key scheme has B8), the client's
refresh-then-reconnect loop, Web Push plumbing, and the drift-free unread
recount logic on the backend. Nothing in the auth protocol changes in this
phase.

## Design

### D1 — One socket per tab, owned by the shell

**Decision.** A `RealtimeProvider` client component, mounted once inside
`V1Shell`, owns the single WebSocket to `/ws`. It lives across all page
navigation and closes only on logout or tab close. **Pages never open
sockets** — page-scoped interests (a chat room, an open post, the feed) are
expressed as `watch`/`join` frames on the shared socket.

**Why.**
- *The shell already pays for a socket everywhere.* `V1Shell` keeps a `/ws`
  connection open on every v1 page just for the badge, so per-page sockets
  add cost without adding any capability.
- *Connect is expensive.* Each connect = WS upgrade + an
  `/api/auth/token` HTTP round-trip + JWT verify + two HMAC derivations +
  Redis HGETALL, and burns a per-IP pending slot for up to 15 s. Navigating
  messages → rooms → messages churns all of that per click.
- *The per-user cap interacts badly with socket sprawl.* The server closes
  the oldest socket above `MAX_SOCKETS_PER_USER = 20`. At 3–4 sockets per
  tab, a user with 5–6 tabs starts losing sockets **silently** — and the
  victim is often another tab's shell socket, killing its badge with no
  visible error. One socket per tab makes the cap mean "20 tabs/devices",
  which is sane.
- *One reconnect loop.* Refresh-retry, backoff, and resync logic currently
  exist per hook instance; N instances race each other against
  `/api/auth/refresh`. One owner = one loop.

**How.**
- New module `src/lib/realtime/`:
  - `realtime-client.ts` — a plain TypeScript class (no React) holding the
    socket, a state machine
    `idle → connecting → authenticating → open → backoff → connecting…`,
    a send queue, and the subscription registry. Being React-free makes it
    unit-testable with a mock WebSocket.
  - `RealtimeProvider.tsx` — thin React wrapper: instantiates the client
    when `token` becomes non-null, tears it down on logout/unmount, exposes
    context `{ status, send, subscribe }` plus a `useRealtimeStatus()` hook.
  - `frames.ts` — the frame type definitions (mirrored on the backend; see
    D3).
- Transport behavior (moved verbatim from `useMessaging`, then owned here):
  4-token first-frame handshake via `/api/auth/token`; on auth-failure
  close → `POST /api/auth/refresh` → reconnect (max 3, then degraded mode);
  exponential backoff with jitter for network-level drops (1 s → 2 s → 4 s
  … cap 30 s); on every `authenticated`: re-`register` services, replay all
  active `watch`/`join-room` subscriptions from the client's own registry
  (generalizing today's ad-hoc `roomRef` replay), then trigger the resync
  described in D4.
- `send()` while not `open` enqueues; the queue flushes after
  `authenticated`. This is what makes "join room, then socket reconnects"
  correct by construction instead of by ad-hoc refs.
- React 19 StrictMode double-mounts effects in dev: the provider guards
  with the standard `active` flag + cleanup-closes-own-instance pattern so
  dev doesn't open two sockets and production behavior is identical.
- Provider nesting order: `QueryClientProvider` → `AuthProvider` →
  `RealtimeProvider` → shell UI. The realtime client needs `queryClient`
  (D4) and the auth token, so it sits below both.
- Degraded mode (refresh-retry exhausted or offline): `status = "down"`;
  the D4 poll fallbacks take over; the client retries connect on
  `online` events and on a 60 s timer.

### D2 — One gateway on the backend, split into transport + domains

**Decision.** The raw-WS gateway is extracted into its own leaf
`RealtimeModule` as a pure **transport + registry** (auth, service/topic
registries, emit primitives). Domain modules (messaging, notification,
post) *register frame handlers on it* instead of the gateway importing
domain services. The socket.io `NotificationGateway` and
`PostEventsGateway` are then deleted. Docs-demo gateways
(`ws/chat.gateway.ts`, `ws-enhancers/`, `ws-adapter/`) are untouched — they
are docs-catalog artifacts, not part of the v1 app.

**Why one gateway.**
- *Two auth models is one too many.* The raw gateway does the full 4-token
  session check; socket.io's fallback accepts a bare JWT (B9), silently
  exempting notifications from instant revocation. Merging doesn't just
  simplify — it closes a real auth-consistency hole, and B4's
  unauthenticated post socket dies with it.
- *Ops surface.* socket.io needs its own `/socket.io/` upgrade path,
  polling fallback, and CORS config through the prod openresty proxy; the
  raw gateway is one `/ws` location that already works in prod. Deleting
  socket.io removes an entire proxy/CORS/transport-negotiation axis.
- *One delivery model.* Today "send to user" exists three ways (socket.io
  rooms `user:{id}`, raw-WS `wss.clients` scans by `userId`, service maps
  by `userToken`). After this phase there is exactly one registry.

**Why the module split (and not `forwardRef`).** Wiring
`NotificationService → MessagingWsGateway` directly creates a module cycle:
NotificationModule would import MessagingModule (for the gateway) while
MessagingModule already imports NotificationModule
(`MessagingService → NotificationService` for friend-event notifications).
The deleted `ws-notification-bridge.service.ts` (see git history) is the
scar of the last fight with this cycle. `forwardRef` would paper over it
again; inverting the dependency removes it structurally: the gateway
depends only on auth/crypto primitives, and *every* domain module depends
one-way on `RealtimeModule`.

**How.**
- `src/realtime/realtime.module.ts` + `realtime.gateway.ts` (the current
  `MessagingWsGateway` file moves and sheds its domain deps: `PrismaService`,
  `MessagingService`, `PushNotificationService` all leave the constructor;
  what remains is `HttpAdapterHost`, `JwtService`, `TokenStoreService`,
  `TokenDerivationService`, `CryptoService`). Same `/ws` path, byte-identical
  auth handshake — zero client-visible protocol change from the move itself.
- **Registries re-keyed by `userId` (fixes B8).** `userToken` stays a wire
  /auth concern only; internal maps become
  `SERVICE:userId:deviceHash → Set<ws>` and `SERVICE:userId → Set<deviceHash>`.
  `userId` is stable across midnight, so registration-time and emit-time
  keys can never diverge. (`deviceTokenHash` keeps multi-device dedupe.)
- **Frame-handler registry** — the inversion point:

  ```ts
  type FrameHandler = (ws: AuthedSocket, data: Record<string, unknown>) => void | Promise<void>;
  registerHandler(type: string, handler: FrameHandler): void; // throws on duplicate type
  ```

  Post-auth `handleMessage` becomes: parse → look up `handlers.get(data.type)`
  → invoke. The gateway keeps only protocol built-ins: `auth`, `register`,
  `watch`, `unwatch`. MessagingModule registers `direct-message`,
  `delivered-ack`, `join-room`, `leave-room`, `room-message`,
  `get-room-counts` at its `onModuleInit`; the handler bodies are today's
  gateway methods, moved next to `MessagingService` where they belong.
- **Emit surface** (all userId-based):

  ```ts
  emitToUser(userId, frame): number            // every socket of the user
  emitToService(userId, service, frame): number // sockets registered for service
  emitToTopic(topic, frame): number             // watchers of a topic
  hasServiceConnection(userId, service): boolean
  broadcastAll(frame): void                     // presence/room-counts only
  ```

- **Services vs topics — two routing kinds on purpose.**
  *Services* (`MESSAGE`, `NOTIFICATION`, `CHAT`) are per-user delivery
  classes: "this user wants message/notification frames on this device".
  *Topics* (`feed`, `post:{id}`) are content subscriptions shared across
  users: `{ type: "watch", topic: "post:123" }` / `unwatch`, held in a
  `Map<topic, Set<ws>>`, cleaned on close. Post/feed events are topics —
  they must not be per-user services because fan-out is by interest, not
  identity. Only authenticated sockets can watch (B4 fixed by
  construction). Topic names are validated against an allowlist pattern
  (`feed` | `post:{cuid}`) so clients can't create unbounded map keys.
- The MESSAGE offline-push fallback moves out of the gateway into
  `MessagingService` (domain logic: *persist → emit → push if
  `!hasServiceConnection`*). The gateway ends the phase with zero knowledge
  of Prisma, push, or any domain.
- Renaming `MessagingWsGateway → RealtimeGateway` happens as part of the
  move (T1) since the file relocates anyway; grep-level rename, no logic in
  the same commit beyond the re-key.

### D3 — The renew protocol (server → client)

**Decision.** Two frame families. **Renew frames** carry
server-authoritative state deltas in the agreed envelope
(`{ renew, type, ... }`); **event frames** are the existing streamed
payloads for the chat path. Documented normatively in
`docs/backend/REALTIME.md` (T14).

**Why hybrid, not pure renew-and-refetch.** A DM under
invalidate-then-refetch costs an extra HTTP round-trip + server query per
message per open device — typing rhythm and read receipts would visibly
lag, and N devices × M messages amplifies load. Chat frames already exist
and work; there is no reason to churn them.

**Why absolute values, not deltas.** Client `+1/-1` arithmetic (B3)
requires perfect frame delivery; any reconnect gap drifts the badge until
reload. Absolute values are **idempotent**: applying the same frame twice,
or applying a late frame after a newer one, self-heals on the next emit,
and one resync refetch after reconnect restores truth. Frames from one
Node process over one TCP socket arrive in emit order, so last-write-wins
matches server state.

**The frames:**

```jsonc
// Renew family — state sync, server-authoritative
{ "renew": "Notifications", "type": "Count", "value": 3 }
{ "renew": "Notifications", "type": "Item", "item": { /* NotificationEmitDto */ } }
{ "renew": "Messages", "type": "Conversation",
  "conversation": { "user": { "id": "…", "name": "…", "avatar": "…" },
                     "lastMessage": "…", "lastTime": "…", "unread": 2 } }
{ "renew": "Feed", "type": "Post", "id": "…" }   // one post changed → invalidate it
{ "renew": "Feed", "type": "New" }                // new posts exist → show pill

// Event family — unchanged shapes (chat path)
direct-message · message-read · message-delivered · room-message
user-joined/left · user-online/offline · room-counts · authenticated · error
```

- **`Messages/Conversation` carries the full row, absolute `unread`.** This
  replaces the originally sketched `Messages/Count` total: the badge is
  `sum(conversations[].unread)` over rows the *server* sent — same
  no-client-arithmetic guarantee, but no extra `COUNT(*)` query per message
  on the backend, and it doubles as the list updater (new-conversation
  upsert included: a first-ever message from a new friend inserts the row
  the patch describes). One frame does count + preview + ordering.
- **`Notifications/Count` stays a scalar** because a single number is the
  entire badge state and the drift-free recount already computes it.
  `Item` is pushed alongside so an open dropdown/page prepends instantly
  without refetch.
- **Forward-compat rule (normative):** clients MUST ignore renew frames
  with unknown `renew` or `type` values silently. New scopes can then ship
  backend-first without breaking deployed frontends.
- Types live in `frames.ts` twice (backend `src/realtime/`, frontend
  `src/lib/realtime/`) — the two apps share no package by design;
  `REALTIME.md` is the single source of truth and the phase-7 e2e suite is
  the drift guard.

**Emit points** (all via `emitToService`/`emitToTopic`, fan out to every
registered device):

| Trigger (service call) | Frames emitted |
| --- | --- |
| notification created | `Notifications/Item` + `Notifications/Count` to user's NOTIFICATION sockets; Web Push **iff** `!hasServiceConnection(userId, "NOTIFICATION")` |
| notification markRead / markAllRead | `Notifications/Count` (recount value) to user's NOTIFICATION sockets — all devices converge, incl. the one that acted |
| DM sent | `direct-message` event to sender+recipient sockets (as today) + `Messages/Conversation` to **recipient** MESSAGE sockets (absolute unread for that peer) |
| messages marked read (`POST /messages/read`) | `message-read` event (as today, feeds sender's receipt) + `Messages/Conversation {unread: 0}` to the **reader's** MESSAGE sockets (multi-device badge sync) |
| post created | `Feed/New` to topic `feed` |
| post updated / commented / reacted | `Feed/Post {id}` to topic `post:{id}` **and** topic `feed` |

Cost note: the only new query is the notification recount on `create`
(markRead/markAllRead already recount for the Redis rewrite — reuse that
value, don't query twice). All of these are write paths that already touch
Postgres; the zero-PG *read* paths (WS connect, badge render, `me`) gain no
queries.

### D4 — Frontend stores: react-query is the store

**Decision.** No new state library. Renew frames are dispatched by the
provider straight into the `@tanstack/react-query` cache; hooks become thin
`useQuery` consumers plus event subscriptions.

**Why.** react-query is already a dependency and already the project
direction (commit 048ac88 moved fetch+useEffect to useQuery). Its cache is
process-global, so the shell badge and the messages page reading the same
key **cannot** hold divergent copies — B2 dies structurally, not by
discipline. It also gives dedupe (one conversations fetch regardless of how
many components mount), staleness, and refetch-on-mount for free — the
exact machinery a hand-rolled store (or a new zustand dep) would
reimplement.

**How — dispatch rules.** `setQueryData` when the frame carries complete
state (zero HTTP); `invalidateQueries` when the frame is only a hint:

| Frame | Cache action |
| --- | --- |
| `Notifications/Count` | `setQueryData(["notifications","count"], value)` |
| `Notifications/Item` | `setQueryData(["notifications","list"], prepend + de-dupe by id)`; count comes from its own frame — no arithmetic |
| `Messages/Conversation` | `setQueryData(["conversations"], upsert row, resort by lastTime)` |
| `Feed/New` | set a `["feed","new-flag"]` value → pill (no auto-refetch: don't yank the scroll position under the reader) |
| `Feed/Post {id}` | `invalidateQueries(["posts", id])` — refetches only if that post is on screen (`refetchType: "active"`), goes stale-and-lazy otherwise, which is precisely "renew on arrival" for background pages |
| event frames | delivered to hook subscribers (chat path unchanged), which apply `setQueryData` on `["messages", peerId]` |

- **Query keys** (align with existing feed keys at implementation time):
  `["notifications","list"]`, `["notifications","count"]`,
  `["conversations"]`, `["messages", peerId]` (infinite query — existing
  cursor pagination maps onto `useInfiniteQuery`), `["friends"]`,
  `["friendRequests"]`, `["feed"]`.
- **Resync on `authenticated`** (the reconnect recovery): invalidate
  `["notifications","count"]`, `["notifications","list"]`,
  `["conversations"]` once. Active pages refetch immediately; everything
  else refetches on next mount. This bounds staleness after any gap to one
  round-trip.
- **Poll fallback becomes one line**:
  `refetchInterval: status === "open" ? false : 30_000` on the count/
  conversations queries. Healthy socket → zero polling; degraded mode →
  today's behavior, automatically.
- Hook lineup after the split: `useNotifications`, `useConversations`,
  `useConversation(peerId)`, `useFriends` (REST-only — find-friends stops
  touching the socket), `useChatRoom(room)`, `useFeedRealtime()`. The
  `useMessaging` monolith is deleted.

### D5 — Read semantics (the four rules)

- **R1 — visiting the notification page reads everything.**
  `markAllRead` fires on page mount; server emits `Notifications/Count 0`
  to all devices. *Why:* the badge is an attention pointer; opening the
  list *is* consuming that attention — a badge that survives reading is
  noise that trains users to ignore it. The dropdown deliberately does
  **not** auto-read-all (a glance at the bell is not reading; per-item
  click-read stays).
- **R2 — opening a conversation reads it.** `markMessagesRead(peer)` on
  select (exists, `messages/page.tsx:151` — kept). The emit-point table
  syncs the reader's other devices.
- **R3 — a DM arriving in the open conversation is read immediately, but
  only if the tab is visible.** Existing auto-read
  (`useMessaging.ts:300`) gains a `document.visibilityState === "visible"`
  guard, and a `visibilitychange → visible` listener flushes the read for
  messages that arrived while hidden. *Why the guard:* an auto-read from a
  background tab sends the sender a **false read receipt** and zeroes a
  badge for content nobody saw — the two failure modes users distrust
  most.
- **R4 — badges never compute.** Render = last server value (`Count` frame
  or `sum` of server-sent per-conversation `unread`), initialized by the
  mount fetch, corrected by the reconnect resync. No `+1` exists anywhere
  in the frontend after this phase.
- Race note (correct-by-design, documented so nobody "fixes" it): R1's
  `markAllRead` racing a concurrent notification create yields either
  order's serialization on the server; the new item stays unread and the
  final `Count` reflects it — an item that arrived *after* you read all is
  legitimately unread.

### D6 — Notification click routing (B5)

**How.**
- Backend: FRIEND_REQUEST notifications get
  `payload: { kind: "friend-request" }` (accept events
  `kind: "friend-accepted"`, routing to the friends list). The DM push
  payload already carries `{ kind: "direct-message", senderId }`.
- Frontend: one pure resolver, `src/lib/notification-route.ts`:
  `resolveNotificationRoute(n, lang): string` —
  `payload.postId` → `/v1/{lang}/feed#post-{id}`;
  `kind === "friend-request"` → `/v1/{lang}/find-friends?tab=pending`;
  `kind === "direct-message"` → `/v1/{lang}/messages?user={senderId}`;
  default → `/v1/{lang}/notification`. Used by the dropdown **and** the
  notification page (which today navigates nowhere).
- `sw.js` cannot import TS modules: it duplicates the 4-branch switch on
  `event.notification.data` (`postId`/`kind`), with `REALTIME.md` naming
  both copies. This is accepted duplication — a build step for the service
  worker is not worth four lines.
- `find-friends` reads `?tab=` (`useSearchParams`, needs its `Suspense`
  boundary per app-router rules) into `Tabs defaultValue` — remount on
  navigation makes uncontrolled sufficient.

### D7 — Env consolidation

After socket.io removal exactly one realtime URL remains:
`NEXT_PUBLIC_MSG_WS_URL` (→ `/ws`). `NEXT_PUBLIC_WS_URL` (socket.io origin)
is dropped from `env.ts`, `.env.example`, and compose — note `env.ts:39-40`
currently *derives* the MSG URL from `NEXT_PUBLIC_WS_URL` as a fallback, so
the schema must make `NEXT_PUBLIC_MSG_WS_URL` standalone (required, or
defaulted to `ws://localhost:8000/ws` for dev).
⚠️ Prod notes: `NEXT_PUBLIC_*` is baked at build time (see prod-deploy
memory) — the eys.gen.tr frontend image must be rebuilt with the var
present; the openresty `/ws` location must keep appending
`X-Forwarded-For` or the per-IP pending cap degrades to a global cap; the
`/socket.io/` proxy location can be deleted only after Stage C ships.

## Sequencing — strangler order, not big-bang

Three stages, each independently shippable and revertable:

- **Stage A (backend, additive only — T1–T5):** new module, new emit
  points, new payloads. The deployed frontend keeps working untouched: its
  raw-WS protocol is unchanged, its socket.io notification client is
  *already* dead (B1), and `PostEventsGateway` stays alive until Stage C.
- **Stage B (frontend migration — T6–T11):** the provider + hooks move to
  the new frames. Requires Stage A deployed first (frames must exist).
- **Stage C (deletions — T12–T13, docs T14):** remove socket.io gateways,
  client dep, dead env. Only after Stage B is verified in prod, because
  `usePostSocket` dies the moment `PostEventsGateway` does.

Why this order matters here specifically: dev compose deploys both apps
atomically, but eys.gen.tr builds/deploys the two images separately — a
frontend/backend version skew window always exists, and additive-first is
what makes the skew harmless. Rollback story: Stage B regressions revert
frontend only; Stage A emits to nobody and is inert; Stage C is the only
stage that burns bridges, which is why it goes last.

## Tasks

Sizes: S ≈ ≤half day, M ≈ a day, L ≈ multi-day.

### Stage A — backend, additive

- [x] **T1 (L) — `RealtimeModule` extraction + registry fix.**
  Move the gateway to `src/realtime/` as `RealtimeGateway` per D2: strip
  domain deps, add `registerHandler`, `emitToUser/Service/Topic`,
  `hasServiceConnection(userId, …)`, topic `watch`/`unwatch` with the
  allowlist, and **re-key all service maps by `userId` (B8)**. Auth
  handshake byte-identical. Unit tests: handler dispatch, duplicate-handler
  throw, cross-midnight emit (register with yesterday's derived token →
  `emitToService` by userId still hits), topic watch auth-gating + cleanup
  on close, per-user cap unchanged.
  *Verify:* existing messaging flows work unchanged against the moved
  gateway (wscat: auth → register MESSAGE → DM echo); gateway file imports
  no Prisma/Messaging/Push symbols.
- [x] **T2 (M) — messaging handlers + counts through the registry.**
  MessagingModule registers the six chat frame types (bodies move from the
  old gateway next to `MessagingService`); DM send path emits
  `Messages/Conversation` to recipient per D3 and gates its offline push on
  `hasServiceConnection(userId, "MESSAGE")` (now midnight-safe);
  messages-read path emits `Messages/Conversation {unread: 0}` to the
  reader's devices.
  *Verify:* two browsers, same user — read on A zeroes the badge on B
  without reload; third browser as sender sees the read receipt; DM to a
  fully-offline user still triggers exactly one Web Push.
- [x] **T3 (S) — notification emits + push gating.**
  `NotificationService.create` emits `Notifications/Item` + `Count` via
  `emitToService` and sends Web Push only when
  `!hasServiceConnection(userId, "NOTIFICATION")` (B7); markRead/markAllRead
  emit `Count` reusing the recount value they already compute (B3 server
  half). socket.io emit stays temporarily (harmless double-emit to a dead
  channel) so this task is purely additive.
  *Verify:* wscat registered for NOTIFICATION receives Item+Count on a
  triggered notification and **no** push arrives; close wscat → push
  arrives.
- [x] **T4 (S) — post/feed emits over topics.** Post create → `Feed/New` to
  topic `feed`; update/comment/reaction → `Feed/Post {id}` to `post:{id}` +
  `feed` (same service-call sites that today call
  `PostEventsGateway.broadcastPostUpdate`). `PostEventsGateway` untouched
  until Stage C.
  *Verify:* wscat watching `feed` and `post:{id}` receives both frame kinds
  on a comment; unauthenticated socket cannot watch.
- [x] **T5 (S) — FRIEND_REQUEST payload kind.** `notifyFriendEvent` passes
  `payload: { kind: "friend-request" }` / `"friend-accepted"` (B5 backend
  half). *Verify:* new request → notification row payload populated; WS
  Item frame and Web Push `data` both carry it.

### Stage B — frontend migration

- [x] **T6 (L) — `RealtimeProvider` + frame dispatch.** Implement D1's
  `realtime-client.ts` + provider (transport extracted from `useMessaging`,
  StrictMode-safe, send queue, watch-replay, degraded mode) and D4's
  renew-frame → react-query dispatch table. Registers
  `["MESSAGE","NOTIFICATION"]` post-auth. Fixes B1 by construction (the
  broken socket.io client stops being load-bearing).
  *Verify:* navigate messages → feed → find-friends → rooms → messages:
  devtools shows **one** WS connection for the whole walk, zero
  reconnects; kill backend 30 s → backoff, reconnect, resync (badges
  correct, no reload).
- [ ] **T7 (L) — dismantle `useMessaging`.** Split per D4 hook lineup;
  shell badge = `sum(unread)` over the shared `["conversations"]` cache;
  find-friends switches to REST-only `useFriends` (B2).
  *Verify:* messages page open, DM arrives → page thread and sidebar badge
  update from one socket; exactly one conversations fetch on connect
  (network tab); find-friends opens zero sockets.
- [ ] **T8 (M) — `useNotifications` rewrite.** react-query fetch, renew
  frames replace the poll, poll only while `status !== "open"` (D4
  one-liner).
  *Verify:* notification from another user → badge < 1 s with request
  logging showing no `/unread-count` polls; kill socket → polling resumes
  within 30 s.
- [ ] **T9 (M) — read semantics R1–R4.** Auto-`markAllRead` on notification
  page mount (R1/B6); visibility guard + visible-flush on DM auto-read
  (R3); delete every remaining `setUnreadCount(c => …)` arithmetic (R4).
  *Verify:* open notification page on A → badge zeroes on A and B; DM into
  an open-but-hidden tab → no read receipt, badge bumps; focus the tab →
  read receipt fires, badges zero everywhere.
- [ ] **T10 (S) — click routing.** `notification-route.ts` resolver wired
  into dropdown + notification page; `sw.js` switch on `kind`/`postId`;
  find-friends `?tab=` (B5 frontend half).
  *Verify:* friend-request notification clicked in dropdown, page, and OS
  push all land on the pending tab.
- [ ] **T11 (M) — feed renews on arrival.** Feed page watches topic `feed`
  (`Feed/New` → pill → refetch + scroll-top on click; `Feed/Post` →
  targeted invalidate); post detail watches `post:{id}` (replaces
  `usePostSocket` usage); stale-tab recovery via react-query
  `refetchOnWindowFocus` with `staleTime: 60_000` — no bespoke
  visibility listener.
  *Verify:* post from B while A sits on feed → pill; comment from B on a
  post A has open → A renews; A returns to a > 60 s-stale tab → refetch.

### Stage C — deletions + docs

- [ ] **T12 (S) — delete socket.io from the v1 backend.** Remove
  `NotificationGateway`, `PostEventsGateway`, their module wiring, the T3
  transitional double-emit, and (if nothing else needs it) the socket.io
  adapter deps for the v1 path. Docs-demo gateways stay.
  *Verify:* `grep -rn "socket.io" src/notification src/post` empty; backend
  boots clean; demo gateway specs pass; B9 is dead (no JWT-only realtime
  path remains).
- [ ] **T13 (S) — frontend cleanup + env.** Delete `usePostSocket`, the
  socket.io code path in `useNotifications`, `socket.io-client` from
  `package.json`; D7 env consolidation (standalone `NEXT_PUBLIC_MSG_WS_URL`,
  drop `NEXT_PUBLIC_WS_URL` everywhere).
  *Verify:* `grep -rn "socket.io-client" src/` empty; typecheck + lint +
  `next build` pass with the new env schema; compose stack boots.
- [ ] **T14 (M) — `docs/backend/REALTIME.md`.** Normative spec: auth
  handshake (link AUTH.md), services vs topics, both frame families with
  examples, the forward-compat ignore rule, emit-point table, R1–R4,
  reconnect/resync contract, push-fallback rule, `sw.js` duplication note.
  Cross-link from AUTH.md; update `.env.example` comments; update this
  file's checkboxes.

## Verify loop (phase gate)

- [ ] **One-socket audit:** logged-in walk across all v1 pages — exactly one
  WS connection in devtools, surviving every navigation; closed on logout;
  reopened on login without reload.
- [ ] **Two-device badge loop:** browsers A + B same user. Notification →
  both badges < 1 s. A opens notification page → both badges zero (R1). DM
  from third user → both message badges bump; A opens the conversation →
  both zero (R2/R3); sender sees the read receipt; hidden-tab variant does
  **not** read until focus.
- [ ] **Offline push loop:** all sockets closed → notification arrives as
  Web Push only; socket open → socket only, no duplicate push. Repeat the
  online case **across a UTC midnight boundary** (or with a mocked
  derivation date) — still no duplicate push (B8 regression check).
- [ ] **Feed loop:** post from B → A's pill; comment on A's open post →
  live renew; friend-request click-through → pending tab from all three
  surfaces.
- [ ] **Resilience:** kill backend 30 s with both browsers open → backoff,
  reconnect, one resync, correct badges; token rotation mid-session →
  silent re-auth without reload; refresh-retry exhaustion → polling covers
  badges until the socket returns.
- [ ] **Zero-PG hot paths unchanged:** WS connect and badge-render flows add
  no Postgres reads (pg `log_statement='all'` spot check, per phase 4); the
  only new write-path query is the notification-create recount.

## Phase queue (updated 2026-07-03)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1–4 (done) | See [phase4.md](phase4.md) queue table | — |
| 5 (skipped-renumbered) | — reserved; e2e moved below — | — |
| **6 (this, closed)** | Realtime consolidation: one socket, renew protocol, emit points — Stage A + T6 shipped | this file |
| 7 | Page-level data push (re-scoped T7–T14: page consumers, read semantics, stage-C leftovers) | [phase7.md](phase7.md) |
| 8 | Cross-stack e2e: `STACK=1` Playwright — now incl. the phase 6+7 realtime loops | [todo/01](../../todo/01-stack-integration.md) |
| 9 | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../../todo/01-stack-integration.md) |
| 10 | Backend warts + compose hardening + k8s | [todo/02](../../todo/02-backend.md), [todo/04](../../todo/04-devops.md) |
| 11 | Backlog: OTel/metrics, Web Push e2e, social auth, seed, publishing, backups | [todo/02](../../todo/02-backend.md)–[05](../../todo/05-docs-maintenance.md) |
