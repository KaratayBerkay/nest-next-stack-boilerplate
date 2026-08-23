# Messaging — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/messaging/`](../../../../nest-js-boilerplate/src/messaging/)

## REST

Base path: `/api` (see `@Controller('api')` in
[`messaging.controller.ts`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts)).
**Auth:** `SessionAuthGuard` on the whole controller — see
[identity-access/auth](../../identity-access/auth/README.md). Every handler below reads the caller
from `@CurrentUser()`; a 401 (guard rejection) applies to all of them and isn't repeated per entry.

### Get total unread DM count

**Kind:** REST · **`GET /api/messages/unread-count`**
**Source:** [`messaging.controller.ts#L46-L51`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts)
**Response:** `{ count: number }` — sum of unread across every DM peer.
**Used by:** Frontend [messages](../../../frontend/v1/messages/page.md) (unread badge); Mobile
[messages](../../../mobile/v1/messages/screen.md).

### List friends

**Kind:** REST · **`GET /api/friends`** · query `q?` (search string)
**Source:** [`messaging.controller.ts#L55-L84`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts)
**Response:** `{ id, email, name, avatar, online }[]` — accepted friends only. `online` is computed
per-request from [`realtime`](../realtime/README.md)'s in-memory `getOnlineUserIds()`, not stored.
**Note:** despite the path, this is implemented in `MessagingController` via `MessagingFriendService`
— see the module README's cross-module note.
**Used by:** Frontend [friends](../../../frontend/v1/friends/page.md) ·
[find-friends](../../../frontend/v1/find-friends/page.md) (both via the same reused
`friendsQueryOptions()`, see [frontend/v1/friends/api.md](../../../frontend/v1/friends/api.md)),
messages sidebar; Mobile [friends](../../../mobile/v1/friends/screen.md) ·
[users/list](../../../mobile/v1/users/list/screen.md) (both via the reused `friendsListProvider`, see
[mobile/v1/friends/api.md](../../../mobile/v1/friends/api.md)).

### List pending friend requests

**Kind:** REST · **`GET /api/friends/requests`**
**Source:** [`messaging.controller.ts#L86-L90`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts)
**Response:** merged incoming+outgoing pending requests, deduped by peer user id (incoming wins),
each `{ id, direction: 'incoming'|'outgoing', user: {...}, createdAt }`.
**Used by:** Frontend [find-friends](../../../frontend/v1/find-friends/page.md) (both tabs — the
pending count badges the "Pending requests" tab even when the "Add friends" tab is active); Mobile
[find-friends/requests](../../../mobile/v1/find-friends/requests/screen.md) and find-friends' Premium
tier ([mobile/v1/find-friends/screen.md](../../../mobile/v1/find-friends/screen.md#premium-tier)) — ⚠
see [MOB-007](../../../issues.md#mob-007): Flutter's `FriendRequest.fromJson` reads field names
(`fromUserId`/`fromUserName`/`fromUserAvatar`) that don't exist anywhere in this response (the real
shape nests per-user fields under `user`, and this endpoint's `direction` field isn't read by the
Dart model at all) — the parse throws for every non-empty result, so this endpoint is effectively
unconsumed successfully on mobile today despite being called correctly.

### Send / accept / decline a friend request

**Kind:** REST · **`POST /api/friends/request/:userId`** · **`POST /api/friends/accept/:userId`** ·
**`POST /api/friends/decline/:userId`**
**Source:** [`messaging.controller.ts#L92-L149`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts),
logic in [`messaging-friend.service.ts`](../../../../nest-js-boilerplate/src/messaging/messaging-friend.service.ts)
**Request:** no body — the path param is the other party's user id (addressee for `request`,
requester for `accept`/`decline`).
**Behavior:** `request` re-activates a previously-declined pending row instead of erroring, and
silently accepts if the target already sent a request to *you* (mutual-request auto-accept).
`accept` also flips a matching reverse pending row to `ACCEPTED` if one exists. All three create a
`FRIEND_REQUEST`-type notification for the other party (fire-and-forget, logged not thrown on
failure) — see notification/README.md (Phase 3).
**Errors:** `403 EX_FORBIDDEN` (self-friending, or requesting while blocked) · `403
EX_CONFLICT_DUPLICATE` (already friends, or already requested) · `404` (accept/decline: no matching
pending request).
**Realtime side-effect:** every one of the three emits `emitToService(<other party>, 'MESSAGE',
{renew:'Friends', type:'PendingList'})` to **both** parties — deliberately `emitToService` (chrome,
regardless of current page) rather than `emitToPage`, per the inline comment: a user sitting on
`/messages` still needs their pending-list badge to update even though `/messages` isn't the
`friend-request` page.
**Used by:** Frontend [find-friends](../../../frontend/v1/find-friends/page.md) (send/accept/decline,
all three) · [friends](../../../frontend/v1/friends/api.md) (re-exports the same hook, unused by that
page itself); Mobile [find-friends](../../../mobile/v1/find-friends/screen.md) (all three, plus its
[widgets](../../../mobile/v1/find-friends/README.md#widgets)) ·
[users/detail](../../../mobile/v1/users/detail/screen.md) ("Add Friend" button — ⚠ see
[MOB-003](../../../issues.md#mob-003): this caller always sends its own user id as the target, so
`request` always hits the `403 EX_FORBIDDEN` self-friending case above).

### List conversations

**Kind:** REST · **`GET /api/conversations`**
**Source:** [`messaging.controller.ts#L151-L162`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts)
**Response:** one row per friend with any message history, `{ user, lastMessage, lastTime,
hasAttachments, unread, favorite }`, sorted newest-first. `lastMessage` is decrypted server-side for
preview (see the module README's encryption note) or the literal string `"[Deleted]"` for a
tombstoned latest message. Cached 30s per user (`conversations:{userId}` in
[caching](../../platform-core/README.md), Phase 5).
**Used by:** Frontend [messages](../../../frontend/v1/messages/page.md) sidebar; Mobile
[messages](../../../mobile/v1/messages/screen.md).

### Get paginated conversation messages

**Kind:** REST · **`GET /api/conversations/:userId/messages`** · query `before?` (ISO cursor),
`take?` (default 30, capped 100)
**Source:** [`messaging.controller.ts#L164-L194`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts)
**Response:** `{ messages: Message[], hasMore: boolean }`, oldest-first (server queries
newest-first for cursor pagination, then reverses for display order). Requires `:userId` to
actually be a friend — returns `{messages: [], hasMore: false}` silently otherwise (not a 403).
Each message's `body` is decrypted via `decryptMessageBody` before returning.
**Used by:** Frontend [messages](../../../frontend/v1/messages/page.md) message list.

### List conversation attachments

**Kind:** REST · **`GET /api/conversations/:userId/attachments`** · query `before?`, `take?`
(default 30, capped 100), `search?` (filename, case-insensitive), `from?`, `to?` (ISO date range)
**Source:** [`messaging.controller.ts#L196-L243`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts)
**Response:** `{ attachments: [...], hasMore }` — every file ever exchanged with this peer, newest
first (a flat gallery, not a chat-scroll order). Queries `MessageAttachment` directly rather than
the upload-time `PendingUpload` table (whose `scopeId` for DMs is the uploader, not the
conversation) — explicit `select` keeps ciphertext columns off the wire.
**Used by:** Frontend [AttachmentGallerySheet](../../../frontend/v1/messages/components/attachment-gallery-sheet.md)
(also documented in [messages/api.md](../../../frontend/v1/messages/api.md)).

### Send a direct message

**Kind:** REST · **`POST /api/conversations/:userId/messages`**
**Source:** [`messaging.controller.ts#L245-L265`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts),
DTO [`send-message-rest.dto.ts`](../../../../nest-js-boilerplate/src/messaging/dto/send-message-rest.dto.ts)
**Request body** (`SendMessageRestDto`):

```jsonc
{
  "text": "hey",                    // required unless attachments or envelope present, max 5000 chars
  "_tempId": "client-uuid",         // optional, echoed back for optimistic-UI reconciliation
  "attachments": [{                 // optional
    "url": "...", "type": "application/pdf", "name": "report.pdf",
    "storageEnvelope": { "v": "...", "nonce": "...", "ct": "..." }  // optional
  }],
  "envelope": { /* transport-layer WireEnvelopeV2 fields, opaque object, ≤32KB serialized */ },
  "replyToId": "message-id"         // optional — must belong to this same conversation
}
```

**Response:** the full result of `sendAndDeliverMessage()` — `{ message, delivery }`. ⚠
[BE-003](../../../issues.md#be-003): `delivery` is an internal WS-fan-out payload shape that the
GraphQL mutation for the same action deliberately excludes — looks like an unintentional leak, not
a documented contract difference.
**Errors:** `400` (`TextOrAttachmentConstraint`: all of text/attachments/envelope empty) · `400`
(`EnvelopeSizeConstraint`: envelope serializes over 32,768 bytes) · `403` (recipient isn't a friend,
or `senderId === recipientId`) · `403` (`replyToId` doesn't belong to this conversation).
**Realtime side-effect:** pushes a plaintext `direct-message` event to every open socket of both
sender and recipient via `RealtimeGateway.emitToUserEncrypted` (per-connection wire-encrypted, all
devices, regardless of current page) — see [endpoints.md § WebSocket Events](#websocket-events).
**Used by:** Frontend [messages page](../../../frontend/v1/messages/page.md) via
[`api.md#send-a-message-bff-route`](../../../frontend/v1/messages/api.md); Mobile
[messages screen](../../../mobile/v1/messages/screen.md) (REST-via-BFF).

### Delete a message

**Kind:** REST · **`POST /api/messages/:messageId/delete-for-me`** and
**`POST /api/messages/:messageId/delete-for-everyone`**
**Source:** [`messaging.controller.ts#L267-L291`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts)
**Request:** no body, `:messageId` path param only.
**`delete-for-me`**: hides the message for the caller only — server-persisted (`MessageDeletion`
upsert), survives reload and every other device/tab of theirs, permanent, idempotent, never visible
to or affects the peer. No time window.
**`delete-for-everyone`**: sender-only, within `DELETE_FOR_EVERYONE_WINDOW_MS` (15 minutes — see
[`messaging.types.ts`](../../../../nest-js-boilerplate/src/messaging/messaging.types.ts)) of sending.
Soft-hide only: `v`/`ct`/`nonce` and attachment rows/files are left exactly as-is at rest; every read
path (`decryptMessageBody`, `getMessages`, `getConversations`) just stops surfacing the content once
`deletedAt` is set. Idempotent — a second call on an already-tombstoned message is a harmless no-op.
**Errors:** `404` (message not found, or — for delete-for-me — caller isn't sender/recipient) ·
`403` (delete-for-everyone: caller isn't the sender, or the 15-minute window has passed).
**Realtime side-effect:** `delete-for-me` sends a `message-deleted` frame (`scope:'me'`) to the
actor's own other devices only. `delete-for-everyone` sends `message-deleted` (`scope:'everyone'`)
to both parties, plus a recomputed conversation-preview renew to whichever side(s) still have
visible messages left with that peer.
**Used by:** Frontend [`ChatMessageBubble` component](../../../frontend/v1/messages/components/chat-message-bubble.md);
Mobile [`ChatMessageBubble` widget](../../../mobile/v1/messages/widgets/chat-message-bubble.md).

### Mark messages read

**Kind:** REST · **`POST /api/messages/read`**
**Source:** [`messaging.controller.ts#L293-L306`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts),
DTO [`mark-read.input.ts`](../../../../nest-js-boilerplate/src/messaging/dto/mark-read.input.ts)
**Request body:** `{ userId }` (the peer whose messages get marked read).
**Response:** `{ ok: true, readAt: ISOString }`.
**Realtime side-effect:** `message-read` event to the peer (page-scoped, `messages`) so their sent
messages show the read tick live; `Messages/Conversation` renew to the peer (chrome); a fresh
`Notifications/DmCount` renew to the reader.

### Favorite / unfavorite a conversation

**Kind:** REST · **`POST /api/messages/favorite`** and **`POST /api/messages/unfavorite`**
**Source:** [`messaging.controller.ts#L308-L330`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts),
DTO [`favorite-conversation.input.ts`](../../../../nest-js-boilerplate/src/messaging/dto/favorite-conversation.input.ts)
**Request body:** `{ peerId }`. **Response:** `{ ok: true, favorite: boolean }`.
**Behavior:** one-directional and private (only the caller's own `conversations:{userId}` cache
entry is invalidated — the peer isn't notified and can't see that they were favorited).
**Used by:** the web messages sidebar's favorites filter — see
[CROSS-001](../../../issues.md#cross-001): this action has **no Flutter caller at all**.

### List / read / write chat rooms

**Kind:** REST · **`GET /api/rooms`** · **`GET /api/rooms/:roomId/messages`** (query `before?`,
`take?`) · **`GET /api/rooms/:roomId/attachments`** (query `before?`, `take?`, `search?`, `from?`,
`to?`)
**Source:** [`messaging.controller.ts#L332-L409`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts)
**Response shapes:** mirror the DM equivalents above (`{slug}[]`; `{messages, hasMore}`;
`{attachments, hasMore}`).
**Errors:** `404` unknown room slug · `403` `vip-`-prefixed room without `MEDIUM`+ tier
(`hasRoomTierAccess` — the single shared gate used by every room join/read/write path, including the
WS side).
**Used by:** Frontend [chat-room page](../../../frontend/v1/chat-room/page.md) — the room-list entry
(`GET /api/rooms`) via [`roomsQueryOptions`](../../../frontend/v1/chat-room/components/chat-room-base-view.md),
messages sent via `POST /rooms/:roomId/messages`, and attachments via
[RoomAttachmentGallerySheet](../../../frontend/v1/chat-room/components/room-attachment-gallery-sheet.md);
Mobile [chat-room screen](../../../mobile/v1/chat-room/screen.md) — messages only
(`room_messages.dart`); ⚠ mobile calls neither the room-list nor the room-attachments entry of this
group — see [chat-room api.md (mobile)](../../../mobile/v1/chat-room/api.md).

## GraphQL

Resolver: [`messaging.resolver.ts`](../../../../nest-js-boilerplate/src/messaging/messaging.resolver.ts) ·
**Auth:** `SessionAuthGuard` on the whole resolver class.

### List discoverable users

**Kind:** GraphQL Query · **`users(search: String): [User!]!`**
**Source:** [`messaging.resolver.ts#L31-L37`](../../../../nest-js-boilerplate/src/messaging/messaging.resolver.ts)
Excludes the caller and anyone already `PENDING`/`ACCEPTED`/`BLOCKED` with them. No tier gate.
**Used by:** Frontend [find-friends](../../../frontend/v1/find-friends/page.md) — via `GET
/api/users/search`, a BFF route that wraps this query rather than exposing it directly (see
[frontend/v1/find-friends/api.md § User search](../../../frontend/v1/find-friends/api.md#user-search)).
⚠ Note: web's [users/list](../../../frontend/v1/users/list/page.md) page does **not** call this
query despite living in a `src/api/**/users/` path suggestively named the same — that page is
hardcoded demo data with zero backend calls, see [CROSS-016](../../../issues.md#cross-016). Mobile
[find-friends](../../../mobile/v1/find-friends/screen.md) ·
[users/list](../../../mobile/v1/users/list/screen.md) both genuinely call this, directly (GraphQL, no
BFF hop — see [mobile/v1/find-friends/api.md](../../../mobile/v1/find-friends/api.md)).

### List conversations (GraphQL)

**Kind:** GraphQL Query · **`conversations: [Conversation!]!`**
**Source:** [`messaging.resolver.ts#L39-L42`](../../../../nest-js-boilerplate/src/messaging/messaging.resolver.ts),
model [`conversation.model.ts`](../../../../nest-js-boilerplate/src/messaging/models/conversation.model.ts)
Same underlying `getConversations()` as the REST list-conversations endpoint above; `lastMessage`
is typed `GraphQLJSON` (can be a decrypted string or a raw object) rather than a plain string field.

### Paginated conversation messages (GraphQL)

**Kind:** GraphQL Query · **`conversationMessages(userId: String!, before: String, take: Int):
ConversationMessagesPage!`**
**Source:** [`messaging.resolver.ts#L44-L57`](../../../../nest-js-boilerplate/src/messaging/messaging.resolver.ts),
model [`conversation-messages-page.model.ts`](../../../../nest-js-boilerplate/src/messaging/models/conversation-messages-page.model.ts)
`take` is clamped to `[1, 100]` (note: REST's cap is `Math.min(take, 100)` with no floor — this
resolver additionally floors at 1).

### Send a message (GraphQL)

**Kind:** GraphQL Mutation · **`sendMessage(input: SendMessageInput!): Message!`**
**Source:** [`messaging.resolver.ts#L59-L80`](../../../../nest-js-boilerplate/src/messaging/messaging.resolver.ts),
input [`send-message.input.ts`](../../../../nest-js-boilerplate/src/messaging/dto/send-message.input.ts)
**Input:** same fields as the REST DTO (`recipientId`, `text`, `attachments`, `envelope`,
`replyToId`) minus `_tempId` (REST-only, optimistic-UI concern with no GraphQL analogue).
**Response:** **only** the `Message` row — the resolver explicitly discards `delivery` from
`sendAndDeliverMessage()`'s result (inline comment: "irrelevant to the GraphQL caller"). Contrast
with the REST entry above, which returns both — see [BE-003](../../../issues.md#be-003).
**`Message.body`** is not a plain field on the generated Prisma-backed `Message` type — it's the
`@ResolveField` documented below, since the DB never stores plaintext.
**Used by:** Mobile — [`send_message.dart`](../../../../flutter-boilerplate/lib/api/server/messages/send_message.dart),
called by `MessageActions.sendMessage` (see
[mobile/v1/messages/api.md](../../../mobile/v1/messages/api.md)) — always, mobile has no REST/WS
fallback for sending. **Not** frontend — web prefers the WebSocket, falling back to the REST route
below, never this mutation (see [frontend/v1/messages/api.md § Send a message (client)](../../../frontend/v1/messages/api.md#send-a-message-client)).
Corrected during the Phase 3 merge — the original "no caller found" note predated the mobile pilot
docs that answer this.

### Mark messages read / delete for me / delete for everyone (GraphQL)

**Kind:** GraphQL Mutation · **`markMessagesRead(userId: String!): Boolean!`** ·
**`deleteMessageForMe(messageId: String!): Boolean!`** ·
**`deleteMessageForEveryone(messageId: String!): Boolean!`**
**Source:** [`messaging.resolver.ts#L82-L107`](../../../../nest-js-boilerplate/src/messaging/messaging.resolver.ts)
Thin wrappers around the same service calls as their REST counterparts above, returning a bare
`true` instead of the REST responses' richer bodies (`{ok, readAt}` / `{id}` / `{id, deletedAt}`).

### `Message.body` (resolved field)

**Kind:** GraphQL Query (field resolver, not a top-level query) · **`Message.body: String`**
**Source:** [`messaging.resolver.ts#L109-L125`](../../../../nest-js-boilerplate/src/messaging/messaging.resolver.ts)
Decrypts from the parent `Message`'s `v`/`ct`/`nonce` columns at read time, scoped to the requesting
`@CurrentUser()` — same `decryptMessageBody` helper the REST/WS paths use, so all three surfaces
decrypt identically. The same pattern is used for `Report.summary` elsewhere in the schema.

## WebSocket Events

Gateway: [`messaging-ws.gateway.ts`](../../../../nest-js-boilerplate/src/messaging/messaging-ws.gateway.ts) —
registers frame handlers into the shared [`realtime`](../realtime/README.md) gateway via
`onModuleInit()`; does not own a `/ws` connection itself. **Auth:** inherited from the `realtime`
gateway's WS-upgrade-time cookie check (see [realtime/README.md](../realtime/README.md) and
[CROSS-005](../../../issues.md#cross-005) — this is *not* a first-message token protocol, despite
what older, now-removed docs said).

WS frames bypass the REST/GraphQL DTO pipeline entirely — no `ValidationPipe`/
`EnvelopeSizeConstraint` runs on a raw parsed WS message — so this gateway re-implements the
text-or-attachment-or-envelope check and the 32KB envelope cap **by hand**
(`hasTextOrAttachmentOrEnvelope`/`isEnvelopeTooLarge` at the top of the file) rather than reusing the
REST DTO's `class-validator` constraints. Worth checking for other REST-only validations with the
same gap when auditing this file further.

| Event | Direction | Handler | Behavior |
|---|---|---|---|
| `direct-message` | client→server | `handleDirectMessage` (`#L141`) | Same validation/persist path as REST send; echoes `_tempId` if present; delivers via `emitToUserEncrypted` to every device of both parties. |
| `delivered-ack` | client→server | `handleDeliveredAck` (`#L203`) | Only the true recipient may ack; stamps `deliveredAt`, emits `message-delivered` back to the sender (page + service scoped). |
| `join-room` / `leave-room` | client→server | `handleJoinRoom`/`handleLeaveRoom` (`#L252`, `#L286`) | Validates room + tier via `roomJoinError`; broadcasts `user-joined`/`user-left` + a `room-counts` refresh to everyone. One room at a time per socket (`leavePreviousRoom` runs first). |
| `room-message` | client→server | `handleRoomMessage` (`#L303`) | Same validation as DMs; saved via `MessagingRoomService.saveRoomMessage`; broadcast per-connection-encrypted to all room members via `emitToRoomEncrypted`. |
| `get-room-counts` | client→server | `handleGetRoomCounts` (`#L384`) | On-demand `room-counts` snapshot, no broadcast. |
| `get-room-members` | client→server | `handleGetRoomMembers` (`#L402`) | On-demand `room-members` snapshot — covers a real race: a client joining after others are already present gets no `user-joined` broadcast for the pre-existing members, so without this pull their online list would silently stay empty. |
| `typing-start` / `typing-stop` | client→server | `handleTypingStart`/`handleTypingStop` (`#L464`, `#L472`) | Forwarded to the recipient only, page-scoped (`messages`) — not persisted, not broadcast. |
| (page claim `chat-room`) | client→server (via `realtime`'s generic `page` frame, not a distinct type) | `handleClaimJoinRoom`/`handleClaimLeaveRoom` (`#L415`, `#L447`) | Registered via `realtime.registerPageCallbacks('chat-room', ...)` — navigating to the chat-room page auto-joins/leaves the room, same effect as explicit `join-room`/`leave-room`. |

**Server→client event frames emitted by this module** (beyond the direct responses above):
`direct-message` (new DM, wire-encrypted per-connection), `message-read`, `message-delivered`,
`message-deleted` (`scope: 'me' | 'everyone'`), `room-message` (new room message, broadcast to room),
`user-joined`/`user-left` (room membership), `room-counts`, `room-members`, `error`. See
[realtime/README.md § Frame families](../realtime/README.md) for the renew-frame side of chrome
updates (`Messages/Conversation`, `Notifications/DmCount`, `Friends/PendingList`) this module also
emits alongside the event frames above.
