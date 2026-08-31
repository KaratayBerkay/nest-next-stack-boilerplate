# Chat Room — API

Screen: [screen.md](./screen.md)

**This vertical has no API layer of its own** — no `lib/api/{client,server}/chat_room/` folder exists.
Every network call [ChatRoomBaseView](./widgets/chat-room-base-view.md) makes reuses files already
documented in [messages/api.md](../messages/api.md), plus the shared realtime WebSocket connection.
This doc covers only what's chat-room-specific, following the same
[3-shape test](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)
required for every mobile vertical.

## Shape per file (reused from `messages`)

| File | Shape | Path/operation | Backend endpoint |
|---|---|---|---|
| [`room_messages.dart`](../../../../flutter-boilerplate/lib/api/server/messages/room_messages.dart) | Direct REST | `GET /api/rooms/:room/messages` | [List / read / write chat rooms](../../../backend/messaging-realtime/messaging/endpoints.md#list--read--write-chat-rooms) |
| [`upload_attachment.dart`](../../../../flutter-boilerplate/lib/api/server/messages/upload_attachment.dart) | Direct REST | `POST /upload/attachment` | [Upload a chat attachment](../../../backend/messaging-realtime/upload/endpoints.md#upload-a-chat-attachment) |

Both confirmed direct-to-backend (the path matches the backend's own native controller route, not a
frontend-namespaced one — no Next.js app is involved anywhere in this stack for mobile). **No file
exists for listing rooms** (`GET /api/rooms`, the bare list-rooms endpoint) — see below — and **no
file exists for the room attachment gallery** (`GET /api/rooms/:room/attachments`), consistent with
`CROSS-028` (resolved) (no gallery UI exists to call it from).

### ⚠ Room list is hardcoded, never fetched

Unlike web ([`roomsQueryOptions()`](../../../frontend/v1/chat-room/api.md#reused-from-messagesapimd),
a real `GET /api/rooms` call), [ChatRoomBaseView](./widgets/chat-room-base-view.md) builds its room
list from `[...ChatConstants.chatRooms, ...vipRooms]` —
[`ChatConstants`](../../../../flutter-boilerplate/lib/constants/chat.dart) is a compile-time Dart
constant list (`general`/`random`/`tech`/`design`/`music`, plus `vip-lounge` for Medium/Premium).
`grep -rn "'/api/rooms'"` across `flutter-boilerplate/lib` (excluding the `/messages`- and
`/attachments`-suffixed paths above) returns nothing. This currently matches the backend's real fixed
room list, but is a live-vs-hardcoded drift risk of the same shape as
`CROSS-008` (resolved) (`GET /auth/oauth/providers`, unused but currently matching
hardcoded client lists) — see `CROSS-025` (resolved).

### ⚠ Attachment upload never sends an upload scope

`upload_attachment.dart`'s `UploadAttachmentServer.call(filePath, fileName)` takes exactly those two
arguments — there is no third `scope` parameter anywhere in its call chain
(`messageActionsProvider.uploadAttachment()` → here), so it can never send the `x-scope-kind`/
`x-scope-id` headers the backend's `resolveUploadScope()` reads (see
[upload/README.md § Upload scoping](../../../backend/messaging-realtime/upload/README.md#upload-scoping--one-endpoint-two-composers)).
Every attachment uploaded from this screen lands in the backend's default DM storage folder
(`uploads/messages/<userId>/…`) rather than the room-scoped one (`uploads/chat-room/<room>/…`) web
correctly uses. This doesn't break access or quota (neither check consults `kind`/`scopeId`) — it's a
storage-bookkeeping/traceability gap only. See `MOB-017` (resolved).

### Sending a room message — WebSocket only, and no `scope`/`envelope` concept applies

`ChatRoomBaseViewState._handleSend()` sends `{type: "room-message", room: _room, text, attachments?}`
directly over the realtime socket (`realtime_provider.dart`) — see
[messaging/endpoints.md § WebSocket Events](../../../backend/messaging-realtime/messaging/endpoints.md#websocket-events).
There is no REST or GraphQL path for sending a room message on either platform — this is the one call
shape chat-room has that messages doesn't share at all (messages sends DMs via a **direct GraphQL**
mutation, never the WS frame — see
[messages/api.md § No WebSocket send path](../messages/api.md#no-websocket-send-path)). Live delivery
of incoming room messages arrives over the same WebSocket regardless
(`realtime_provider.dart`'s `room-message` handler, feeding `roomMessagesProvider`).

## Client layer (reused from `messages`)

[`messageActionsProvider`](../messages/api.md#client-layer-libapiclientmessages) (`uploadAttachment`)
and the `StateNotifierProvider.family` pagination providers
(`roomMessagesProvider`/`conversationMessagesProvider`, selected per-value by
[`_isNamedRoom`](./widgets/chat-room-base-view.md#dual-purpose-named-rooms-and-legacy-11-dms)) — no
chat-room-specific provider exists; this screen watches the same providers messages defines.
