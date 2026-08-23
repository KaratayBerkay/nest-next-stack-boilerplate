# ChatRoomHeader (widget)

**Source:** [`chat_room_header.dart`](../../../../../flutter-boilerplate/lib/views/chat_room/chat_room_header.dart)
**Used in:** [ChatRoomBaseView](./chat-room-base-view.md)
**Web equivalent:** [ChatRoomHeader component](../../../../frontend/v1/chat-room/components/chat-room-header.md)

## Purpose

`StatelessWidget` — the viewer's own avatar with a connection-status dot, a static "Chat Rooms" title,
and (when `showPageInfo`) an info button that opens an `AlertDialog`. Same "shows the viewer, not a
peer" distinction from [messages' `ChatViewHeader`](../../messages/widgets/chat-view-header.md) as
web's equivalent.

## Constructor

`userName`, `userEmail`, `connectionState` (default `"online"`), `showPageInfo` (default `false`),
`onPageInfo`.

## Behavior notes

- Connection dot: green (`online`), amber (`connecting`), red (anything else) — three-state, matching
  web, though mobile doesn't animate/pulse the connecting state the way web's CSS does.
- ⚠ The title `'Chat Rooms'` is a hardcoded string literal, not run through `AppLocalizations` — the
  page-info dialog's own title, a few lines away in the same call tree, correctly uses
  `t.chatRoomTitle` for what is conceptually the same label, and the ARB key is fully populated. See
  [MOB-015](../../../../issues.md#mob-015).
