# Realtime — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/realtime/`](../../../../nest-js-boilerplate/src/realtime/)

This module's "interface" is a WebSocket protocol plus a set of emit primitives other backend
modules call directly (in-process, not over the wire) — not a REST/GraphQL surface. Both are
documented here.

## WebSocket Events — client-facing control frames

**Kind:** WS Event (client→server) unless noted · Connect: `wss://<host>/ws` (auth at upgrade — see
[README.md § Auth](./README.md#auth--ws-upgrade-not-a-first-message-protocol)).

### `register`

`{ type: "register", services: ["MESSAGE" | "NOTIFICATION" | "CHAT", ...] }` — subscribes this
socket to service-scoped chrome pushes (unread badges, bell counts). Unknown service names are
silently ignored. **Response:** `{ type: "registered", services: [...] }`.
**Source:** `realtime.gateway.ts` `handleRegister`.

### `watch` / `unwatch`

`{ type: "watch"|"unwatch", topic: string }` — subscribes/unsubscribes this socket to a topic
(`"feed"`, `"post:{id}"`) for `emitToTopic` pushes. Invalid topics return
`{ type: "error", exc: "EX_VALIDATION_FORM", msg, key: "error.ws" }`.
**Source:** `realtime-page.manager.ts` `handleWatch`/`handleUnwatch`.

### `page`

`{ type: "page", page: string | null, params?: Record<string,string> }` — declares which page this
socket's owner is currently viewing, so content pushes (`emitToPage`) reach the right socket and
nothing else. Sent on every client-side route change and replayed on reconnect. `page: null` clears
routing (chrome/service pushes keep flowing regardless).

**Server-side allowlist** (`realtime-page.manager.ts`):

| Page | Required params | Internal routing translation |
|---|---|---|
| `messages` | — | none — DMs are pushed per-user via `emitToPage`, not topic-based |
| `friend-request` | — | none — pending-list renews use `emitToService` |
| `notification` | — | none — counted via `emitToService` |
| `feed` | — | `topicWatchers.add("feed")` |
| `post` | `id` | `topicWatchers.add("post:{id}")` |
| `chat-room` | `room` | [`messaging`](../messaging/README.md)'s `handleClaimJoinRoom`/`handleClaimLeaveRoom` via `registerPageCallbacks` |

Invalid page name or missing/extra params → `{ type: "error", exc: "EX_VALIDATION_FORM", ... }`. A
successful claim also syncs presence to Redis (see below).
**Source:** `realtime-page.manager.ts` `handlePage`.

### Feature-registered handlers

Any other frame `type` is dispatched to a handler registered via `registerHandler(type, fn)` — see
[messaging/endpoints.md § WebSocket Events](../messaging/endpoints.md#websocket-events) for the
concrete set currently registered (`direct-message`, `room-message`, `typing-start`, …). Registering
the same `type` twice throws at startup (`registerHandler` guards against silent handler overwrite).

## Redis presence

Each successful `page` claim is mirrored to `HSET presence:{userId} {sha256(deviceToken)}
{"page","params","at"}`, `EXPIRE 120`, refreshed every ~2min by the heartbeat, `HDEL`'d on socket
close. `HGETALL presence:{userId}` answers "which page is each of this user's devices on, and
since when" — used for cross-instance presence queries, not exposed as a direct client-facing query.

## Server-side emit API (consumed by other backend modules, in-process)

These are `RealtimeGateway` methods other modules call to push data — not wire frames a client sends,
but the shape of what a client *receives* is one of these calls' `frame`/`payload` argument,
JSON-serialized as-is (or wire-encrypted, for the `*Encrypted` variants).

| Method | Scope | Redis multi-replica? | Used for |
|---|---|---|---|
| `emitToUser(userId, frame)` | every socket of a user, plaintext | Yes | Generic broadcast |
| `emitToService(userId, service, frame)` | sockets registered for that service | Yes | Chrome rewrites (badge, bell, pending-list) |
| `emitToTopic(topic, frame)` | every socket watching that topic | Yes | Feed/post content pushes |
| `emitToPage(userId, pageKey, frame)` | sockets currently claiming that page, plaintext | Yes | DM read receipts, typing indicators |
| `emitToPageEncrypted(userId, pageKey, payload)` | same as above, wire-encrypted per-connection | Yes | (available; not currently used by messaging, which uses `emitToUserEncrypted` for DM content instead) |
| `emitToUserEncrypted(userId, payload)` | every socket of a user, wire-encrypted per-connection | Yes | New DM delivery, message-deleted frames |
| `emitToRoomEncrypted(room, payload)` | every socket in a room, wire-encrypted per-connection | Yes | New room-message delivery |
| `broadcastAll(frame)` | every connected socket on every replica | Yes | Global online/offline presence, room-count refresh |
| `broadcastToRoom(room, frame)` | every socket joined to a room, plaintext | Yes | user-joined/user-left |
| `hasServiceConnection(userId, service)` | (query, not emit) | No (local only) | Push-notification gating — see below |

**Push-notification gating rule**: Web Push is sent only when the user has **no** live
`NOTIFICATION`-service socket (`!hasServiceConnection(userId, 'NOTIFICATION')`) — with a live socket,
in-app delivery is always available, so a push would just be a duplicate.

## Server → client frame families

Two families flow over the same socket; the client never mixes them in state.

**Renew frames** (`{ renew: "...", type: "..." }`) — server-initiated cache invalidation, no payload
beyond what's needed to know *what* to refetch/patch:

| renew | type | Typical client action |
|---|---|---|
| `Messages` | `Conversation` | Upsert into the conversations list |
| `Notifications` | `Count` / `Item` / `Read` | Update badge / prepend item / invalidate list |
| `Feed` | `New` / `Post` | Show "new posts" flag / refetch a specific post |
| `Friends` | `PendingList` | Refetch pending friend requests |

**Event frames** (`{ type: "..." }`) — full payloads for page content, e.g. `direct-message`,
`message-read`, `message-delivered`, `room-message`, `user-joined`, `user-online`. See
[messaging/endpoints.md](../messaging/endpoints.md#websocket-events) for the messaging-specific set.

Clients **ignore unknown `renew`/`type` values** by design — new frame types can ship server-side
without breaking older connected clients.

## Reconnect / resync (client-side contract, for reference)

On reconnect: replay the last `page` claim, then invalidate `conversations`, `notifications` (list +
count), and whatever the current page's own content key is. On an auth-failure close: refresh
cookies via the BFF, refetch, reconnect — capped at 3 attempts before parking in a `down` state. This
logic lives client-side (frontend `realtime-client.ts` / mobile equivalent), not in this backend
module — documented fully in [frontend/v1/messages/hooks.md](../../../frontend/v1/messages/hooks.md).
