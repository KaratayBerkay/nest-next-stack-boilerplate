# MessagesSidebarSearch (widget)

**Source:** [`messages_sidebar_search.dart`](../../../../../flutter-boilerplate/lib/views/messages/messages_sidebar_search.dart)
**Used in:** [MessagesSidebar](./messages-sidebar.md)
**Web equivalent:** [MessagesSidebarSearch component](../../../../frontend/v1/messages/components/messages-sidebar-search.md)

## Purpose

Stateless `TextField` wrapper, `onChanged` callback only — same shape as web's version (a single
controlled input, no local debouncing; filtering happens client-side in whichever list widget
consumes the query, same as web). Searches whichever tab is active
([MessagesSidebarConversations](./messages-sidebar-conversations.md) or
[MessagesSidebarFriends](./messages-sidebar-friends.md)) — web's search only ever filters
conversations, since rooms/groups are a separate filter state there rather than a tab.
