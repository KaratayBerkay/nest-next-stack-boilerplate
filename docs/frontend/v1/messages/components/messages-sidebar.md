# MessagesSidebar

**Source:** [`MessagesSidebar.tsx`](../../../../../next-js-boilerplate/src/views/messages/MessagesSidebar.tsx)
**Types:** [`MessagesSidebar-types.ts`](../../../../../next-js-boilerplate/src/types/messages/MessagesSidebar-types.ts)
**Used in:** [messages page](../page.md)
**Mobile equivalent:** [MessagesSidebar widget](../../../../mobile/v1/messages/widgets/messages-sidebar.md)

## Purpose

The left-hand panel container: header, filter pills, search, and (depending on the active filter)
either the conversation list or the room list. Owns the client-side filtering logic; the
sub-components it renders are purely presentational.

## Props (`MessagesSidebarProps`)

`conversations`, `selectedUser`, `friends`, `filter`/`setFilter`, `search`/`setSearch`,
`openConversation`, `onToggleFavorite`, `sidebarOpen`/`setSidebarOpen` (mobile overlay visibility),
`onlineUsers`, `convsError`, `convsLoading`.

## Behavior notes

- **Fetches rooms itself**, only when needed: `roomsQueryOptions()` with `enabled: filter ===
  "groups"` — the room list isn't loaded at all until the user switches to that filter.
- **Synthesizes placeholder rows for friends with no message history**: the backend's
  `conversations` list only includes threads with at least one real message (see
  [messaging/endpoints.md#list-conversations](../../../../backend/messaging-realtime/messaging/endpoints.md#list-conversations)),
  so for the "All" filter this component computes `friendsWithoutConvo` (friends not already in
  `conversations`, alphabetically sorted, appended after the real threads) and merges them in with
  `noHistory: true` — otherwise "All" would silently mean "only friends you've already messaged,"
  not "everyone you can message."
- Filtering (`all`/`unread`/`favorites`/`search`) all happens client-side over the already-fetched
  `conversations` array — no separate query per filter.

## Composes

[MessagesSidebarFilterBar](./messages-sidebar-filter-bar.md) ·
[MessagesSidebarSearch](./messages-sidebar-search.md) ·
[MessagesSidebarConversations](./messages-sidebar-conversations.md) (default) ·
[MessagesSidebarRooms](./messages-sidebar-rooms.md) (`filter === "groups"`)
