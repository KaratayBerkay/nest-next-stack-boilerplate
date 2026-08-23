# ChatRoomSidebar

**Source:** [`ChatRoomSidebar.tsx`](../../../../../next-js-boilerplate/src/views/chat-room/ChatRoomSidebar.tsx) ·
sub-components: [`ChatRoomSubComponents.tsx`](../../../../../next-js-boilerplate/src/views/chat-room/ChatRoomSubComponents.tsx)
**Types:** [`ChatRoomSidebar-types.ts`](../../../../../next-js-boilerplate/src/types/views/chat-room/ChatRoomSidebar-types.ts)
**Used in:** [ChatRoomBaseView](./chat-room-base-view.md)
**Mobile equivalent:** [ChatRoomSidebar widget](../../../../mobile/v1/chat-room/widgets/chat-room-sidebar.md)

## Purpose

Two-tab panel: a room list (all fixed public rooms + any tier-supplied VIP rooms, each a
[`RoomButton`](#sub-components-in-chatroomsubcomponentstsx)) and an "Online" tab listing the current
room's live members. Mobile-overlay on small screens (slide-in `Sheet`-style panel, closed by
[`SidebarCloseButton`](#sub-components-in-chatroomsubcomponentstsx)), a static 224px column on desktop.

## Props (`ChatRoomSidebarProps`)

`sidebarOpen`, `rooms`, `room` (active), `roomCounts`, `vipRooms`, `roomMembers`, `user`,
`showSelfCrown`, `t`, `onSetSidebarOpen`, `onSelectRoom`.

## Behavior notes

- Room buttons show a crown icon when `vipRooms.includes(room)` and a live member count badge from
  `roomCounts[room]` (kept fresh by
  [`useChatRoomRealtime`](./chat-room-base-view.md#usechatroomrealtime)).
- The "Online" tab's member rows show `chatNickname || name` — chat rooms are the one surface in this
  app where a user's [chat nickname](../../../../backend/social-content/profile/README.md) (a
  profile field, independent of and not overwriting their real name) is actually displayed, when set
  and enabled. Confirmed room-exclusive: the backend's `chatNickname` resolution
  (`(ws.useNickname && ws.chatNickname) || ws.userName`) appears in `handleJoinRoom`/
  `handleClaimJoinRoom` (the member snapshot this tab renders) and `handleRoomMessage` (each room
  message's sender label, rendered by [ChatRoomMessageList](./chat-room-message-list.md)) — `grep`
  for `chatNickname` in `messaging-dm.service.ts` returns nothing, so DM sender names never use it.
- `showSelfCrown` (Premium tier only) renders a small crown next to the viewer's own row in the
  member list — purely cosmetic, unrelated to the room-list crown icon above.

## Sub-components (in `ChatRoomSubComponents.tsx`)

Per [conventions.md §2](../../../../conventions.md#2-file-naming), these small presentational pieces
are documented here rather than as their own files:

| Component | Renders |
|---|---|
| `SidebarCloseButton` | Mobile-overlay close (X) icon |
| `RoomButton` | One row in the room list — slug, member count, VIP crown |
