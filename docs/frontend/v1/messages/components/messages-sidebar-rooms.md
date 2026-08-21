# MessagesSidebarRooms

**Source:** [`MessagesSidebarRooms.tsx`](../../../../../next-js-boilerplate/src/views/messages/MessagesSidebarRooms.tsx)
**Types:** [`MessagesSidebarRooms-types.ts`](../../../../../next-js-boilerplate/src/types/messages/MessagesSidebarRooms-types.ts)
**Used in:** [MessagesSidebar](./messages-sidebar.md) (shown when the "Groups" filter is active)
**Mobile equivalent:** unconfirmed — verify against `messages-sidebar-friends.md`/chat_room mobile widgets during Phase 3; naming doesn't obviously match 1:1.

## Purpose

Lists the fixed public chat rooms (`general`, `random`, `tech`, `design`, `music`, plus any
`vip-`-prefixed room the backend returns — see
[messaging/endpoints.md § List / read / write chat rooms](../../../../backend/messaging-realtime/messaging/endpoints.md#list--read--write-chat-rooms)),
each linking to `/v1/{lang}/chat-room?room={slug}` (Phase 3). Room display name is just the slug,
capitalized (`roomDisplayName`) — no separate display-name field exists backend-side.

## Props (`MessagesSidebarRoomsProps`)

`rooms`, `roomsLoading`, `lang` (for building the chat-room link).
