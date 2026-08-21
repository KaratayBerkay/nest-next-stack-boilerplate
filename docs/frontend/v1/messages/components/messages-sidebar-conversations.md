# MessagesSidebarConversations

**Source:** [`MessagesSidebarConversations.tsx`](../../../../../next-js-boilerplate/src/views/messages/MessagesSidebarConversations.tsx)
**Types:** [`MessagesSidebarConversations-types.ts`](../../../../../next-js-boilerplate/src/types/messages/MessagesSidebarConversations-types.ts)
**Used in:** [MessagesSidebar](./messages-sidebar.md) (default view, all filters except "Groups")
**Mobile equivalent:** [MessagesSidebarConversations widget](../../../../mobile/v1/messages/widgets/messages-sidebar-conversations.md)

## Purpose

The actual conversation row list — avatar (online ring), name, last-message preview, timestamp,
unread badge, and a favorite-star toggle. Purely presentational; all filtering already happened in
[MessagesSidebar](./messages-sidebar.md).

## Props (`MessagesSidebarConversationsProps`)

`conversations` (pre-filtered), `selectedUser`, `openConversation`, `onlineUsers`, `convsError`,
`convsLoading`, `onToggleFavorite`, `emptyMessage` (overrides the default empty-state copy — used for
the "Unread" filter's empty state).

## Behavior notes

- **Last-message preview has 4 distinct states**, checked in order: a friend with `noHistory` shows
  "Start chatting"; a `"[Deleted]"` sentinel (the backend's tombstone marker — see
  [messaging/endpoints.md#list-conversations](../../../../backend/messaging-realtime/messaging/endpoints.md#list-conversations))
  shows the localized "deleted message" copy; a non-empty, non-`"[Encrypted]"` string shows the
  literal preview text; anything else (empty string, the literal `"[Encrypted]"`, or a non-string
  value) falls back to an attachment or decryption-failed icon+label. Note `"[Encrypted]"` is checked
  as a literal string here even though nothing in the current backend response actually returns that
  exact sentinel (worth confirming this branch is still reachable, or is dead defensive code, next
  time this file is touched).
- The favorite star's click handler calls `e.stopPropagation()` so starring doesn't also open the
  conversation.
