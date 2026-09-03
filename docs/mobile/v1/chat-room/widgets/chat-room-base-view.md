# ChatRoomBaseView (widget)

**Source:** [`chat_room_base_view.dart`](../../../../../flutter-boilerplate/lib/views/chat_room/chat_room_base_view.dart)
**Used in:** [screen.md](../screen.md) (all four tier views extend or wrap this one class)
**Web equivalent:** [ChatRoomBaseView component](../../../../frontend/v1/chat-room/components/chat-room-base-view.md)
— architecturally different in one major way, see below.

## Purpose

`ConsumerStatefulWidget` (`ChatRoomBaseView` / `ChatRoomBaseViewState`) — the screen's orchestrator:
room/peer selection, message send, attachment picking, scroll management, and composing
[ChatRoomHeader](./chat-room-header.md), [ChatRoomSidebar](./chat-room-sidebar.md), and
[ChatRoomMainContent](./chat-room-main-content.md).

## Constructor

`lang`, `initialRoom` (default `"general"`), `showPageInfo`.

## Tier subclassing

Free/Basic use the base class as-is (`FreePageView extends ChatRoomBaseView`,
`BasicPageView extends FreePageView`); Medium/Premium subclass `ChatRoomBaseViewState` itself to
override three getters — `vipRooms`, `useNativeControls`, `showSelfCrown` — rather than duplicating
the widget. See [screen.md](../screen.md#what-renders-here) for the full table.

## Named rooms only (the DM branch is gone)

Until 2026-09-03 this widget was dual-purposed: an `_isNamedRoom` getter switched, per `_room` value,
between the named-room path and a second, complete 1:1 DM implementation
(`conversationMessagesProvider(_room)` + `{type: "direct-message", recipientId: _room}` frames) that
only the retired `/v1/:lang/chat/:conversationId` route could reach — see `MOB-016` (resolved). That
branch has been removed. The same room check survives as `_isNamedRoom(String room)`
(`ChatConstants.chatRooms` / the tier's `vipRooms` / the `vip-` prefix — mirroring the backend's own
`isValidRoom`), but it now runs once, in `initState`, to validate `initialRoom` and fall back to
`general` for anything that isn't a named room. Every send is a `room-message` frame and every read
goes through `roomMessagesProvider(_room)`, exactly like web's `ChatRoomBaseView`.

## Behavior notes

- **Manual scroll-to-bottom settling** (`_settleToBottom`, up to 8 recursive post-frame-callback
  attempts) — same technique and same underlying `ListView.maxScrollExtent`-is-an-estimate reason as
  [messages' `ChatView`](../../messages/widgets/chat-view.md#behavior-notes-vs-web).
- **Single attachment only** (`_pendingAttachment` is one nullable field), same ceiling as
  [messages' `ChatInputBar` widget](../../messages/widgets/chat-input-bar.md#behavior-notes-vs-web) —
  web's chat-room composer supports multiple staged attachments via the shared
  [`AttachmentModal`](../../../../frontend/v1/chat-room/components/chat-room-main-content.md); mobile
  does not.
- **No reply state, no delete UI** — see
  [screen.md § Confirmed gaps](../screen.md#confirmed-gaps-vs-web-found-while-documenting-this-screen).
  For the room branch this matches the backend (no reply/delete capability exists for `RoomMessage`
  at all — [CROSS-024](../../../../issues.md#cross-024)); for the (unreachable) DM branch it's a real gap
  relative to [messages' own DM screen](../../messages/screen.md), which does support delete-for-me/
  delete-for-everyone.
- `_setupRealtime()` only sends `get-room-counts` when `_isNamedRoom` — joining the room itself is
  handled by the route-driven realtime page claim, not by this method.

## Calls

Room branch: `{type: "room-message", ...}` / `{type: "get-room-counts"}` — see
[messaging/endpoints.md § WebSocket Events](../../../../backend/messaging-realtime/messaging/endpoints.md#websocket-events).
DM branch: `{type: "direct-message", ...}`, same entry. Attachment upload:
`messageActionsProvider.uploadAttachment(path, name)` → direct REST `POST /upload/attachment` — see
[api.md](../api.md) and
[upload/endpoints.md § Upload a chat attachment](../../../../backend/messaging-realtime/upload/endpoints.md#upload-a-chat-attachment).
⚠ Unlike web, this call has no `scope` parameter at all — `UploadAttachmentServer.call()` only ever
takes `(filePath, fileName)` — so it never sends `x-scope-kind`/`x-scope-id`, from either this widget
or [messages'](../../messages/widgets/chat-input-bar.md#calls) identical call. See
`MOB-017` (resolved).
