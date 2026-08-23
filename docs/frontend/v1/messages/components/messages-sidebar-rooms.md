# MessagesSidebarRooms

**Source:** [`MessagesSidebarRooms.tsx`](../../../../../next-js-boilerplate/src/views/messages/MessagesSidebarRooms.tsx)
**Types:** [`MessagesSidebarRooms-types.ts`](../../../../../next-js-boilerplate/src/types/messages/MessagesSidebarRooms-types.ts)
**Used in:** [MessagesSidebar](./messages-sidebar.md) (shown when the "Groups" filter is active)
**Mobile equivalent:** confirmed none — [mobile's messages sidebar](../../../../mobile/v1/messages/widgets/messages-sidebar.md)
is a 2-tab Chats/Friends switcher with no room list at all (see
[CROSS-001](../../../../issues.md#cross-001)); mobile reaches rooms exclusively through the separate
[chat-room screen](../../../../mobile/v1/chat-room/screen.md), never from within the messages screen
itself. Verified while documenting Phase 3b.

## Purpose

Lists the fixed public chat rooms (`general`, `random`, `tech`, `design`, `music`, plus any
`vip-`-prefixed room the backend returns — see
[messaging/endpoints.md § List / read / write chat rooms](../../../../backend/messaging-realtime/messaging/endpoints.md#list--read--write-chat-rooms)),
each linking to `/v1/{lang}/chat-room?room={slug}` — see
[chat-room page.md](../../chat-room/page.md). Room display name is just the slug, capitalized
(`roomDisplayName`) — no separate display-name field exists backend-side.

## Props (`MessagesSidebarRoomsProps`)

`rooms`, `roomsLoading`, `lang` (for building the chat-room link).
