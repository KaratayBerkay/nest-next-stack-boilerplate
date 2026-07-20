# Project Enhance 6 — RealtimeGateway & WebSocket Data-Transfer Audit (Messages, Chat Rooms, Notifications)

> **Rev 1 — 2026-07-20.** Berkay's observation: landing on `/v1/en/messages`,
> newly-arriving messages don't show up live, and this is not the first time —
> "even tho we fix it several times we still struggle displaying messages
> instantly." This doc is a **planning register only — no code was changed.**
> It traces every file in both apps that touches the WebSocket (`nest-js-
> boilerplate/src/realtime/*`, `src/messaging/*`, `src/notification/*` on the
> backend; `next-js-boilerplate/src/lib/realtime/*` plus every view that
> consumes it on the frontend), cites 3 prior commits that already fixed this
> exact class of bug once (`628eb0d`, `2f8b406`, `737ee77`, all landed the same
> day, 2026-07-04), and explains — with file:line citations, not guesses — why
> the underlying architecture keeps producing new instances of the same
> symptom instead of staying fixed.
>
> **Headline finding:** this is not one bug, it's a shape. Every "instant
> delivery" path in this system was hand-rolled independently three times
> over (a generic cache-patcher, a generic renew-patcher, and 1-2 ad-hoc
> per-component `subscribe()` calls), each with **its own silent-fail-closed
> gate** that drops a frame if the target React Query cache entry doesn't
> already exist — and the exact files where these gates live
> (`event-dispatch.ts`, `useRealtimeCoordination.ts`, `realtime-page.
> manager.ts`) have **zero test coverage** today, while the adjacent,
> lower-risk transport layer (`realtime-client.ts`) has 29 passing tests. On
> top of that, sending a direct message has **two live server-side
> implementations that already disagree** (the REST controller delivers in
> full; the GraphQL mutation never calls `deliverDirectMessage` at all), and
> the multi-tab connection-sharing design means only the **most recently
> focused tab** actually receives page-scoped push frames — a second tab
> sitting on `/messages` can go silent the moment any other tab claims a
> different realtime page. None of this requires bad luck to reproduce; it's
> the designed behavior of gates that were built to fail silently.

> **Rev 2 — 2026-07-20 (control run).** Berkay landed commit `ac55fb7`
> ("implement project-enhance-6 all 7 phases") and asked for a completion
> check. Verdict: **NOT gate-clean.** Most of the 7 phases are genuinely,
> correctly implemented (see §17 for the full breakdown), but the single
> highest-value fix in this whole doc — the multi-tab page-claim redesign
> (§8, §16 #2) — **does not work**: a one-line JS bug
> (`useRealtimeCoordination.ts:25-26`, `useRef<string>("")` guarded by
> `== null`, which never matches `""`) means `crypto.randomUUID()` never
> runs, every tab still shares one constant tab id, and the Map-based
> redesign collapses back to exactly the original last-claimed-tab-wins bug
> it was built to fix — meaning Berkay's original reported symptom is
> **likely still not resolved**. The commit also silently reverts an
> unrelated same-day fix (`2b59ab5`, `COOKIE_SAMESITE` default) with zero
> mention. Full findings in §17. Nothing was fixed during this control run —
> findings only, per this project's convention.

---

## Table of Contents

1. [How to use this doc](#1-how-to-use-this-doc)
2. [Executive summary — priority board](#2-executive-summary--priority-board)
3. [Why the hot fixes keep not sticking](#3-why-the-hot-fixes-keep-not-sticking)
4. [Full WebSocket inventory — frontend](#4-full-websocket-inventory--frontend)
5. [Full WebSocket inventory — backend](#5-full-websocket-inventory--backend)
6. [Architecture walkthrough — one connection's life, end to end](#6-architecture-walkthrough--one-connections-life-end-to-end)
7. [Findings — transport & connection layer](#7-findings--transport--connection-layer)
8. [Findings — multi-tab & page-claim system](#8-findings--multi-tab--page-claim-system)
9. [Findings — direct messages (DM)](#9-findings--direct-messages-dm)
10. [Findings — chat rooms](#10-findings--chat-rooms)
11. [Findings — notifications & presence](#11-findings--notifications--presence)
12. [Findings — backend fan-out drift (REST vs GraphQL)](#12-findings--backend-fan-out-drift-rest-vs-graphql)
13. [Test-coverage gap map](#13-test-coverage-gap-map)
14. [Enhancement proposals](#14-enhancement-proposals)
15. [Suggested implementation order](#15-suggested-implementation-order)
16. [Top 10](#16-top-10)
17. [Control run — commit `ac55fb7` vs. this audit](#17-control-run--commit-ac55fb7-vs-this-audit)

---

## 1. How to use this doc

Each finding names **Where** (file:line), **What's wrong** (traced, not
assumed), and **How to fix** (concrete steps). Findings are tagged like
`project-enhance-5`: **P0** (broken today / breaks at scale), **P1** (live UX
bug, "why messages don't feel instant"), **P2** (real but narrower), **P3**
(hygiene/drift). Nothing here has been implemented — checkboxes, if any
appear, describe future work, not completed work.

Scope is exactly the 3 features named: **direct messages**, **chat rooms**,
**notifications** — plus the shared transport (`RealtimeGateway` /
`RealtimeClient` / page-claim system) all three sit on. Feed/posts/friend-
request realtime usage is mentioned only where it shares code with the 3
in-scope features.

---

## 2. Executive summary — priority board

| # | Sev | Finding | Where |
|---|-----|---------|-------|
| 1 | P0 | Chat-room membership/counts are process-local memory with a write-only, never-read Redis mirror — multi-replica deployments will show a different online-member list per replica, silently | `messaging-room.service.ts` |
| 2 | P0 | GraphQL `sendMessage` mutation never calls `deliverDirectMessage` — zero realtime delivery, zero push-notification fallback, on a live reachable endpoint that already disagrees with the REST controller doing the same job | `messaging.resolver.ts:42-48` vs `messaging.controller.ts:178-193` |
| 3 | P1 | Silent-drop-if-uncached gate, no fallback, on all 4 event types (direct-message, message-read, message-delivered, room-message) — the exact gate shape that already caused 2 historical incidents | `event-dispatch.ts:19,39,59,82` |
| 4 | P1 | Multi-tab, single-shared-connection page-claim overwrite: only the most-recently-claimed tab gets page-scoped push frames | `realtime-page.manager.ts:11-18,98-159`, `useRealtimeCoordination.ts:237-252` |
| 5 | P1 | Zero optimistic send anywhere; DM send is 2 sequential network round-trips before the sender sees their own message; chat-room's `tempId` optimistic path is half-built and dead | `actions.ts:6-12`, `ChatRoomBaseView.tsx:235-252`, `event-dispatch.ts:77-91` |
| 6 | P1 | 3 independent, differently-gated code paths all react to "a DM arrived" — a fix to one doesn't fix the others | `useRealtimeCoordination.ts:41-81` |
| 7 | P2 | Query-population race: cache gate reads `undefined` during the in-flight initial fetch, so a frame arriving in that window is dropped and never backfilled | `event-dispatch.ts:19,82` |
| 8 | P2 | Only 2 of ~7 realtime-fed queries have a polling backstop; the other 5 have no self-healing if a frame is dropped | `notifications/query.ts:30-46` vs `messages/query.ts:28-63` |
| 9 | P2 | Duplicate `register` frame sent on every reconnect (harmless but symptomatic of drift) | `realtime-client.ts:134-137,164-171` |
| 10 | P2 | GraphQL `markMessagesRead` fan-out is a fraction of the REST controller's — same "2 implementations, already disagree" pattern as #2 | `messaging.resolver.ts:50-69` vs `messaging.controller.ts:195-241` |
| 11 | P3 | `frames.ts`'s documented `EventFrame` shapes don't match what's actually sent on the wire (decorative, not load-bearing) | `frames.ts:39-45` |
| 12 | P3 | `get-room-counts` re-fetched on every room switch though it returns all rooms at once | `ChatRoomBaseView.tsx:296-306` |

**Test-coverage headline:** the 3 files most responsible for "message doesn't
arrive" bugs — `event-dispatch.ts`, `useRealtimeCoordination.ts`,
`realtime-page.manager.ts` — have **0 tests** between them. The one frontend
realtime test file that exists, `realtime-client.test.ts` (29 `it` blocks),
covers only transport concerns (connect/backoff/auth-retry/queueing) that
have never been the actual site of a reported bug. Full map in §13.

---

## 3. Why the hot fixes keep not sticking

This is the direct answer to "even tho we fix it several times." Three
commits, all 2026-07-04, already fixed this exact symptom once:

- **`2f8b406`** — *"update infinite query cache correctly on direct-message
  events + handle POST response fallback."* Before this commit, the DM cache
  patch wrote into a flat `{ messages: [...] }` shape; the query had since
  become an infinite query (`{ pages: [...] }`), so the patch was silently
  writing to a shape nothing read. Fixed by rewriting the patch to splice
  into `pages[0]`.
- **`628eb0d`** — *"stale closure over `user?.id` in WebSocket frame processor
  causing all direct-message events to be dropped."* Landed 8 minutes after
  `2f8b406` in the same session. `dispatchEvent(queryClient, frame, user?.id)`
  captured `user?.id` from the render that created the effect; once `user`
  populated after auth resolved, the closure never saw the update, so
  `ownUserId` stayed `undefined` forever and every gate in `dispatchEvent`
  that checks `&& ownUserId` failed closed. Fixed by adding `userIdRef` and
  reading `userIdRef.current` at call time instead.
- **`737ee77`**, same day, later — *"Auto mark messages read when new DM
  arrives in active conversation."* Added a **third**, separate handler
  (still live today, `useRealtimeCoordination.ts:55-77`) that reacts to the
  same `direct-message` frame type as `event-dispatch.ts`, with its own
  independent gating condition, to zero the sidebar's unread badge.

**Both root causes from 2026-07-04 are correctly fixed in the code as it
stands today** — `userIdRef` is still there (`useRealtimeCoordination.ts:30,
33-35,44`), and the infinite-query splice shape is intact
(`event-dispatch.ts:20-31`). That is the important, non-obvious part: **this
isn't a case of the old fix regressing.** The reason the underlying complaint
("messages don't feel instant") persists anyway is structural, and traces to
four things every one of those three commits worked *around* rather than
*on*:

1. **The silent-fail-closed gate itself was never questioned.** All three
   commits patched *what* happens when the gate is open; none of them asked
   why an unrecognized state (cache not yet populated) should mean "drop the
   frame forever" instead of "invalidate and let it refetch." That exact gate
   shape (`if (!qc.getQueryData(key)) return;`) is still present today in 4
   places (§9, §10, finding P1-3), each a fresh opportunity for the same
   *symptom* (message doesn't appear) with a *different* root cause than
   2026-07-04's — which is exactly what makes it feel like "we keep fixing
   this" even though no single fix has regressed.

2. **No test pins any of this down (§13).** `628eb0d` and `2f8b406` each
   shipped with no accompanying test — there is still no test today that
   constructs a `QueryClient`, seeds `["messages", peerId]`, calls
   `dispatchEvent` with a `direct-message` frame, and asserts the result.
   Every later refactor that touched this file (the SSR-searchParams fix
   `8e2c33d`, the two-layer API-pattern migration `31f2c45`, the P2-backlog
   pass `8b504b9`) had zero automated signal telling it whether frame
   delivery still worked, only whatever the author happened to click-test by
   hand that day.

3. **The same rule is implemented twice, and the two copies already
   disagree** (§12). `messaging.controller.ts`'s REST `sendMessage`/
   `markMessagesRead` do full realtime fan-out; `messaging.resolver.ts`'s
   GraphQL mutations of the same name do a fraction of it. A "fix" applied to
   one surface (which is what code review naturally finds first, since it's
   what the shipped frontend calls) leaves the other surface's copy of the
   same bug in place, ready to resurface the moment anything calls it — or
   ready to make a reviewer say "didn't we already fix this?" when they find
   the GraphQL copy independently.

4. **Three-going-on-four different plumbing shapes for "handle an incoming
   frame"** (§6, §9) mean a fix written against one shape (say,
   `event-dispatch.ts`'s generic cache-patcher) has no bearing on the other
   two (`renew-dispatch.ts`'s generic renew-patcher; `ChatRoomBaseView.tsx`'s
   ad-hoc component-level `realtime.subscribe()`). A future developer fixing
   "chat room presence is stale" has to know to look in a third file with a
   fourth gating convention, because nothing unifies them.

Net effect: the *feature* ("realtime messaging") has been touched across at
least 3 separate phase cycles (Phase 9 `38fe7ff`, Phase 10 `98a27fd`/
`cd6a0f7`, Phase 13 `5342030`) plus the 3 standalone fixes above plus a
searchParams fix specifically because it broke `claimPage` on room switch
(`51df702`, message: *"fixes claimPage not firing on room switch"*) — each
pass fixed something real and verifiable, and each left the fail-closed-gate/
duplicate-implementation/no-test structure fully intact for the next symptom
to grow in.

---

## 4. Full WebSocket inventory — frontend

All under `next-js-boilerplate/src/`.

| File | Role |
|---|---|
| `lib/realtime/realtime-client.ts` | Raw transport: `WebSocket` lifecycle, auth handshake, exponential backoff, send queue, topic/claim/register replay on reconnect. The only file with real test coverage. |
| `lib/realtime/useRealtimeCoordination.ts` | Per-tab leader election via `navigator.locks`; owns the single `RealtimeClient`; relays frames to follower tabs over `BroadcastChannel`; wires `dispatchRenew` + `dispatchEvent`; contains a 3rd, inline, one-off DM handler (§3.3); owns the page-claim effect. |
| `lib/realtime/RealtimeProvider.tsx` | Thin React context around `useRealtimeCoordination`'s return value (`status`, `send`, `subscribe`, `watch`, `unwatch`, `registerServices`, `claimPage`). |
| `lib/realtime/event-dispatch.ts` | Generic cache-patcher for `direct-message` / `message-read` / `message-delivered` / `room-message`. All 4 branches share the fail-closed gate (§9, §10). |
| `lib/realtime/renew-dispatch.ts` | Generic cache-patcher/invalidator for `renew`-tagged frames: `Notifications` (Count/DmCount/Item/Read), `Messages` (Conversation), `Feed` (New/Post), `Friends` (PendingList). Only `Item` has a fail-*open* fallback (`invalidateQueries` if uncached) — the rest either unconditionally `setQueryData` (Count/DmCount, safe) or unconditionally `invalidateQueries` (Read, Feed, Friends). |
| `lib/realtime/resync.ts` | On `onAuthenticated` (fresh connect or reconnect): invalidates `conversations`, `notifications.list/count/dm-count`, plus one claim-specific query (`feed`, `posts.:id`, `messages.:peer`, or `room.:room`) depending on the currently-claimed page. |
| `lib/realtime/route-mapping.ts` | `pathname + searchParams → {page, params}` claim (`routeToPageClaim`). Drives what `claimPage()` sends. |
| `lib/realtime/tab-coordinator.ts` | `BroadcastChannel` open helper + the `Cmd` union (`frame` / `st` / `cmd`) tabs use to talk to the leader. |
| `lib/realtime/token-cache.ts` | Dedupes/caches the WS auth-token fetch for 30s; `bustTokenCache()` clears it after an auth failure so retry re-fetches fresh tokens. |
| `lib/realtime/useConversations.ts`, `useConversation.ts`, `useRoom.ts`, `useNotifications.ts` | Thin `useQuery`/`useInfiniteQuery` wrappers — the actual React-visible consumers of the caches the dispatchers patch. |
| `hooks/useConnectionState.ts` | `RealtimeStatus → "online"/"connecting"/"unstable"` with a 3s grace window before showing "unstable" on a `backoff`. |
| `hooks/usePresence.ts` | `online-users` / `user-online` / `user-offline` frames → `Set<userId>`. |
| `views/messages/ChatView.tsx`, `FreePageView.tsx`, `MessagesSidebar.tsx` | DM UI. Only ever reads via `useConversation`/`useConversations`; never calls `realtime.subscribe` directly — fully dependent on `event-dispatch.ts`/`renew-dispatch.ts` staying correct. `Basic/Medium/PremiumPageView.tsx` are plain aliases of `FreePageView` (already deduplicated — unlike chat-room, see below). |
| `views/chat-room/ChatRoomBaseView.tsx` | Room UI. Reads via `useRoom`, **but also calls `realtime.subscribe()` directly** for `room-counts`/`user-joined`/`user-left` (lines 301-328) — the one place in the app that bypasses the generic dispatch pattern entirely, its own 4th consumption shape. `Free/Basic/Medium/PremiumPageView.tsx` are thin prop-passing wrappers around this shared base (correctly deduplicated, per the Phase-12 tier-view refactor). |
| `views/notification/FreePageView.tsx` | Notification UI. Calls `useNotifications()` only — **no realtime wiring of its own at all.** It works only because `renew-dispatch.ts` keeps `["notifications","list"]` fresh globally, a dependency invisible from this file. `Basic/Medium/PremiumPageView.tsx` are plain aliases. |
| `api/client/messages/actions.ts` | `sendMessage`/`markRead`: REST POST via `apiFetch`, then `invalidateQueries` — no optimistic update. |
| `api/client/notifications/actions.ts` | `markRead`/`markAllRead`: REST POST, then `invalidateQueries(["notifications"])` — no optimistic update. |
| `api/client/messages/query.ts`, `api/client/notifications/query.ts` | `queryOptions` defining query keys + `staleTime`/`refetchInterval` per key (§11, finding P2-2). |

## 5. Full WebSocket inventory — backend

All under `nest-js-boilerplate/src/`.

| File | Role |
|---|---|
| `realtime/realtime.gateway.ts` | The WS server itself: connection accept + per-IP pending-connection limit (`MAX_PENDING_PER_IP=50`) + 30s ping/pong heartbeat with `terminate()` on missed pong + 15s auth timeout + 3-factor auth handshake (JWT verify, HMAC user-token, HMAC rbac-token, all checked against a Redis-backed session hash) + frame router (`register`/`watch`/`unwatch`/`page` handled inline, everything else dispatched to `registerHandler`-registered handlers) + emit primitives (`emitToUser`/`emitToService`/`emitToTopic`/`emitToPage`/`broadcastAll`/`broadcastToRoom`, **all** relayed cross-instance via a single Redis pub/sub channel `ws:broadcast`) + per-user socket cap (`MAX_SOCKETS_PER_USER=20`, evicts oldest) + tier-change push + session-revoke close. |
| `realtime/realtime-page.manager.ts` | Page-claim registry (`PAGE_ALLOWLIST`) + topic-watch registry. Pure in-process `Map`s, no Redis involvement (page claims are inherently per-socket, so this is correct for a single connection — the bug is what "per-socket" means once one socket serves N tabs, §8). **Zero test coverage.** |
| `realtime/realtime-presence.service.ts` | Per-device Redis hash (`presence:<userId>` → `{deviceHash: {page, params, at}}`), 120s TTL, refreshed every 4th heartbeat tick (~2 min cadence). Write-only from what was read in this pass — nothing in the reviewed code reads it back for anything user-facing (worth a follow-up grep if this is meant to power something). |
| `realtime/realtime.types.ts`, `realtime/frames.ts` | `AuthWs` socket-state shape; documented (but drifted, §11 finding P3) frame unions. Not actually used as a type constraint anywhere `onFrame`/handlers are wired (all typed `Record<string, unknown>`), so `frames.ts` is documentation, not a compile-time contract. |
| `realtime/realtime.module.ts` | DI wiring only. |
| `messaging/messaging-ws.gateway.ts` | Registers `direct-message` / `delivered-ack` / `join-room` / `leave-room` / `room-message` / `get-room-counts` handlers, plus `chat-room` page-claim join/leave callbacks (VIP-tier-gated). **Test coverage is 5 tests, 100% of them VIP-tier-gating in `handleJoinRoom` — `handleDirectMessage`/`handleDeliveredAck`/`handleRoomMessage` have none.** |
| `messaging/messaging.service.ts` | Thin delegator to `MessagingDmService`/`MessagingRoomService`/`MessagingFriendService`. |
| `messaging/messaging-dm.service.ts` | DB reads/writes for conversations/messages; 30s cache-aside on `getConversations`; `sendMessage` (persists, invalidates the cache-aside key for both parties); `deliverDirectMessage` (the actual fan-out: `emitToService` Conversation-renew + DmCount, `emitToPage` `direct-message` to both recipient and sender, push-notification fallback gated on `hasServiceConnection`). **No dedicated spec file.** |
| `messaging/messaging-room.service.ts` | In-process `Map<room, Map<socketId, RoomMember>>` for membership/counts; `Redis sadd/srem` fire-and-forget on join/leave that **nothing ever reads back** (§10, finding P0-1). Message persistence (`saveRoomMessage`/`getRoomMessages`) is plain Prisma, correctly durable. **No dedicated spec file.** |
| `messaging/messaging-friend.service.ts` | Friend graph reads/writes. Emits **no** realtime frames itself — all friend-request realtime fan-out (`emitToPage 'friend-request'`) lives in `messaging.controller.ts` instead, one more instance of business logic and its realtime side-effect living in different layers than the analogous DM logic (whose fan-out lives inside `MessagingDmService`, not the controller). |
| `messaging/messaging.controller.ts` | REST surface. **The complete implementation** of send/markRead fan-out (§12). |
| `messaging/messaging.resolver.ts` | GraphQL surface. **The incomplete implementation** of the same two operations (§12, findings P0-2 and P2-3). |
| `notification/notification.service.ts` | `create`/`markRead`/`markAllRead`. `create` emits `renew Notifications Item` immediately, then `renew Notifications Count` once the async count resolves, then a push-notification fallback gated on `hasServiceConnection(userId, 'NOTIFICATION')`. Reasonably well unit-tested (`notification.service.spec.ts`, 8 tests) — the one realtime-adjacent backend file with real coverage. |
| `notification/notification-queue.service.ts`, `notification.processor.ts` | BullMQ producer/consumer for `FRIEND_POST` jobs (3 retries, exponential backoff). Processor calls `NotificationService.create` per recipient, then separately `emitToTopic('feed', {renew:'Feed', type:'New'})` — a 3rd distinct fan-out primitive (topic-based) alongside `emitToPage`/`emitToService`, out of this doc's 3-feature scope but worth noting as a 4th shape in the same family. |

---

## 6. Architecture walkthrough — one connection's life, end to end

1. **Mount.** `RealtimeProvider` (mounted once, app-wide) calls
   `useRealtimeCoordination()`. If `navigator.locks` exists, it races for the
   exclusive lock `"rt-leader"`; the tab that wins is the only one that opens
   a real `WebSocket` — every other tab talks to the leader over a shared
   `BroadcastChannel` (`tab-coordinator.ts`).
2. **Connect + auth.** `RealtimeClient.connect()` opens the socket; on
   `onopen` it fetches 4 tokens (`cachedFetchTokens`, 30s TTL) and sends
   `{type:"auth", tokens}`. The backend (`realtime.gateway.ts:handleAuth`)
   checks the JWT, then two HMAC tokens (user-token, rbac-token) against a
   value derived from a Redis-backed session hash — 3 independent checks all
   have to line up with the *current* session state (so a tier change or a
   forced logout invalidates the socket immediately on next reconnect, by
   design).
3. **Post-auth handshake.** Backend sends `{type:"authenticated"}`. Client
   flushes its queued `send()` calls, replays `watch`/`register` (§7 finding
   P2-1: this double-sends `register`), replays the last `claimPage`, and
   fires `onAuthenticated` → `resyncAfterConnect` (`resync.ts`), which
   invalidates `conversations`/`notifications.*` plus whatever the current
   page claim implies.
4. **Ongoing frames.** Every inbound frame passes through
   `useRealtimeCoordination.ts`'s `process()`: `dispatchRenew` → `dispatchEvent`
   (with an inline `sendFrame` callback that lets `dispatchEvent` ack a
   `delivered-ack` back to the server) → the inline 3rd DM handler → any
   component-level `subscribe()` callbacks for that frame type. Every leader
   frame is also rebroadcast over `BroadcastChannel` so follower tabs' own
   `process()` runs identically.
5. **Sending.** `send()` either goes straight out (`status === "open"`) or
   queues. `claimPage()`/`watch()`/`registerServices()` all update local
   state *and* send a frame — but only the **leader**'s single connection
   carries a `page`/`watchedTopics`/`registeredServices` server-side; non-
   leader tabs' calls are relayed through the `BroadcastChannel` (§8).
6. **Server-side fan-out.** Backend handlers call one of `emitToUser` /
   `emitToService` / `emitToPage` / `emitToTopic` / `broadcastAll` /
   `broadcastToRoom` — all 6 relay over Redis pub/sub (`ws:broadcast`) so a
   horizontally-scaled deployment still reaches the right socket regardless
   of which replica it's connected to (`realtime.gateway.ts:515-650`). Room
   *membership* (not room *messages*) is the one exception — see finding P0-1.
7. **Disconnect/reconnect.** `onclose` → `handleDisconnect`: up to 3
   exponential-backoff retries (busting the token cache on the first auth-
   related failure), then a "down" state with a 60s timer + `window
   "online"` listener as a floor. Reconnect replays claim/watch/register and
   re-runs `resyncAfterConnect`.

---

## 7. Findings — transport & connection layer

### [P2] Duplicate `register` frame sent on every successful (re)connect

**Where:** `realtime-client.ts:134-137` (`registerServices`, called once at
construction with `["MESSAGE","NOTIFICATION"]`, queues the frame since the
socket isn't open yet) and `realtime-client.ts:164-171`
(`replaySubscriptions`, called from the `authenticated` handler,
unconditionally re-sends `{type:"register", services: this.
registeredServices}}` using the same array `registerServices` already set).

**What's wrong:** the initial `registerServices()` call's frame is flushed by
`flushQueue()` moments before `replaySubscriptions()` sends functionally the
same frame again. The backend dedupes safely (`handleRegister`,
`realtime.gateway.ts:453-473`, skips services already in `ws.
registeredServices`), so this is not a correctness bug — it's one extra WS
message on every connect, and a small, concrete example of the kind of
drift-by-addition that accumulates in this subsystem.

**How to fix:** in `replaySubscriptions`, only re-send `register` if this is
actually a *reconnect* (i.e. skip it the very first time, since the initial
call already queued/sent it) — track with a `hasConnectedBefore` boolean, or
simply don't call `registerServices()` a second time from the constructor
path and instead let `replaySubscriptions` be the only sender, called once
right after the first `authenticated` too.

### [P3] `frames.ts`'s documented event shapes don't match the wire

**Where:** `realtime/frames.ts:39-45` (backend) documents `message-read` as
`{ readerId, senderId, readAt }` and `message-delivered` as `{ userId,
messageId, deliveredAt }`. Actual producers: `messaging.controller.ts:204-
218` sends `message-read` with a `peerId` field alongside `readerId`/
`senderId`/`readAt` (matching the type) via `emitToPage`, but *also* sends an
almost-identical frame via `emitToService` with the same fields; the delivered-
ack path (`messaging-ws.gateway.ts:105-116`) sends `message-delivered` with
`peerId`, not `userId`.

**What's wrong:** this isn't a runtime bug — nothing casts an inbound frame
through the `Frame`/`EventFrame` type, so a mismatch here doesn't fail
anything. It **is** a trust problem: `frames.ts` reads like a source of
truth but doesn't constrain producers or consumers, so nobody reviewing a
future change to this event's shape gets a compile error when they break it. This is exactly the kind of "types exist but nothing enforces them" issue
`project-enhance-5` flagged elsewhere in the frontend's exception-code map.

**How to fix:** either (a) delete `frames.ts` if it's not going to be load-
bearing, so nobody mistakes it for a contract, or (b) actually thread `Frame`
through `RealtimeGateway`'s `FrameHandler` type and the frontend's `onFrame`/
`dispatchEvent`/`dispatchRenew` signatures, fixing the `peerId`/`userId`
mismatch as part of turning it on. (b) is the one that would have caught the
2026-07-04 incidents faster, since a shape change to an event frame would
become a compile error in every consumer at once instead of a silent runtime
drop.

---

## 8. Findings — multi-tab & page-claim system

### [P1] Single shared connection + single page claim = last-focused-tab-wins

**Where:** `realtime-page.manager.ts:11-18` — `PAGE_ALLOWLIST.messages =
{ allowed: ['peer'], key: [] }`. Because `key` is empty, `buildPageKey`
(`realtime-page.manager.ts:196-206`) collapses every `messages` claim —
regardless of which peer's `?user=` param is attached — to the literal
string `"messages"`. `handlePage` (`realtime-page.manager.ts:98-159`) stores
exactly one `ws.page` per socket, unconditionally overwriting whatever the
previous claim was. On the frontend, `useRealtimeCoordination.ts:237-252`
re-sends a claim on every `pathname`/`searchParams` change, and when this
tab isn't the WS leader, that claim is relayed over `BroadcastChannel` to
whichever tab *is* holding the one real connection
(`useRealtimeCoordination.ts:151-181`, the `case "cmd"` /
`m.act === "claim"` branch calling `client.claimPage(...)`).

**What's wrong:** a user's *entire browser* — every tab together — shares
exactly one `AuthWs` server-side (the leader's), and that single connection
can only have one `page` claimed at a time. If tab A has `/messages` open
and tab B has `/feed` (or `/notification`, or `/chat-room`, or a post detail)
mounted and its own page-claim effect fires — which happens on *every*
route/searchParams change, including ones that don't look user-visible, e.g.
a background tab regaining focus and re-running effects, or Next.js
re-rendering with new `searchParams` — tab B's claim silently **overwrites**
tab A's. From that moment, `emitToPage(recipientId, 'messages', {type:
'direct-message', ...})` (`messaging-dm.service.ts:221-228`) finds `ws.page
!== 'messages'`, matches 0 sockets, and the frame is gone — tab A, still
visibly showing the messages page to the user, stops receiving DM pushes
with no visible error state (its `connectionState` still reads `"online"`,
since the *connection* is fine — only its page claim was stolen).

This is not a rare edge case for anyone testing across 2 browser tabs (a
completely normal way to use a chat app — messages in one tab, everything
else in another), and it would present as exactly the reported symptom:
"messages don't arrive" that seems to come and go depending on what else is
open, which matches "we fix it and it comes back" better than almost any
other finding in this doc.

**How to fix**, in order of effort:
1. **Cheapest — tag claims with a tab id and make `AuthWs.page` a
   collection.** Change `pageParams`/`page` on `AuthWs`
   (`realtime.types.ts:17-18`) to a `Map<tabId, {page, params}>`; `handlePage`
   adds/updates by `tabId` instead of overwriting a scalar;
   `RealtimePageManager.emitToPage` fans out to the connection if **any** of
   its claims match `pageKey`, instead of checking a single field. The
   frontend already has a natural per-tab identity available (the
   `BroadcastChannel` relay already distinguishes leader vs. follower and
   could mint a `crypto.randomUUID()` per tab on mount to pass through
   `claimPage`).
2. **Simpler mental model, more sockets — stop sharing one connection for
   page-scoped delivery.** Let each tab hold its own `WebSocket` (the
   `MAX_SOCKETS_PER_USER = 20` cap in `realtime.gateway.ts:28` already budgets
   for multiple simultaneous connections per user); keep the
   `BroadcastChannel`/leader-election machinery only for de-duplicating
   `register`/service-level frames if that's ever found to matter, not for
   page claims. This removes an entire class of "which tab wins" bugs at the
   cost of more WS connections (well within the existing 20-per-user limit
   for realistic tab counts).
3. **Verification either way:** add the test §13 calls out — 2 simulated
   claims for different pages against one `RealtimePageManager`, asserting
   both original pages' claimed sockets still receive `emitToPage` traffic
   for their own page.

---

## 9. Findings — direct messages (DM)

### [P1] Silent-drop-if-uncached gate on every DM-related frame

**Where:** `event-dispatch.ts:19` (`direct-message`), `:39` (`message-read`),
`:59` (`message-delivered`) — all three read `if (!qc.getQueryData(["messages",
peerId])) return;` before doing anything else.

**What's wrong:** this is the exact gate shape `2f8b406` touched (it changed
what happens *inside* the gate, not the gate's existence) and the exact class
of "why doesn't this update" that `628eb0d` chased from a different angle
(the gate's *condition* being permanently false due to a stale closure).
Today the closure bug is fixed, but the gate itself still fails closed:
if the receiving tab has never opened that specific peer's conversation
this session, `["messages", peerId]` was never queried, so `getQueryData`
returns `undefined`, and the frame — the actual message body — is dropped
with no recovery path. This is *intentional* for a peer whose chat truly
isn't open (you don't want to eagerly warm every possible conversation's
cache), but it means the **only** thing keeping a not-currently-open
conversation "live" is the entirely separate `renew Messages/Conversation`
frame (`renew-dispatch.ts:33-63`, fed by `messaging-dm.service.ts:201-215`'s
`emitToService` call) updating the sidebar preview — a different file, a
different condition, and (per §3) a different developer's fix touching one
without the other is exactly how this class of bug survives review.

**How to fix:** make this gate match `renew-dispatch.ts`'s own `Notifications
Item` handling one section above it in the same conceptual family
(`renew-dispatch.ts:14-27`): instead of `return;`, call
`qc.invalidateQueries({queryKey: ["messages", peerId]})` when uncached. This
costs nothing when the conversation truly isn't open (React Query's default
`refetchType: "active"` skips inactive queries), and correctly self-heals the
in-flight-fetch race described next.

### [P2] Query-population race during the initial fetch

**Where:** `event-dispatch.ts:19` combined with `query.ts:36-51`
(`conversationMessagesQueryOptions`, `enabled: !!peerId`).

**What's wrong:** React Query registers a query the instant a component
mounts with `enabled: true`, but `getQueryData` only returns non-`undefined`
once the **first fetch resolves**. Opening a conversation and receiving a
message from that same peer in the split-second before the initial GET
settles means the gate above reads `undefined` (query is mounted but has no
data yet) and drops the frame — with nothing re-checking after the fetch
lands. The window is narrow but real, and gets wider under load or slow
network — exactly when "instant" matters most.

**How to fix:** the `invalidateQueries` fallback proposed above closes this
too (an invalidate on an in-flight query is a no-op that lets the in-flight
fetch's own response — which by then already includes the new message, since
it was persisted before the frame was emitted — be authoritative). No
separate fix needed once P1 above is fixed.

### [P1] Zero optimistic send; DM send is 2 serial round-trips

**Where:** `api/client/messages/actions.ts:6-12`.

```ts
const sendMessage = async (recipientId: string, text: string) => {
  const { sendMessageServer } = await import("@/api/server/messages/send-message");
  await sendMessageServer(recipientId, text);              // round-trip 1: POST
  await queryClient.invalidateQueries({ queryKey: ["messages"] });     // round-trip 2: GET (refetch)
  await queryClient.invalidateQueries({ queryKey: ["conversations"] });// round-trip 3: GET (refetch)
};
```

**What's wrong:** `ChatView.tsx`'s `chatViewHandleSend` (`ChatView.tsx:27-49`)
`await`s this whole chain before clearing the input/scrolling — so the
*sender's own* message doesn't appear until a POST completes, **then** an
`invalidateQueries` triggers and awaits a fresh GET (broad-prefix-matches
*every* mounted `["messages", *]` query, not just the current peer's — a
second, separate correctness-adjacent nit: this invalidates conversations
the user isn't even looking at) before the UI updates. There is no
optimistic local insert at all. This directly matches "doesn't feel instant"
for the person actually typing, independent of anything wrong with delivery
to the *other* party.

**How to fix:** give `sendMessage` an optimistic path: before awaiting the
POST, `queryClient.setQueryData(["messages", recipientId], (old) => ...)`
appending a locally-constructed message object with a temporary id and a
`pending: true` marker (mirroring the `tempId` pattern chat-room already
half-built, §10) directly to `pages[0]`; on POST success, reconcile by
replacing the temp entry with the server's real row (matched by the
temp-id you attach to the request and get back in the response, since
`messaging.controller.ts:186-192`'s REST handler already returns the full
persisted `message`); on failure, mark it `failed` instead of removing it (so
retry is possible) rather than silently vanishing. This also removes the
need for the broad `invalidateQueries(["messages"])` — narrow it to
`["messages", recipientId]` once the optimistic path exists, since the
conversations-list update already comes from the independent `renew`
mechanism.

### [P1] Three independent code paths all react to "a DM arrived"

**Where:** `useRealtimeCoordination.ts:41-81`, the `process()` function.

Line-by-line, one incoming `direct-message` frame triggers:
1. `dispatchEvent(...)` (line 44) → `event-dispatch.ts`'s cache-splice,
   gated on `["messages", peerId]` already being cached.
2. The inline block at lines 55-77 → zeroes `["conversations"]`'s `unread`
   for this sender **and** fires a live `markMessagesReadServer(...)` REST
   call, gated on a *third*, different condition (`recipientId === self &&
   senderId && ["messages", senderId] cached`).
3. Separately (not in this function at all — a 4th path), `renew-dispatch.
   ts`'s `Messages/Conversation` case (triggered by the *different*
   `emitToService` emission `messaging-dm.service.ts:201-215` sends
   alongside the same logical event) updates the sidebar's `lastMessage`/
   `lastTime`/`unread` from scratch.

**What's wrong:** this is the clearest illustration of §3's core claim.
These three(-plus-one) blocks were added at different times, by different
commits (`737ee77` added #2 specifically; #1 and the `renew` path are
older), live in two different files, and share no common gating helper —
each re-derives "is this message for a conversation the user has open"
slightly differently. A future change to, say, what counts as "the
conversation is open" (e.g., adding a route where the peer id comes from
somewhere other than `["messages", peerId]`'s existence) has to be applied
in 3 places to stay consistent, and nothing will flag it if one is missed.

**How to fix:** consolidate to one handler. Concretely: delete the inline
block at `useRealtimeCoordination.ts:55-77` and move its "mark read because
I'm actively looking at this conversation" responsibility into
`event-dispatch.ts`'s `direct-message` case, right next to (not instead of)
the cache-splice it already does — same gate, same file, one condition
computed once. `renew-dispatch.ts`'s `Conversation` handling can stay
separate (it genuinely is a different frame, driven by a different backend
emit, for a different concern — the sidebar preview vs. the open thread) but
should get a one-line comment cross-referencing `event-dispatch.ts` so a
future reader finds both halves.

---

## 10. Findings — chat rooms

### [P0] Room membership/counts are process-local; the Redis mirror is
### write-only

**Where:** `messaging-room.service.ts:26` (`private rooms = new Map<string,
Map<string, RoomMember>>()`), `:37-42` (`joinRoom`, `void this.redis?.sadd(...)`
— fire-and-forget, return value discarded), `:44-52` (`leaveRoom`, same for
`srem`), `:67-76` (`getRoomCounts`/`getRoomMembers`, **both read only from
`this.rooms`**, never from Redis).

**What's wrong:** every other cross-cutting piece of state in this subsystem
(`emitToUser`/`emitToService`/`emitToPage`/`broadcastAll`/`broadcastToRoom` in
`realtime.gateway.ts`) is explicitly relayed over Redis pub/sub so a multi-
replica deployment stays consistent. Room *membership* was clearly meant to
follow the same pattern — the `sadd`/`srem` calls exist for no other
reason — but the read side was never wired up, so today those Redis writes
are dead weight and room membership/counts are **entirely local to whichever
replica each user's socket landed on**. With exactly one `app` container
running (confirmed via `docker ps` in this dev environment), this is
invisible today; the instant this app runs with `--profile` scaling or a
second replica in any environment, two users in "general" connected to
different replicas will see **different** online-member lists and different
room counts for the same room, with no error, no log, nothing — because
`getRoomCounts`/`getRoomMembers` simply reflects "who connected to my
process," not "who's actually in this room." `broadcastToRoom` (the chat
*text* itself) is unaffected — that's correctly relayed — so this bug is
specifically "who does the sidebar say is here," not "do messages arrive,"
but it's the same family of silent replica-inconsistency this doc keeps
finding.

**How to fix:** either (a) make `getRoomCounts`/`getRoomMembers` read from
Redis (`smembers`/`scard` on the same keys `joinRoom`/`leaveRoom` already
write) and store enough member detail in Redis to reconstruct `RoomMember`
(currently only `socketId` is written — you'd need a Redis hash keyed by
socketId storing `{userId, name}` alongside the Set), or (b) if this app is
deliberately never going to run multi-replica, delete the dead `redis?.sadd`/
`srem` calls and document the single-instance assumption explicitly next to
`private rooms = new Map(...)` so nobody "fixes" the apparent inconsistency
by trusting the Redis side without also wiring the read.

### [P1] `tempId` optimistic-send plumbing is half-built and dead

**Where:** `ChatRoomBaseView.tsx:235-252` (`chatRoomHandleSend` generates
`` `temp-${nowMs()}` `` and sends it as `tempId` in the `room-message` frame,
with no local state mutation before or after); `messaging-ws.gateway.ts:179-
207` (`handleRoomMessage` persists, then attaches `payload.tempId =
data.tempId` if present before `broadcastToRoom`); `event-dispatch.ts:77-91`
(the `room-message` consumer **never reads `frame.tempId`** — it dedupes
purely by the real server-assigned `msg.id`).

**What's wrong:** a `tempId` is generated client-side, sent to the server,
round-tripped through persistence, attached to the broadcast payload, and
then thrown away by the only code that ever receives that payload back. This
is a fully wired pipe with nothing connected on either end of the part that
would matter (no optimistic local insert to reconcile *against*). The
practical effect: chat-room messages, including your own, only ever appear
after send → persist → broadcast → generic cache-patch → re-render — the
full round trip, every time, same as DM (finding above) but for rooms.
Whoever built this intended an optimistic instant-append and didn't finish
wiring the client side — worth stating plainly since it's a good, concrete
example of the "half-finished implementation" pattern this project's own
conventions warn against.

**How to fix:** either finish it — on send, `setQueryData(["room", room],
(old) => [...old, {id: tempId, senderId: self.id, body: text, createdAt:
now, pending: true}])` immediately, then in `event-dispatch.ts`'s
`room-message` branch, when the incoming `frame.tempId` matches a pending
local entry (compare against a small `Map<tempId, true>` of ids you sent),
**replace** that entry with the real one instead of appending a second — or
remove `tempId` from the wire protocol entirely if optimistic rendering
isn't planned soon, so a future reader doesn't spend time (as this audit
did) tracing a pipe that goes nowhere.

### [P2] Silent-drop-if-uncached gate applies here too, and fires more often

**Where:** `event-dispatch.ts:81-82` (`const existing =
qc.getQueryData(["room", room]); if (!existing) return;`).

**What's wrong:** same shape as the DM finding above, but the trigger
("switch to a room whose query hasn't resolved yet") is far more common
here than "open a DM thread for the first time," since switching rooms is
the primary interaction on this page (`selectChatRoom`,
`ChatRoomBaseView.tsx:254-267`, changes the `room` state — and therefore the
`["room", newRoom]` query key — on every sidebar click). A message posted by
someone else in the 1-2 room-switches-per-minute window while that fetch is
in flight is silently and permanently dropped from that viewer's session
until another message nudges the cache or they leave and return.

**How to fix:** same as the DM finding — `invalidateQueries` instead of
`return` when uncached.

---

## 11. Findings — notifications & presence

### [P2] Notification list has no polling backstop; the 2 count queries do

**Where:** `api/client/notifications/query.ts:22-46`.
`notificationsQueryOptions()` (the actual list, `["notifications","list"]`)
has `staleTime: 30_000` and nothing else. `unreadCountQueryOptions()`/
`dmUnreadCountQueryOptions()` both add `refetchInterval: 60_000` on top of
the same `staleTime`.

**What's wrong:** if a `renew Notifications Item` frame is ever dropped
(disconnect mid-emit, the tab not being the WS leader and a `BroadcastChannel`
message getting lost, etc.), the two **count** badges will silently correct
themselves within 60s even with zero further WS activity — but the **list**
itself (what actually renders on `/notification`) has no such floor and will
show a stale list indefinitely, until something else (navigation away and
back past the 30s `staleTime`, or a window refocus if `refetchOnWindowFocus`
is on) forces a refetch. This is the same "some queries self-heal, most
don't" inconsistency as the messages/conversations/room queries (§9, §10),
just less severe here since `renew-dispatch.ts`'s `Item` case (unlike the
DM/room equivalents) already fails *open* (falls back to `invalidateQueries`
when uncached, `renew-dispatch.ts:15-16`) rather than silently dropping.

**How to fix:** add the same `refetchInterval: 60_000` to
`notificationsQueryOptions()` that the two count queries already have —
cheapest possible fix, consistent with the existing pattern, no architecture
change needed.

### [P3] Notification page has zero realtime wiring visible in its own file

**Where:** `views/notification/FreePageView.tsx` — imports `useNotifications`
only; no `useRealtime`, no `.subscribe(...)`, no comment indicating this page
depends on anything beyond a plain `useQuery`.

**What's wrong:** not a bug — the page genuinely does update live, because
`renew-dispatch.ts` patches `["notifications","list"]` globally regardless of
which page is mounted. But this is a discoverability trap of exactly the
kind that makes debugging "notifications don't update" take longer than it
should: a developer reading this file has no signal that realtime delivery
is even part of the picture, so when something in the chain breaks, the
natural first place to look (this file) shows nothing wrong, and the actual
fault (`renew-dispatch.ts`, `useRealtimeCoordination.ts`, or the page-claim
system if `emitToService`'s `NOTIFICATION` registration were ever
mistakenly made page-scoped) is 2-3 files away with no link between them.

**How to fix:** not urgent enough for a code change on its own, but cheap to
improve alongside any of the other fixes in this doc — a one-line comment
at the top of `NotificationPageContent` noting "this list is kept live by
`lib/realtime/renew-dispatch.ts`'s `Notifications/Item` case; nothing in
this file subscribes directly" would have saved real time during this audit
and will save time in the next one.

---

## 12. Findings — backend fan-out drift (REST vs GraphQL)

### [P0] GraphQL `sendMessage` never calls `deliverDirectMessage`

**Where:** `messaging.resolver.ts:42-48`:

```ts
@Mutation(() => Message)
async sendMessage(@CurrentUser() user: JwtUser, @Args('input') input: SendMessageInput) {
  return this.ms.sendMessage(user.userId, input.recipientId, input.text);
}
```

versus `messaging.controller.ts:178-193`, the REST equivalent, which does
`const message = await this.ms.sendMessage(...); await this.ms.
deliverDirectMessage(message); return message;`.

**What's wrong:** `MessagingService.sendMessage` only persists the message
and busts the 30s conversations cache (`messaging-dm.service.ts:141-179`) —
it does **not** notify anyone. `deliverDirectMessage`
(`messaging-dm.service.ts:181-250`) is what actually calls `emitToService`
(conversation-renew, DM-count), `emitToPage` (the live `direct-message`
frame to both parties), and the push-notification fallback. The GraphQL
mutation calls only the former. **Confirmed not currently reachable from the
shipped frontend** — `sendMessageServer` (`api/server/messages/send-
message.ts`) uses `apiFetch` against the REST route, not GraphQL — so this
is not today's live bug. It is, however: (a) a real, authenticated (only by
`SessionAuthGuard`, same guard as the working REST path — nothing stops a
valid session from calling it directly against `/graphql`), reachable
endpoint that silently fails to deliver; and (b) concrete proof that this
codebase's "same business rule, two implementations" pattern isn't
hypothetical — it already produced a divergence, just in a place that
happens not to be exercised yet.

**How to fix:** extract the persist-then-deliver sequence into one method
(e.g. `MessagingService.sendAndDeliverMessage(...)`) that both the
controller and the resolver call, so there is exactly one place "send a
message" is implemented and both transports use it. Add a regression test
that calls the GraphQL mutation and asserts `deliverDirectMessage`'s
side-effects (or the `RealtimeGateway.emitToPage`/`emitToService` calls) fire,
mirroring whatever test (if any) covers the REST path today — per §13,
currently neither path has one.

### [P2] GraphQL `markMessagesRead` fan-out is a fraction of the REST version

**Where:** `messaging.resolver.ts:50-69` — after `this.ms.markRead(...)`,
does exactly 2 `emitToUser` calls with a bare `{type:'message-read', readerId,
senderId, readAt}}`. `messaging.controller.ts:195-241` — after the same
`markRead` call, does: `emitToPage('messages', message-read)`,
`emitToService('MESSAGE', message-read)` (for tick updates on other tabs/
devices), `emitToService('MESSAGE', renew Conversation, unread:0)` (so the
reader's own sidebar zeroes out immediately), and `emitToService
('NOTIFICATION', renew DmCount)` (so the bell badge drops). The GraphQL path
does none of the last three.

**What's wrong:** same drift pattern as the P0 above, smaller blast radius
(read receipts, not message delivery) but the same root cause and the same
fix.

**How to fix:** same as above — extract a shared
`markConversationRead(readerId, peerId)` helper on `MessagingService` (or a
dedicated notification-fan-out helper both transports call) that performs
the full 4-frame fan-out, and have both the controller and the resolver call
it instead of hand-rolling their own subset.

---

## 13. Test-coverage gap map

| File | Existing tests | What's covered | What's NOT covered |
|---|---|---|---|
| `realtime-client.ts` | `realtime-client.test.ts`, 29 `it` blocks | Connection lifecycle, send queue, auth-failure/backoff, topic allowlist, claim/register replay, disconnect, degraded retry | Nothing about frame *consumption* — this file doesn't do any, so that's correctly out of its scope |
| `event-dispatch.ts` | **none** | — | The exact logic behind both 2026-07-04 incidents: cache-splice correctness, the fail-closed gate, dedup-by-id |
| `renew-dispatch.ts` | **none** | — | Conversation-list splice/sort, Notifications Item's fail-open fallback, all 5 `renew` sub-cases |
| `useRealtimeCoordination.ts` | **none** | — | The inline 3rd DM handler, the page-claim effect, leader/follower relay logic, `resyncAfterConnect` wiring |
| `resync.ts` / `route-mapping.ts` | **none** | — | Claim-to-query-key mapping; easy to unit test as pure functions, currently untested |
| `realtime-page.manager.ts` | **none** | — | `buildPageKey`, `handlePage` overwrite behavior (finding §8), `emitToPage` matching |
| `realtime.gateway.ts` | `realtime.gateway.spec.ts`, 13 tests | Emit primitives in isolation (`emitToUser`/`emitToService`/`hasServiceConnection`/`closeSocketsForSession`/`updateUserTier`/`getOnlineUserIds`/`registerHandler`) | `handleAuth` (3-factor handshake), `handleMessage` routing, Redis pub/sub relay, heartbeat/reconnect, per-IP/per-user limits |
| `messaging-ws.gateway.ts` | `messaging-ws.gateway.spec.ts`, 5 tests | 100% VIP-tier gating in `handleJoinRoom` | `handleDirectMessage`, `handleDeliveredAck`, `handleRoomMessage`, `handleClaimJoinRoom`/`handleClaimLeaveRoom` |
| `messaging-dm.service.ts` | **none** | — | `sendMessage` (friend-check, self-message guard), `deliverDirectMessage`'s full fan-out, `getConversations`'s cache-aside + raw-SQL latest-message logic |
| `messaging-room.service.ts` | **none** | — | Join/leave, the dead Redis mirror (§10), room-message persistence |
| `notification.service.ts` | `notification.service.spec.ts`, 8 tests | `create`/`findByUser`/`unreadCount`/`markRead`/`markAllRead` — genuinely solid | Nothing missing that's in this doc's scope |
| GraphQL `messaging.resolver.ts` | **none** | — | Both findings in §12 would have been caught immediately by a test asserting realtime side-effects fire |

**Reading this table straight:** the backend file with the best test coverage
in this entire audit (`notification.service.ts`) is also the one file this
audit found **no live bugs in**. That's not a coincidence worth ignoring.

---

## 14. Enhancement proposals

### [Enhancement] Unify frame-consumption into one registry

Collapse `event-dispatch.ts`'s cache-patcher, `renew-dispatch.ts`'s
cache-patcher, `useRealtimeCoordination.ts`'s inline 3rd handler, and
`ChatRoomBaseView.tsx`'s ad-hoc `realtime.subscribe()` calls into a single
`Map<frameType, handler[]>` that both the generic cache-patchers and
component-level listeners register into via the same `subscribe()` API that
already exists on the `RealtimeContext`. One dispatch point means one place
to add logging, one place to write tests against, and no more "which of the
3 files handles this frame" question for the next bug.

### [Enhancement] Fail open, not closed, on cache misses

Change the 4 `if (!qc.getQueryData(key)) return;` gates (`event-dispatch.
ts:19,39,59,82`) to `qc.invalidateQueries({queryKey: key})`, matching the
pattern `renew-dispatch.ts`'s `Notifications/Item` case already uses. This
single change closes findings P1-3(DM), P2(room), and the query-population
race, all at once, with no architectural change — it's the smallest, highest-
leverage fix in this entire doc.

### [Enhancement] Add a resilience backstop to the queries that only trust push

Cheapest version: give `conversationsQueryOptions()`, `notificationsQueryOptions()`
the same `refetchInterval: 60_000` the two count queries already have.
Better version, if frame loss turns out to matter more than expected once
telemetry exists: attach a monotonically increasing per-user sequence number
to `renew`/event frames server-side, store "last seen seq" per query key
client-side, and treat a gap as a signal to invalidate rather than trust
delivery blindly — this also gives you a concrete, measurable "how often do
we actually drop frames" number instead of the current "we think this
happens" state.

### [Enhancement] Redesign the page-claim system for real multi-tab support

Implement option 1 or 2 from §8's fix — tab-tagged claims or per-tab
connections. This is the single highest-value structural fix in this doc
for the originally-reported symptom, since it's the one finding that
explains an intermittent, "sometimes it just doesn't show up" pattern rather
than a narrow race window.

### [Enhancement] Finish (or remove) chat-room's optimistic-send half-feature

Either complete the `tempId` reconciliation (§10) so chat-room messages
render instantly for the sender, or delete the dead plumbing. Either is
better than the current half-state, and finishing it would also establish
the pattern DM-send's own optimistic fix (§9) should follow, making the two
features consistent instead of each inventing its own answer.

### [Enhancement] Make chat-room membership replica-safe

Read `getRoomCounts`/`getRoomMembers` from Redis (or remove the dead writes
and document single-instance as an explicit constraint) — see §10's full
fix. Low urgency today (single replica), but cheap to fix now versus
debugging a replica-inconsistent production incident later with no
history of why the Redis calls were ever added.

### [Enhancement] One implementation per business rule, REST and GraphQL both call it

Extract `sendAndDeliverMessage`/`markConversationRead` helpers per §12 so
send/markRead realtime fan-out exists in exactly one place. This is the
fix that would prevent the *next* instance of "we fixed this before" from a
different angle than the frontend-focused fixes above — the backend has the
same disease.

### [Enhancement] Backfill tests on the frame-consumption + page-claim layers specifically

Not "add more tests generically" — per §13, target exactly the 3 frontend
files and 3 backend files with zero coverage that are also where this
doc's P0/P1 findings live. These are pure-function-friendly: `dispatchEvent`/
`dispatchRenew` take a `QueryClient` + a frame object and mutate the cache —
no live WebSocket needed to test them, just `new QueryClient()`, seed some
`setQueryData`, call the dispatcher, assert. `realtime-page.manager.ts`'s
`buildPageKey`/`handlePage` are pure enough to test without a real `ws`
object (a minimal mock satisfying `AuthWs`'s shape is enough, as
`realtime.gateway.spec.ts` already demonstrates for the gateway itself).

### [Enhancement] Give `frames.ts` real, load-bearing types

Thread `Frame`/`EventFrame`/`RenewFrame` through `FrameHandler`,
`RealtimeClient`'s `onFrame`, and `dispatchEvent`/`dispatchRenew`'s
parameters, fixing the `peerId`/`userId` drift (§7, P3) as part of turning
it on. This turns "producer and consumer silently disagree on a frame's
shape" from a runtime mystery into a compile error — directly the failure
mode `2f8b406` was fixing (an old shape written to a cache nothing read),
just one layer further out.

### [Enhancement] Trim the small stuff while touching these files

Dedupe the double `register` frame (§7, P2); fetch room counts once instead
of per room-switch (§10, P3, `ChatRoomBaseView.tsx:296-306`'s
`realtime.send({type:"get-room-counts"})` in a `[realtime, room]`-keyed
effect — move it to a `[realtime]`-only effect that runs once). Neither
matters on its own; both are free once you're already in these files for
the higher-priority fixes.

---

## 15. Suggested implementation order

1. **Fail-open gates** (§14 #2) — smallest diff, closes 3 findings at once,
   zero architectural risk. Do this first.
2. **Backend fan-out unification** (§12, §14 #7) — extract the shared
   send/markRead helpers; add the regression test that would have caught
   both drifts. Independent of everything else, safe to parallelize with #1.
3. **Test backfill on the now-touched files** (§13, §14 #8) — write these
   *while* doing #1/#2, not after, so the fixes ship with the regression
   test that would have caught their own bug class.
4. **Page-claim redesign** (§8, §14 #4) — the highest-value structural fix
   for the reported symptom, but the largest diff (touches `AuthWs`'s shape
   and both `handlePage`/`emitToPage`). Do after #1-3 are stable so there's
   a safety net in place before touching the trickiest file.
5. **Optimistic send** (§9, §10, §14 #5) — DM first (simpler, no existing
   half-built plumbing to reconcile with), then finish or remove chat-room's
   `tempId` path using the same pattern.
6. **Resilience backstop / sequence numbers** (§14 #3) and **replica-safe
   room membership** (§10, §14 #6) — lower urgency (single-replica today),
   good follow-up once the above are shipped and the "how often do we
   actually drop a frame" question has a real number behind it from #3's
   telemetry.
7. **Hygiene pass** (§14 #9, #10) — frame types, duplicate register frame,
   room-counts fetch — fold into whichever of the above PRs happens to touch
   the same file.

---

## 16. Top 10

1. Fail-open the 4 silent-drop gates in `event-dispatch.ts` (§9, §10, §14 #2)
   — highest leverage, smallest diff.
2. Redesign page-claim for real multi-tab support (§8) — best explanation
   for an intermittent "sometimes it just doesn't show up."
3. Unify GraphQL/REST send + markRead into one implementation each (§12).
4. Add optimistic send to DM (§9) and finish-or-remove chat-room's dead
   `tempId` path (§10).
5. Backfill tests on `event-dispatch.ts`, `useRealtimeCoordination.ts`,
   `realtime-page.manager.ts` (§13) — the exact files with 0 coverage and
   this doc's worst findings.
6. Make chat-room membership replica-safe or explicitly document single-
   instance-only (§10, P0).
7. Consolidate the 3-going-on-4 independent "a DM arrived" handlers into one
   (§9).
8. Give `conversationsQueryOptions`/`notificationsQueryOptions` the same
   polling backstop the count queries already have (§11).
9. Thread `frames.ts`'s types through as a real compile-time contract and
   fix the `peerId`/`userId` drift it would surface (§7).
10. Dedupe the double `register` frame and single-shot chat-room's
    `get-room-counts` fetch (§7, §10) — cheap, do while touching those files
    for the above.

---

## 17. Control run — commit `ac55fb7` vs. this audit

**2026-07-20.** Berkay reported all 7 phases complete and asked for a check.
Method: 3 parallel static-review passes (frontend transport/multi-tab/DM,
backend fan-out/room-membership, test-backfill/hygiene) plus direct
`tsc --noEmit`/`eslint`/`jest`/`vitest` runs on both apps, cross-checking
every claim against `git show ac55fb7 -- <file>` and the current file state,
not the commit message. **Findings only — nothing was fixed.**

**Overall verdict: NOT gate-clean.** Phases 1, 2 (production code), 5b, 6a,
and 7 are solid. Phase 4 — the doc's own highest-priority structural fix —
does not work. Test suites are green (351/361 backend — 10 pre-existing
failures unrelated to this commit, see below; 306/306 frontend) and no
build is broken, but that's a low bar this doc has always cleared; the
point of a control run is the gap between "tests pass" and "the reported
symptom is actually fixed."

### 🔴 A. [P0 — regression] Multi-tab page-claim fix is dead code in practice

**Where:** `next-js-boilerplate/src/lib/realtime/useRealtimeCoordination.ts:25-26`:
```ts
const tabIdRef = useRef<string>("");
if (tabIdRef.current == null) tabIdRef.current = crypto.randomUUID();
```
`useRef<string>("")` initializes `.current` to `""`, not `null`/`undefined`.
`"" == null` is `false` in JS (loose-equality-null only matches
`null`/`undefined`), so this guard **never fires**. `crypto.randomUUID()`
is unreachable — `tabIdRef.current` stays the literal empty string for the
lifetime of every tab, in every session.

**What's wrong:** everything downstream of this line was built correctly —
`AuthWs.tabClaims: Map<string,{page,params}>` (`realtime.types.ts:19-22`),
`handlePage`/`cleanupPageClaim` keyed by `tabId` instead of overwriting a
scalar (`realtime-page.manager.ts:98-175`), `emitToPage` scanning by
key-prefix (`:217-235`), `RealtimeClient.claimPage(page,params,tabId)`
(`realtime-client.ts:135-147`) — but since every tab threads the same
constant `""` through all of it, `ws.tabClaims` never holds more than one
live entry per socket. **This is the exact bug §8 describes, unchanged in
practice**, just hidden one layer deeper inside a Map that in practice only
ever has one key. Given §8/§16 rated this fix "the best explanation for an
intermittent 'sometimes it just doesn't show up' pattern" — Berkay's
original reported symptom — there is no evidence that symptom is actually
resolved by this commit.

**Why the new test didn't catch it:** `realtime-page.manager.spec.ts:117-142`
("allows different tabIds to claim different pages simultaneously") passes
2 hardcoded, already-distinct tab ids directly into `handlePage`, bypassing
the frontend's (broken) id-generation entirely. It correctly proves the
backend Map logic works; it proves nothing about whether the frontend ever
produces more than one id. `useRealtimeCoordination.ts` itself — the file
with the actual bug, and the file this commit modified by 64 lines to
implement Phase 4's frontend half — has **zero test coverage**.

**How to fix:** `tabIdRef.current ||= crypto.randomUUID()` (or check
`=== ""` instead of `== null`), then add a test that actually exercises
`useRealtimeCoordination` (or at minimum a unit test on whatever the tab-id
minting gets extracted into) proving two mounts produce two different ids.

### 🔴 B. [P0 — unrelated regression] `COOKIE_SAMESITE` default silently reverted

**Where:** `next-js-boilerplate/src/lib/env.ts:19`. This commit changes
`COOKIE_SAMESITE: z.enum(["lax","strict","none"]).default("lax")` back to
the same enum **without** `.default("lax")` — reverting commit `2b59ab5`
("COOKIE_SAMESITE default lax (not a secret, safe fallback)"), landed the
same day only ~2h18m earlier. Confirmed via `git show` on both commits.

**What's wrong:** this file isn't named anywhere in this audit or in the
commit's own 7-phase description — it's an incidental, unflagged behavior
change riding along in a commit whose message claims pure WS-audit scope.
Every tracked env file (`next-js-boilerplate/.env.example`, `.env.local`,
`.vault-envs/frontend.env`, `k8s/configmap.yaml`) happens to set this var
explicitly today, so nothing currently breaks — but that's incidental, not
by design, and it silently re-introduces the exact fragility `2b59ab5` was
written to close (a deployment omitting this var now hard-crashes server
startup instead of defaulting safely).

**How to fix:** restore `.default("lax")`; if there's a real reason to make
it required now, that belongs in its own commit with its own rationale, not
an unflagged drive-by inside an unrelated feature commit.

### ⚠ C. [P1 — contradicts own Phase-3 claim] Test backfill skipped exactly the file that broke

Despite "Phase 3 — 68 new tests," these files named in §13 as 0-coverage
remain at 0 coverage after this commit:
- **`useRealtimeCoordination.ts`** — modified 64 lines *by this very commit*
  to implement finding A's frontend half, still zero tests. This is the
  same "write tests alongside the fix, not after" anti-pattern §14/§15
  warned about, inside the commit that claims to have followed that advice.
- **`messaging-ws.gateway.ts`**'s `handleDirectMessage`/`handleDeliveredAck`/
  `handleRoomMessage` — untouched by this commit, still only the 5
  VIP-tier-gating tests §13 originally described.
- **`resync.ts`/`route-mapping.ts`** — no test files exist anywhere in the repo.
- **`messaging-room.service.ts`** — got a doc-only change (finding H below)
  but still no spec file.

Also: the commit message's "68 new tests" is overstated — actual count by
`it(`/`test(` block is **61** (event-dispatch.test.ts 17, renew-dispatch.test.ts
12, realtime-page.manager.spec.ts 25, messaging.resolver.spec.ts 2,
messaging-dm.service.spec.ts 4, realtime-client.test.ts +1).

### ⚠ D. [P1 — shallow regression test] GraphQL resolver test doesn't assert the thing it needs to

**Where:** `messaging.resolver.spec.ts` (56 lines, new). Mocks
`MessagingService` entirely; only asserts the resolver calls
`sendAndDeliverMessage`/`markConversationRead` with the right args. It would
**not** catch a regression back to §12's original P0 (GraphQL silently not
delivering) if `sendAndDeliverMessage` itself ever stopped calling
`deliverDirectMessage` — that assertion lives one layer down, in
`messaging-dm.service.spec.ts`, which tests `MessagingDmService` directly
and never goes through the resolver. `messaging.service.ts` (the actual
glue both controller and resolver call) has **no dedicated spec file at
all** — the one link in the chain with zero direct coverage.

**The production fix itself is real, though** — traced end to end:
`messaging.controller.ts:186` and `messaging.resolver.ts:43-47` both now
call the same `MessagingService.sendAndDeliverMessage`
(`messaging.service.ts:81-85`) → `MessagingDmService.sendAndDeliverMessage`
(`messaging-dm.service.ts:264-280`) → persists, then `deliverDirectMessage`.
`markConversationRead` similarly unifies all 4 REST-side frames
(`messaging-dm.service.ts:282-322`) behind one shared method, confirmed
byte-for-byte against the pre-commit REST behavior. §12's P0 and P2 are
genuinely fixed in production code — just not provably regression-tested
at the layer that would matter.

One structural gap the unification didn't reach: `messaging-ws.gateway.ts:83-88`
(`handleDirectMessage`, the WS frame handler) still hand-rolls
`sendMessage` + `deliverDirectMessage` inline instead of calling the new
shared method — not broken (it was already correct), but a **third**
copy of the same sequence now exists, undermining "exactly one
implementation."

### ⚠ E. [P1 — real race, untested] DM optimistic send can transiently duplicate

**Where:** `next-js-boilerplate/src/api/client/messages/actions.ts`. The
mechanics are genuinely right: optimistic insert before the POST is awaited
(`:11-33`), reconciliation replaces (not duplicates) the temp row by id
match on success (`:64-77`), failure marks `{failed:true}` instead of
removing (`:40-61`), and the old broad `invalidateQueries(["messages"])`
was removed outright rather than just narrowed.

**What's wrong:** `messaging-dm.service.ts:225-228` echoes the sent DM back
to the **sender's own** page-claimed socket (pre-existing behavior,
unrelated to this commit). `event-dispatch.ts`'s `direct-message` branch has
no `tempId` awareness (unlike its own `room-message` branch, which does
this correctly — finding below). If that self-echo frame arrives before
`actions.ts`'s own POST-response reconciliation runs — plausible, not a
rare corner case — the real message gets appended as a second row while
the temp row is still present, then reconciliation later produces a second
copy. No test file exists for `actions.ts` at all. Separately: `pending`/
`failed` markers are set but `ChatView.tsx` never reads them — a failed
send renders identically to a successful one today, with no retry action.

**How to fix:** give the `direct-message` branch the same `tempId`-tracking
`event-dispatch.ts`'s `room-message` branch already has (see next finding),
and wire `pending`/`failed` into `ChatView.tsx`'s render.

### ✅ F. [Pass] Chat-room `tempId` reconciliation — finished correctly

`ChatRoomBaseView.tsx:249-272` inserts a pending row and tracks the tempId;
`event-dispatch.ts:104-128`'s `room-message` branch reads `frame.tempId`
back and **replaces** (not appends) the matching pending row; backed by a
real test (`event-dispatch.test.ts:283-304`). One narrow, doc-acknowledged-
elsewhere race: if the cache gets invalidated/refetched in the split second
between optimistic insert and broadcast echo, `.map()` no-ops and the
incoming message is silently dropped rather than shown — same risk class
§9 P2 already accepts, not a new failure mode.

### ✅ G. [Pass] Fail-open gates and 3-handler consolidation

All 4 `event-dispatch.ts` gates (`direct-message`, `message-read`,
`message-delivered`, `room-message`) now `invalidateQueries` with the
correctly-scoped key instead of silently returning, each with a real test
asserting the exact queryKey. The inline 3rd DM handler
(`useRealtimeCoordination.ts:55-77` pre-commit) is fully removed and its
logic correctly moved into `event-dispatch.ts`'s `direct-message` case,
preserving the original 3-condition gate. Both exactly as prescribed.

### ⚠ H. [P2 — scope choice, confirm it's deliberate] Room membership: documented, not fixed

**Where:** `messaging-room.service.ts:26-32`. The +7 line diff is a JSDoc
comment above `private rooms = new Map(...)` explaining the in-memory-only,
not-replica-safe nature — accurate on the core point, though it says "read
back from SISMEMBER/SMEMBERS" where the audit's own fix specified
`smembers`/`scard` (SISMEMBER is the wrong primitive for a count/list). The
dead `redis?.sadd`/`srem` fire-and-forget writes were **left in place, not
removed**, and `getRoomCounts`/`getRoomMembers` still read only the
in-process `Map`. This is a valid choice per §10's own two options, but the
service is now "explained," not "replica-safe" — worth confirming this was
the deliberate call rather than an assumption.

### ✅ I. [Pass] Phase 7 hygiene — mostly clean

Register-frame dedupe (`realtime-client.ts`'s `hasConnectedBefore` flag),
`frames.ts` deletion (confirmed zero remaining imports repo-wide), chat-room
room-counts fetched once per `[realtime]`-only effect, and the notification
discoverability comment on `FreePageView.tsx` are all correctly implemented
per §7/§10/§11's prescribed fixes. One miss: the reciprocal cross-reference
comment was supposed to land on `renew-dispatch.ts`'s `Notifications/Item`
case; the actual +3 lines instead cross-reference `event-dispatch.ts` from
the unrelated `Messages/Conversation` case (a legitimate but different
Phase-7 cross-ref) — the `Notifications/Item` case still has no comment
pointing back to `FreePageView.tsx`.

### Latent gaps worth knowing about (not blocking, not yet manifesting)

- Once finding A is fixed, `emitToPage`'s per-key fanout
  (`realtime-page.manager.ts:217-235`) sends once per matching *key*, not
  per matching *connection* — two tabs genuinely on the same page (e.g.
  both on `/messages`, the audit's own example) would double-deliver to the
  one shared leader socket, since `PAGE_ALLOWLIST.messages` still has
  `key: []`. Worth fixing in the same pass as finding A.
- No follower-tab unclaim on individual tab close — only leader teardown
  clears claims (`useRealtimeCoordination.ts:172,189,227`); a minor leak,
  not a delivery bug.
- 2 new lint **errors** (not warnings) from this commit's own new test
  files: `messaging-dm.service.spec.ts:123` (`no-unsafe-assignment`),
  `realtime-page.manager.spec.ts:198` (`unbound-method`) — `pnpm lint`
  currently exits 1 partly because of this. `messaging.resolver.spec.ts`'s
  mock `user` objects also fail strict `tsc --noEmit` (missing `role`/`tier`
  on `JwtUser`) — harmless under this project's ts-jest config today, but
  confirms the gates weren't run clean before declaring the work done.
- Temp-id minting format is duplicated (`event-dispatch.ts`/`actions.ts` vs
  `ChatRoomBaseView.tsx` use different formats, no shared helper) — small,
  but it's the same "same rule implemented twice" pattern §12 is about.
- ~10 files under `nest-js-boilerplate/src/{auth,cookies-ssr,csrf,
  interceptors,redis,sse,throttle}` plus `pnpm-lock.yaml` are touched by
  this commit but never mentioned anywhere in this doc; verified line-by-
  line as pure prettier reflow (no logic change) or, for the lockfile,
  mechanical catch-up to a manifest change already committed 2 commits
  earlier (`9ceb284`). Benign, but should have been a separate `chore:`
  commit for a cleaner history.

### Pre-existing, unrelated to this commit (confirmed, not counted above)

`pnpm test` on `nest-js-boilerplate`: 351/361 pass. The 10 failures are in
`token-store.service.spec.ts` (`pipe.set is not a function`) and
`billing.service.spec.ts` (undefined payment provider mock) — neither file
was touched by `ac55fb7`, and `token-store.service.ts`'s own one-line diff
in this commit is a pure formatting no-op unrelated to the failing method.
`next-js-boilerplate`: `tsc --noEmit` and `eslint` both clean; full test run
306/306 pass. Root `pnpm format:check` fails on a missing
`prettier-plugin-tailwindcss` package — looks like a local environment gap,
not something this commit caused.

**Next session should:** fix finding A first (it's a one-line guard fix
plus the double-delivery follow-on in the "latent gaps" note above) — that's
the one thing standing between this commit and actually resolving Berkay's
original complaint. B is also a one-line restore. D/E/H are real but
narrower. Add the regression test for A alongside the fix, targeting
`useRealtimeCoordination.ts` itself, not just the backend manager.
