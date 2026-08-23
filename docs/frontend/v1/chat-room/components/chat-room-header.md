# ChatRoomHeader

**Source:** [`ChatRoomHeader.tsx`](../../../../../next-js-boilerplate/src/views/chat-room/ChatRoomHeader.tsx)
**Types:** [`ChatRoomHeader-types.ts`](../../../../../next-js-boilerplate/src/types/views/chat-room/ChatRoomHeader-types.ts)
**Used in:** [ChatRoomBaseView](./chat-room-base-view.md)
**Mobile equivalent:** [ChatRoomHeader widget](../../../../mobile/v1/chat-room/widgets/chat-room-header.md)

## Purpose

Page-level header: the viewer's own avatar with a connection-status ring, the page title, and
(Free tier only) a page-info button. Unlike
[messages' `ChatViewHeader`](../../messages/components/chat-view-header.md), this is **not** a
per-peer identity bar — chat-room's header shows the *viewer's own* connection status, not a peer's;
per-room identity is [ChatRoomSidebar](./chat-room-sidebar.md)'s job.

## Props (`ChatRoomHeaderProps`)

`user`, `connectionState`, `showPageInfo`, `t`.

## Behavior notes

Connection dot: green solid (`online`), green pulsing (`connecting`), red (anything else). The tooltip
on the avatar itself carries the same three-way state as text (`t.connected`/`t.connecting`/
`t.disconnected`).
