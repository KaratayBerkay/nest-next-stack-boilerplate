# Chat Room — API

Page: [page.md](./page.md)

**This vertical has no API layer of its own** — no `src/api/client/chat-room/`, no
`src/api/server/chat-room/`, no `src/app/api/chat-room/**` route handlers exist. Every network call
[ChatRoomBaseView](./components/chat-room-base-view.md) and
[RoomAttachmentGallerySheet](./components/room-attachment-gallery-sheet.md) make reuses files already
documented in [messages/api.md](../messages/api.md), plus the WebSocket connection every page on this
site shares. This doc covers only what's chat-room-specific: which of those shared files get called,
with what arguments, and the one behavioral difference (WS-only send, no REST/GraphQL fallback).

## Reused from `messages/api.md`

| Purpose | File | BFF route | Backend endpoint |
|---|---|---|---|
| List rooms | [`rooms.ts`](../../../../next-js-boilerplate/src/api/client/messages/rooms.ts) (`roomsQueryOptions`) | `GET ROOMS_URL` | [List / read / write chat rooms](../../../backend/messaging-realtime/messaging/endpoints.md#list--read--write-chat-rooms) |
| Paginated room messages | [`query.ts`](../../../../next-js-boilerplate/src/api/client/messages/query.ts) (`roomMessagesQueryOptions`, via [`useRoom`](../messages/api.md)) | `GET MESSAGES_ROOM_MESSAGES_PREFIX + room + "/messages"` | same entry — `GET /api/rooms/:roomId/messages` |
| Room attachment gallery | `query.ts` (`roomAttachmentsQueryOptions`) | `GET MESSAGES_ROOM_ATTACHMENTS_PREFIX + room + "/attachments"` | same entry — `GET /api/rooms/:roomId/attachments` |
| Attachment upload | [`upload-attachment.ts`](../../../../next-js-boilerplate/src/api/server/messages/upload-attachment.ts) (`uploadAttachmentStreamServer`, via [`useAttachmentUploads`](../messages/hooks.md#useattachmentuploads)) | `POST UPLOAD_ATTACHMENT_STREAM_URL` | [upload/endpoints.md § Stream a chat attachment upload](../../../backend/messaging-realtime/upload/endpoints.md#stream-a-chat-attachment-upload) |
| Attachment preview/download | shared `AttachmentPreview` component's `serveUrl()` | `GET /api/upload/serve` | [upload/endpoints.md § Serve a decrypted attachment](../../../backend/messaging-realtime/upload/endpoints.md#serve-a-decrypted-attachment) |

**Upload scope**: [`ChatRoomBaseView`](./components/chat-room-base-view.md) calls
`startUploads(files, { kind: "chat-room", id: room })` — the one place this vertical passes a
non-default `UploadScope`. `useAttachmentUploads`/`uploadAttachmentStreamServer` forward this as
`x-scope-kind: chat-room` / `x-scope-id: <room>` request headers, read by the backend's
`resolveUploadScope()` (see
[upload/README.md § Upload scoping](../../../backend/messaging-realtime/upload/README.md#upload-scoping--one-endpoint-two-composers)).
Messages' own calls to the same hook omit the `scope` argument entirely, which defaults to the DM
scope server-side.

## Send a room message — WebSocket only

**Source:** [`ChatRoomHandlers.tsx`](../../../../next-js-boilerplate/src/views/chat-room/ChatRoomHandlers.tsx)
(`chatRoomHandleSend`) — sends `{ type: "room-message", room, text, tempId, attachments? }` directly
over the realtime socket. See
[messaging/endpoints.md § WebSocket Events](../../../backend/messaging-realtime/messaging/endpoints.md#websocket-events).

Unlike [messages' send](../messages/api.md#send-a-message-client) (WS-preferred, REST-fallback when
the socket is down), **chat-room has no fallback at all** — `chatRoomHandleSend` no-ops if `realtime`
is falsy. There is no BFF route or backend REST/GraphQL endpoint for sending a room message; the WS
frame is the only way in.

## WebSocket (bypasses the BFF entirely, same as messages)

Opened directly from the browser to the backend's `/ws` endpoint — no Next.js hop. Room-specific
frames this vertical sends/receives beyond the generic connection lifecycle:
`get-room-counts`/`get-room-members` (client→server, pulled on mount/room-change — see
[hooks.md](./hooks.md#usechatroomrealtime)), `room-counts`/`room-members`/`user-joined`/`user-left`
(server→client), `room-message` (both directions). Room membership itself is established by the
generic `page` frame's `chat-room` claim (`{type: "page", page: "chat-room", params: {room}}`), not a
frame this vertical's own code sends explicitly — see
[realtime/endpoints.md § `page`](../../../backend/messaging-realtime/realtime/endpoints.md#page). Full
catalogue: [messaging/endpoints.md § WebSocket Events](../../../backend/messaging-realtime/messaging/endpoints.md#websocket-events).
