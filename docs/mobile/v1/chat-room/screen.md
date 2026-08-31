# Chat Room (screen)

**Routes:** `/v1/:lang/chat-room` (GoRouter name `v1ChatRoom`, query param `?conversation=`) **and**
`/v1/:lang/chat/:conversationId` (GoRouter name `v1ChatRoomLegacy`) — both wire to the same
`ChatRoomPageContent`. See [router.dart#L474-490](../../../../flutter-boilerplate/lib/app/router.dart).
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

## Two routes, one widget, one real branch

`ChatRoomPageContent` → `TierGate` → the tier widget above → `ChatRoomBaseView`. The `_room` state
field this widget manages is **not always a room** — a doc comment in
[`chat_room_base_view.dart#L51-56`](../../../../flutter-boilerplate/lib/views/chat_room/chat_room_base_view.dart)
explains that `ChatRoomBaseView` is also reused, unmodified, as a *second, independent 1:1 DM chat
screen* for the legacy `/v1/:lang/chat/:conversationId` route, where `_room` is actually a peer's user
id. A getter, `_isNamedRoom` (mirroring the backend's own `isValidRoom`/`VIP_ROOM_PREFIX` check),
decides per-value which of two completely different code paths runs:

| | Named room (`_isNamedRoom == true`) | DM (`_isNamedRoom == false`) |
|---|---|---|
| Message provider | `roomMessagesProvider(_room)` | `conversationMessagesProvider(_room)` |
| Send frame | `{type: "room-message", room: _room, ...}` | `{type: "direct-message", recipientId: _room, ...}` |
| Realtime setup | `get-room-counts` on init | none |

This makes `ChatRoomBaseView` mobile's **second, parallel implementation of 1:1 DM chat**, structurally
unrelated to [messages](../messages/screen.md)' own `chat_view.dart` — same architectural split as
web (separate component tree from messages) but arrived at differently: web's chat-room tree simply
never handles DMs at all, while mobile's does, via this dual-purpose branch. See
[MOB-016](../../../issues.md#mob-016) for whether the DM branch is actually reachable.

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

- ⚠ **Deep-link query param name doesn't match web's** — this screen's own router reads
  `?conversation=` (matching its one real caller, `header_message_banner.dart`); web's equivalent
  in-app deep link ([`MessagesSidebarRooms`](../../../frontend/v1/messages/components/messages-sidebar-rooms.md))
  builds `?room=` instead. Each platform is internally consistent on its own, but a URL built for one
  wouldn't pre-select a room on the other. See
  [chat-room page.md § Known issues](../../../frontend/v1/chat-room/page.md#known-issues-affecting-this-page),
  [CROSS-026](../../../issues.md#cross-026).
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
- ⚠ **The legacy DM route appears unreachable** — `v1ChatRoomLegacy` is registered and fully
  functional but nothing in the current app navigates to it. See [MOB-016](../../../issues.md#mob-016).
- No reply-to-message and no delete-message — same as web, and for the same reason (the backend
  `RoomMessage` schema has neither). Not a mobile-specific gap; see
  [chat-room page.md § Known issues](../../../frontend/v1/chat-room/page.md#known-issues-affecting-this-page),
  [CROSS-024](../../../issues.md#cross-024).

## API

[api.md](./api.md) — like web, this screen reuses the `messages` vertical's API layer entirely; no
`lib/api/{client,server}/chat-room/` folder exists.
