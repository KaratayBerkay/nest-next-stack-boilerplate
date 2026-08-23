# ChatRoomSidebar (widget)

**Source:** [`chat_room_sidebar.dart`](../../../../../flutter-boilerplate/lib/views/chat_room/chat_room_sidebar.dart) ·
sub-components: [`chat_room_sub_components.dart`](../../../../../flutter-boilerplate/lib/views/chat_room/chat_room_sub_components.dart)
**Used in:** [ChatRoomBaseView](./chat-room-base-view.md)
**Web equivalent:** [ChatRoomSidebar component](../../../../frontend/v1/chat-room/components/chat-room-sidebar.md)

## Purpose

`StatefulWidget` with its own `TabController` (2 tabs: Rooms / Online) — a room list and the current
room's live member list, structurally identical to web's equivalent.

## Constructor

`useNativeControls` (accepted, never read — see [MOB-014](../../../../issues.md#mob-014)), `sidebarOpen`,
`rooms`, `room`, `roomCounts`, `vipRooms`, `roomMembers`, `currentUserId`, `showSelfCrown`,
`onSetSidebarOpen`, `onSelectRoom`.

## Behavior notes

- Member rows read `m['chatNickname'] ?? m['name']` — same nickname-over-real-name precedence as web
  (see [chat-room-sidebar.md (web) § Behavior notes](../../../../frontend/v1/chat-room/components/chat-room-sidebar.md#behavior-notes)
  for the backend-side confirmation that this is room-exclusive).
- ⚠ Three hardcoded, unlocalized string literals in this file: the `'Rooms'` section label, the
  `'Online (${count})'` tab label (the ARB key `chatRoomOnline` exists and goes unused), and
  `'No one is here'` (the ARB key `chatRoomNoOneHere` exists and goes unused). See
  [MOB-015](../../../../issues.md#mob-015).

## Sub-components (in `chat_room_sub_components.dart`)

Per [conventions.md §2](../../../../conventions.md#2-file-naming), documented here rather than as
separate files:

| Widget | Renders | Localized? |
|---|---|---|
| `SidebarCloseButton` | Mobile-overlay close icon | Yes — `AppLocalizations.of(context).chatRoomCloseSidebar` (tooltip) |
| `RoomButton` | One room-list row — slug, member count, VIP crown | n/a (no user-facing label beyond the room slug itself) |
