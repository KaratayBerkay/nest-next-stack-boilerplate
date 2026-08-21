# ChatViewHeader

**Source:** [`ChatViewHeader.tsx`](../../../../../next-js-boilerplate/src/views/messages/ChatViewHeader.tsx)
**Types:** [`ChatViewHeader-types.ts`](../../../../../next-js-boilerplate/src/types/messages/ChatViewHeader-types.ts)
**Used in:** [ChatView](./chat-view.md)
**Mobile equivalent:** [ChatViewHeader widget](../../../../mobile/v1/messages/widgets/chat-view-header.md)

## Purpose

Peer identity bar above the message list: avatar (with an online-status ring), name, typing/online/
offline status line, a mobile-only back button, and the "open attachment gallery" affordance.

## Props (`ChatViewHeaderProps`)

`selectedUser`, `setSelectedUser`/`setSidebarOpen` (back-button behavior — clears the selection and
reopens the sidebar, mobile layout only), `onlineUsers` (a `Set`, checked via `.has(selectedUser.id)`),
`isTyping`, `onOpenGallery` (optional — the folder icon only renders when supplied).

## Behavior notes

Status line priority is typing > online > offline (`isTyping` short-circuits before the online
check) — a peer who's online and currently typing shows "typing…", not "online".
