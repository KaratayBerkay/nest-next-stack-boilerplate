# Chat Room (screen)

**Routes:** `/v1/:lang/chat-room` (GoRouter name `v1ChatRoom`, query param `?room=` — the same
name web's deep link uses, since `CROSS-026` (resolved) on 2026-09-03; the retired
`/v1/:lang/chat/:conversationId` legacy route and its `?conversation=` spelling are gone, see
`MOB-016` (resolved)). See the `v1ChatRoom` entry in
[router.dart](../../../../flutter-boilerplate/lib/app/router.dart).
**Entry widget:** `ChatRoomPageContent` in
[`page_view.dart`](../../../../flutter-boilerplate/lib/views/chat_room/page_view.dart)
**Web equivalent:** [chat-room page](../../../frontend/v1/chat-room/page.md)

## What renders here

Same `TierGate`-over-4-widgets composition pattern as
[messages](../messages/screen.md#what-renders-here), and — unlike web's parallel four-file duplicate
of the same pattern, contrast `CROSS-018` (resolved)'s over-independent tier
variants elsewhere in this app — genuinely **clean inheritance**, not four separate builds:

| Tier | File | Relationship |
|---|---|---|
| Free | [`free_page_view.dart`](../../../../flutter-boilerplate/lib/views/chat_room/free_page_view.dart) | `extends ChatRoomBaseView` directly |
| Basic | [`basic_page_view.dart`](../../../../flutter-boilerplate/lib/views/chat_room/basic_page_view.dart) | `extends FreePageView` — real subclassing, not a duplicate file |
| Medium | [`medium_page_view.dart`](../../../../flutter-boilerplate/lib/views/chat_room/medium_page_view.dart) | `extends ChatRoomBaseView`, overrides `vipRooms` → `ChatConstants.vipRooms` and `useNativeControls` → `true` |
| Premium | [`premium_page_view.dart`](../../../../flutter-boilerplate/lib/views/chat_room/premium_page_view.dart) | same as Medium, plus `showSelfCrown` → `true` |

`useNativeControls` is the one flag Medium/Premium set that Free/Basic don't — ⚠ see
`MOB-014` (resolved): it has no observable effect anywhere.

## One widget, named rooms only

`ChatRoomPageContent` → `TierGate` → the tier widget above → `ChatRoomBaseView`. Until 2026-09-03
this widget was dual-purposed: an `_isNamedRoom` getter switched, per `_room` value, between the
named-room path and a second, independent 1:1 DM implementation (`conversationMessagesProvider` +
`direct-message` frames) that only the retired `/v1/:lang/chat/:conversationId` route could reach —
see `MOB-016` (resolved). That branch is gone. `_room` is always a named room now: `initState`
validates `initialRoom` against `ChatConstants.chatRooms` / the tier's `vipRooms` / the `vip-`
prefix (the same rule as the backend's `isValidRoom`) and falls back to `general` for anything
else, so a stray deep link can no longer put the widget into a nonsense state. 1:1 DMs live only in
[messages](../messages/screen.md)' `chat_view.dart` — the same split web has always had.

## Layout: mobile vs. desktop

Same `context.isMobile`-branch pattern as
[messages](../messages/screen.md#layout-mobile-vs-desktop): mobile shows the sidebar as a 300ms
slide-in overlay (`AnimatedPositioned` + a scrim `GestureDetector`) over the message pane; desktop
shows a fixed 220px sidebar column beside the message pane in a `Row`.

## State

All local `State` on `ChatRoomBaseViewState` — no page-level hook object, no dedicated Riverpod
provider family the way messages centralizes `selectedConversationUserIdProvider`. Room/peer
selection (`_room`), sidebar visibility, the message/scroll controllers, and the single pending
attachment all live directly on the State class. Message data itself comes from whichever Riverpod
provider `_isNamedRoom` selects (see table above) — both are the same providers
[messages](../messages/screen.md#state) and this screen already share via
[api.md](./api.md).

## Widgets

5 significant widgets in
[`lib/views/chat_room/`](../../../../flutter-boilerplate/lib/views/chat_room/) — one fewer than web's
6, since mobile has no [RoomAttachmentGallerySheet](../../../frontend/v1/chat-room/components/room-attachment-gallery-sheet.md)
equivalent (see `CROSS-028` (resolved) below):
[chat-room-base-view.md](./widgets/chat-room-base-view.md) ·
[chat-room-header.md](./widgets/chat-room-header.md) ·
[chat-room-sidebar.md](./widgets/chat-room-sidebar.md) ·
[chat-room-main-content.md](./widgets/chat-room-main-content.md) ·
[chat-room-message-list.md](./widgets/chat-room-message-list.md)

(`chat_room_sub_components.dart`'s small pieces — `SidebarCloseButton`, `RoomButton`,
`HamburgerButton`, `MessageInput`, `ComposerIconButton`, `SendButton` — are folded into
[chat-room-sidebar.md](./widgets/chat-room-sidebar.md) and
[chat-room-main-content.md](./widgets/chat-room-main-content.md), matching web's equivalent grouping
and [conventions.md §2](../../../conventions.md#2-file-naming).)

## Confirmed gaps vs. web (found while documenting this screen)

- `CROSS-026` (resolved 2026-09-03) — the deep-link query param used to be `?conversation=` here vs.
  `?room=` on web ([`MessagesSidebarRooms`](../../../frontend/v1/messages/components/messages-sidebar-rooms.md)),
  so a URL built for one platform wouldn't pre-select a room on the other. Mobile now reads and
  builds `?room=` too (`router.dart`, `header_message_banner.dart`, `route_claim.dart`). See
  [chat-room page.md § Known issues](../../../frontend/v1/chat-room/page.md#known-issues-affecting-this-page),
  `CROSS-026` (resolved).
- ⚠ **Attachment uploads never carry an upload scope** — `messageActionsProvider.uploadAttachment()`
  has no `scope` parameter anywhere in its call chain, so every attachment upload from this screen
  (and from [messages](../messages/screen.md)) lands in the backend's default DM storage folder,
  never the room-scoped one web correctly uses. See `MOB-017` (resolved).
- ⚠ **Hardcoded room list, no live fetch** — this screen never calls `GET /api/rooms`; it uses
  `ChatConstants.chatRooms`/`vipRooms` (Dart constants) where web calls
  `roomsQueryOptions()`. See `CROSS-025` (resolved).
- ⚠ **No unlocalized-string parity check passed** — several UI strings ("Chat Rooms", "Rooms",
  "Online (n)", "No one is here", "No messages yet") are hardcoded English literals despite matching
  ARB keys already existing and being ready to use. See `MOB-015` (resolved).
- ⚠ **No attachment gallery** — same as [messages](../messages/screen.md#confirmed-parity-gaps-vs-web-found-while-documenting-this-screen),
  now confirmed rather than "unconfirmed": `grep -rli "attachmentgallery\|alluploads"` across the
  entire Flutter app returns nothing. Web's [RoomAttachmentGallerySheet](../../../frontend/v1/chat-room/components/room-attachment-gallery-sheet.md)
  has no mobile counterpart in either vertical. See `CROSS-028` (resolved).
- ⚠ **Attachment thumbnails never render** — the shared `AttachmentPreview` widget this screen's
  [ChatRoomMessageList](./widgets/chat-room-message-list.md) uses has no `thumbnailUrl` parameter at
  all, even though the JSON response and the parsed `MessageAttachment` model both carry it correctly.
  See `CROSS-027` (resolved).
- ⚠ **`useNativeControls` is dead** — threaded through 6 files, read in none of them. See
  `MOB-014` (resolved).
- `MOB-016` (resolved 2026-09-03) — the unreachable legacy DM route (`v1ChatRoomLegacy`) and the
  widget's DM branch behind it have been removed.
- No reply-to-message and no delete-message — same as web, and for the same reason (the backend
  `RoomMessage` schema has neither). Not a mobile-specific gap; see
  [chat-room page.md § Known issues](../../../frontend/v1/chat-room/page.md#known-issues-affecting-this-page),
  [CROSS-024](../../../issues.md#cross-024).

## API

[api.md](./api.md) — like web, this screen reuses the `messages` vertical's API layer entirely; no
`lib/api/{client,server}/chat-room/` folder exists.
