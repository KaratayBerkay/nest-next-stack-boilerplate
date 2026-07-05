# Realtime — Normative Reference

Single source of truth for the WebSocket system (phases 6–7).  
Related: [AUTH.md](AUTH.md) (token handshake), `docs/progress/archive/phase7.md` (design + tracker).

## 1 — Transport

| Property | Value |
| --- | --- |
| Path | `/ws` |
| Library | `ws` (raw WebSocket, **not** socket.io) |
| Frame limit | 64 KiB (`maxPayload: 64 * 1024`) |
| Auth timeout | 15 s — unauthenticated socket is closed |
| Heartbeat | 30 s ping/pong; stale sockets terminated |
| Per-user socket cap | 20 |
| Per-IP pending cap | 50 |

## 2 — Auth handshake

```
Client → Server:  { type: "auth", tokens: { accessToken, rbacToken, deviceToken, userToken } }
Server → Client:  { type: "auth-ok" }  |  { type: "error", message: "..." } → close
```

Tokens are derived from session cookies via `TokenStoreService`. The `userToken` is
HMAC-derived from the `userId` and verified with timing-safe comparison.
See [AUTH.md](AUTH.md) for the full four-token flow.

After `auth-ok`, the client may send:

```
{ type: "register",  services: ["MESSAGE", "NOTIFICATION"] }
{ type: "watch",     topic: "feed" | "post:{id}" }
{ type: "unwatch",   topic: "..." }
{ type: "page",      page: "feed", params?: { ... } }
```

Plus any frame type registered via `registerHandler()` (e.g. `room-message`).

## 3 — Service registration

`handleRegister` accepts an allowlisted set:

| Service | Purpose |
| --- | --- |
| `MESSAGE` | DM conversation badge/renew |
| `NOTIFICATION` | Notification badge/bell/count |
| `CHAT` | (reserved) |

Unknown service names are silently ignored (frame type not added to the socket's
`registeredServices`). The socket receives a `registered` frame back:

```jsonc
{ type: "registered", services: ["MESSAGE", "NOTIFICATION"] }
```

### Emit routing

| Emit method | Scope | When used |
| --- | --- | --- |
| `emitToUser(userId, frame)` | All sockets for a user | Generic broadcast |
| `emitToService(userId, service, frame)` | Sockets registered for that service | Chrome rewrites (badge, bell) |
| `emitToTopic(topic, frame)` | All sockets watching that topic | Feed/post content pushes |
| `emitToPage(userId, pageKey, frame)` | Sockets claiming that specific page | DM content, room messages |
| `broadcastAll(frame)` | Every connected socket | Online/offline presence |
| `broadcastToRoom(room, frame)` | Sockets in a room | Chat room messages |

## 4 — Page-claim protocol

The provider sends a `page` frame on every route change (and replays it on
reconnect). One socket = one page at a time. `page: null` clears content routing
(global chrome keeps flowing).

```jsonc
// Examples
{ "type": "page", "page": "messages",       "params": { "peer": "<cuid>" } }
{ "type": "page", "page": "friend-request" }
{ "type": "page", "page": "notification" }
{ "type": "page", "page": "feed" }
{ "type": "page", "page": "post",           "params": { "id": "<cuid>" } }
{ "type": "page", "page": "chat-room",      "params": { "room": "general" } }
{ "type": "page", "page": null }
```

### Page allowlist (server-side)

| Page | Required params | Optional params |
| --- | --- | --- |
| `messages` | — | `peer` |
| `friend-request` | — | — |
| `notification` | — | — |
| `feed` | — | — |
| `post` | `id` | — |
| `chat-room` | `room` | — |

Invalid page names or missing/extra params return `{ type: "error", ... }`.

### Claim → internal routing translation

A page claim translates to the existing internal registries:

| Page | Translation |
| --- | --- |
| `feed` | `topicWatchers.add("feed")` |
| `post` | `topicWatchers.add("post:{id}")` |
| `chat-room` | `MessagingService.joinRoom(room)` (via registered callback) |
| `messages` | (no internal routing — DMs are pushed per-user via `emitToPage`) |
| `notification` | (no internal routing — counted via `emitToService`) |
| `friend-request` | (no internal routing — pending list renews via `emitToService`) |

## 5 — Redis presence

Each page claim is mirrored to Redis:

```
HSET presence:{userId}  {deviceTokenHash}  {"page":"feed","params":{},"at":1720000000000}
EXPIRE presence:{userId}  120
```

- **Key**: `presence:{userId}` — one hash per user, one field per device.
- **Field**: SHA-256 of the `deviceToken` (stable across midnight token rotation).
- **Value**: JSON with `page`, `params`, and `at` (epoch ms).
- **TTL**: 120 s, refreshed every ~2 min by the heartbeat.
- **Delete**: `HDEL` on socket close.
- **Read**: `HGETALL presence:{userId}` answers "which page is each device on, since when."

## 6 — Frame families

Two families flow over the same socket. The client never mixes them in state.

### 6a — Renew frames

Server-initiated cache invalidation. Always `{ renew: "..." }` top-level.

| renew | type | Cache action |
| --- | --- | --- |
| `Notifications` | `Count` | `setQueryData(["notifications", "count"], value)` |
| `Notifications` | `Item` | Prepend item to `["notifications", "list"]` |
| `Notifications` | `Read` | `invalidateQueries(["notifications"])` |
| `Messages` | `Conversation` | Upsert into `["conversations"]` |
| `Feed` | `New` | `setQueryData(["feed", "new-flag"], true)` |
| `Feed` | `Post` | `invalidateQueries(["posts", id])` |
| `Friends` | `PendingList` | `invalidateQueries(["friends", "requests"])` |

### 6b — Event frames

Full payloads for page content. Always `{ type: "..." }` top-level.

| type | Cache action | Drop guard |
| --- | --- | --- |
| `direct-message` | Upsert into `["messages", peerId]` | Drop if thread never fetched |
| `message-read` | Mark own outgoing rows `readAt` | Drop if thread never fetched |
| `message-delivered` | Mark own outgoing rows `deliveredAt` | Drop if thread never fetched |
| `room-message` | Append to `["room", room]` | Drop if room never fetched |
| `user-joined` / `user-left` | (subscribe behavior) | — |
| `user-online` / `user-offline` | (subscribe behavior) | — |

### Forward-compatibility

Clients **ignore** unknown `renew` or `type` values. New frame types can be
deployed server-side without breaking older clients.

## 7 — D3 routing table (full)

| Trigger | Frames | Route |
| --- | --- | --- |
| DM sent | `direct-message` event | `emitToPage` to sender + recipient on `messages` |
| DM sent | `Messages/Conversation` renew | `emitToService` to recipient (chrome) |
| messages read | `message-read` event | `emitToPage` to sender on `messages` |
| messages read | `Messages/Conversation` renew | `emitToService` to reader (chrome) |
| notification created | `Notifications/Item` + `Count` | `emitToService` to all NOTIFICATION sockets |
| notification created | Web Push | Sent only if **no** NOTIFICATION socket is live |
| notification read (all) | `Notifications/Count` + `Read` | `emitToService` to all NOTIFICATION sockets |
| friend request sent | `Notifications/Item` | `emitToService` (chrome) |
| friend request sent | `Friends/PendingList` renew | `emitToService` to `friend-request` claimers |
| post created | `Feed/New` renew | `emitToTopic("feed")` |
| post updated | `Feed/Post {id}` renew | `emitToTopic("feed")` + `emitToTopic("post:{id}")` |
| comment added | `Feed/Post {id}` renew | `emitToTopic("feed")` + `emitToTopic("post:{id}")` |
| room message | `room-message` event | `broadcastToRoom(room)` |

## 8 — Client transport (Web Locks)

One tab per origin holds a Web Lock (`navigator.locks.request("rt-leader")`).
That tab is the **leader** — it owns the WebSocket connection.

- **Leader** connects, authenticates, registers services, sends page claims.
- **Follower** tabs receive frames via `BroadcastChannel` and forward commands
  (`send`, `watch`, `claim`, etc.) to the leader via the same channel.
- **Fallback**: when `navigator.locks` is unavailable, each tab runs a standalone
  socket (correct but less efficient).
- Tab close / crash releases the lock atomically — the browser hands it to the
  next waiter with zero race conditions.

## 9 — Reconnect / replay / resync

On reconnect (or `authenticated` event):

1. **Replay** the current page claim (`claimPage(page, params)`).
2. **Resync** cached data:
   - `invalidateQueries(["conversations"])`
   - `invalidateQueries(["notifications", "list"])`
   - `invalidateQueries(["notifications", "count"])`
   - Current page content key (e.g. `["messages", peerId]`, `["posts", id]`)

On **auth-failure** close (code 4401 or similar):

1. Bust the token cache (`bustTokenCache()`).
2. `POST /api/auth/refresh` to rotate cookies.
3. Fetch fresh tokens and reconnect.
4. Max 3 attempts, then park in `down` state.

## 10 — Push-gating rule

Web Push is sent **only** when the user has **no** live `NOTIFICATION` socket:

```
if (!realtime.hasServiceConnection(userId, 'NOTIFICATION')) {
  push.sendToUser(userId, title, body, ...);
}
```

With D3/D4 live, this is correct end-to-end: in-app consumer is always available
when a NOTIFICATION socket exists, so suppressing Web Push in that case avoids
duplicate delivery.

## 11 — Hardening summary

| Concern | Mitigation |
| --- | --- |
| Oversized frames | `maxPayload: 64 KiB` on WSS |
| Rogue service names | Allowlist: `MESSAGE`, `NOTIFICATION`, `CHAT` |
| Invalid page claims | Allowlist with required params validation |
| Redis key spam | Presence TTL 120 s, refreshed every ~2 min |
| Socket exhaustion | Per-user cap (20), per-IP pending cap (50) |
| Token replay | Four-token HMAC + timing-safe comparison + Redis session store |
