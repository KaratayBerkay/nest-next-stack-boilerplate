# Messages — API

Page: [page.md](./page.md) · Client: [`src/api/client/messages/`](../../../../next-js-boilerplate/src/api/client/messages/) ·
Server (BFF): [`src/api/server/messages/`](../../../../next-js-boilerplate/src/api/server/messages/)

**Three layers, not two.** Each file below (`src/api/server/messages/*.ts`) is a client-executed
(`apiFetch`/`apiFetchJson`, [`src/lib/api-client.ts`](../../../../next-js-boilerplate/src/lib/api-client.ts),
`"use client"`) typed wrapper that fetches a **same-origin** path on this Next.js app itself — it
does not call the backend directly, despite living in a folder named `server`. That same-origin path
is served by a matching Next.js Route Handler under
[`src/app/api/messages/**/route.ts`](../../../../next-js-boilerplate/src/app/api/messages/) — confirmed
by reading [`conversations/[userId]/messages/route.ts`](../../../../next-js-boilerplate/src/app/api/messages/conversations/[userId]/messages/route.ts),
which is the actual BFF layer: it runs server-side, resolves the access token from cookies,
forwards it as `Authorization: Bearer` plus the other session tokens as headers
(`sessionTokenHeaders()`), and fetches `${APP_URL}/api/conversations/{userId}/messages` — the real
backend. The chain in full:

```
Browser (component) → api/client hook → api/server/*.ts (apiFetch, same-origin)
  → app/api/**/route.ts (real BFF: cookie→header bridge, calls backend)
    → NestJS backend
```

Handles the 401→refresh→retry cycle at the `apiFetch` layer; the `route.ts` layer is the one thing
actually standing between this app and the real backend endpoint (per
[../../../architecture.md § BFF proxy pattern](../../../architecture.md#bff-proxy-pattern--nextjs-sits-between-the-browser-and-the-backend)).
Every `src/api/server/messages/*.ts` file below has a same-path `route.ts` sibling implementing this
exact pattern; only one was read in full to confirm it (cited above) — the rest are inferred to
follow it, not individually re-verified.

## Client (`src/api/client/messages/`)

| File | Exports | Purpose |
|---|---|---|
| [`actions.ts`](../../../../next-js-boilerplate/src/api/client/messages/actions.ts) | `useMessageActions()` (`sendMessage`, `deleteMessage`, `markRead`, `toggleFavorite`), `useMessageUpload()` | The mutation layer — see per-action detail below |
| [`query.ts`](../../../../next-js-boilerplate/src/api/client/messages/query.ts) | `conversationsQueryOptions`, `conversationMessagesQueryOptions`, `conversationAttachmentsQueryOptions`, `roomMessagesQueryOptions`, `roomAttachmentsQueryOptions` | React Query option builders — all lazy-`import()` their matching `api/server` file, keeping the server-only code out of the initial client bundle |
| [`rooms.ts`](../../../../next-js-boilerplate/src/api/client/messages/rooms.ts) | `roomsQueryOptions` | Room list query |
| [`mark-read.ts`](../../../../next-js-boilerplate/src/api/client/messages/mark-read.ts) | `useMarkMessagesRead()` | A narrower, standalone mark-read hook (no favorite/delete/send) — used outside the messages page itself (e.g. from a notification click) |

### Send a message (client)

`useMessageActions().sendMessage(recipientId, text, attachments?, replyTo?)` — **prefers the
WebSocket over the BFF REST route**: if `realtime.status === "open"`, it sends a `direct-message`
frame directly (see
[backend messaging/endpoints.md § WebSocket Events](../../../backend/messaging-realtime/messaging/endpoints.md#websocket-events))
and returns immediately — the gateway's echo (via `event-dispatch.ts`, matched on `tempId`) replaces
the optimistic entry, so the REST response's encrypted-at-rest row (`body: null`) never has to round
trip into the query cache. The REST path below (`send-message.ts`) only runs as a **fallback** when
no open socket exists. Either way, an optimistic entry is inserted into the
`["messages", recipientId]` query cache immediately (`pending: true`), replaced on success or flagged
`failed: true` on error.

### Delete a message (client)

`useMessageActions().deleteMessage(messageId, peerId, scope)` — optimistically patches the query
cache first (`scope: "me"` removes the row locally; `scope: "everyone"` nulls `body`/`attachments`
and stamps `deletedAt`), then calls the matching BFF route below; rolls the cache back to its
pre-optimistic snapshot on failure.

## Server / BFF routes (`src/api/server/messages/`)

Base URL constants live in
[`src/constants/api/urls.ts`](../../../../next-js-boilerplate/src/constants/api/urls.ts)
(`MESSAGES_*`), all proxying to the paths documented in
[backend messaging/endpoints.md](../../../backend/messaging-realtime/messaging/endpoints.md).

### Send a message (BFF route)

**Source:** [`send-message.ts`](../../../../next-js-boilerplate/src/api/server/messages/send-message.ts) ·
`POST` via `MESSAGES_CONVERSATIONS_PREFIX + recipientId + "/messages"`
→ backend [`POST /api/conversations/:userId/messages`](../../../backend/messaging-realtime/messaging/endpoints.md#send-a-direct-message).
Body: `{text, _tempId?, attachments?, replyToId?}` — note this BFF route never sends an `envelope`
field itself (it's a plain REST fallback for when the WS path isn't available, not a wire-crypto
integration point); the backend's server-side at-rest encryption applies (see
[wire-crypto](../../../backend/messaging-realtime/wire-crypto/README.md)).

### Delete a message (BFF route)

**Source:** [`delete-message.ts`](../../../../next-js-boilerplate/src/api/server/messages/delete-message.ts) —
exports `deleteMessageForMeServer`/`deleteMessageForEveryoneServer`, both `POST`, no body, via
`MESSAGES_MESSAGES_PREFIX + messageId + "/delete-for-me|delete-for-everyone"` → backend
[`POST /api/messages/:messageId/delete-for-{me,everyone}`](../../../backend/messaging-realtime/messaging/endpoints.md#delete-a-message).

### Everything else

| File | BFF route(s) | Backend endpoint |
|---|---|---|
| [`conversations.ts`](../../../../next-js-boilerplate/src/api/server/messages/conversations.ts) | `GET MESSAGES_CONVERSATIONS_URL` | [List conversations](../../../backend/messaging-realtime/messaging/endpoints.md#list-conversations) |
| [`conversation-messages.ts`](../../../../next-js-boilerplate/src/api/server/messages/conversation-messages.ts) | `GET MESSAGES_CONVERSATION_MESSAGES_PREFIX + peerId + "/messages"` | [Get paginated conversation messages](../../../backend/messaging-realtime/messaging/endpoints.md#get-paginated-conversation-messages) |
| [`conversation-attachments.ts`](../../../../next-js-boilerplate/src/api/server/messages/conversation-attachments.ts) | `GET MESSAGES_CONVERSATION_ATTACHMENTS_PREFIX + peerId + "/attachments"` | [List conversation attachments](../../../backend/messaging-realtime/messaging/endpoints.md#list-conversation-attachments) |
| [`mark-read.ts`](../../../../next-js-boilerplate/src/api/server/messages/mark-read.ts) | `POST MESSAGES_READ_URL` | [Mark messages read](../../../backend/messaging-realtime/messaging/endpoints.md#mark-messages-read) |
| [`favorite.ts`](../../../../next-js-boilerplate/src/api/server/messages/favorite.ts) | `POST MESSAGES_FAVORITE_URL` / `MESSAGES_UNFAVORITE_URL` | [Favorite / unfavorite a conversation](../../../backend/messaging-realtime/messaging/endpoints.md#favorite--unfavorite-a-conversation) |
| [`friends.ts`](../../../../next-js-boilerplate/src/api/server/messages/friends.ts) | `GET MESSAGES_FRIENDS_URL` | [List friends](../../../backend/messaging-realtime/messaging/endpoints.md#list-friends) |
| [`friend-requests.ts`](../../../../next-js-boilerplate/src/api/server/messages/friend-requests.ts) | `GET MESSAGES_FRIENDS_REQUESTS_URL` | [List pending friend requests](../../../backend/messaging-realtime/messaging/endpoints.md#list-pending-friend-requests) |
| [`send-friend-request.ts`](../../../../next-js-boilerplate/src/api/server/messages/send-friend-request.ts), [`accept-friend-request.ts`](../../../../next-js-boilerplate/src/api/server/messages/accept-friend-request.ts), [`decline-friend-request.ts`](../../../../next-js-boilerplate/src/api/server/messages/decline-friend-request.ts) | `POST MESSAGES_FRIENDS_{REQUEST,ACCEPT,DECLINE}_PREFIX + userId` | [Send / accept / decline a friend request](../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request) — used by [find-friends](../find-friends/page.md), not this page directly |
| [`rooms.ts`](../../../../next-js-boilerplate/src/api/server/messages/rooms.ts) | `GET ROOMS_URL` | [List / read / write chat rooms](../../../backend/messaging-realtime/messaging/endpoints.md#list--read--write-chat-rooms) |
| [`room-messages.ts`](../../../../next-js-boilerplate/src/api/server/messages/room-messages.ts) | `GET MESSAGES_ROOM_MESSAGES_PREFIX + room + "/messages"` | same — used by chat-room (Phase 3), reused here only for the sidebar's room list metadata |
| [`room-attachments.ts`](../../../../next-js-boilerplate/src/api/server/messages/room-attachments.ts) | `GET MESSAGES_ROOM_ATTACHMENTS_PREFIX + room + "/attachments"` | same |
| [`upload-attachment.ts`](../../../../next-js-boilerplate/src/api/server/messages/upload-attachment.ts) | `POST UPLOAD_ATTACHMENT_STREAM_URL` (raw octet-stream, XHR for progress) / `UPLOAD_ATTACHMENT_URL` (multipart fallback, `uploadAttachmentServer`, currently unused by any hook in this vertical — `useAttachmentUploads` only calls the stream variant) | [Stream a chat attachment upload](../../../backend/messaging-realtime/upload/endpoints.md#stream-a-chat-attachment-upload) / [Upload a chat attachment](../../../backend/messaging-realtime/upload/endpoints.md#upload-a-chat-attachment) — ⚠ the BFF route backing the unused fallback also drops the `x-scope-*` headers the streamed one forwards correctly, see [FE-012](../../../issues.md#fe-012) |

## WebSocket (bypasses the BFF entirely for this vertical)

Unlike every route above, the WebSocket connection (`useConversation`'s live updates,
`sendMessage`'s preferred path, typing indicators) is opened **directly from the browser to the
backend's `/ws` endpoint** — no Next.js hop. See
[../../../backend/messaging-realtime/realtime/README.md](../../../backend/messaging-realtime/realtime/README.md)
for the connection/auth mechanism and
[../../../backend/messaging-realtime/messaging/endpoints.md#websocket-events](../../../backend/messaging-realtime/messaging/endpoints.md#websocket-events)
for the frame catalogue.
