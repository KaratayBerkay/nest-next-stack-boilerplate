# MessagesSidebar (widget)

**Source:** [`messages_sidebar.dart`](../../../../../flutter-boilerplate/lib/views/messages/messages_sidebar.dart)
**Used in:** [screen.md](../screen.md)
**Web equivalent:** [MessagesSidebar component](../../../../frontend/v1/messages/components/messages-sidebar.md)
— structurally quite different, see below.

## Purpose

`ConsumerStatefulWidget` — search field, a 2-tab switcher (Chats/Friends), and the active tab's list.
Owns `_activeTab`/`_searchQuery` as plain local `State`, unlike web's centralized page-level hook.

## Structural differences from web (found while documenting this widget)

Web's sidebar is: header → 4-pill filter bar (All/Unread/Favorites/Groups) + new-chat popover →
search → conversation list *or* room list (depending on the "Groups" filter). Mobile's is: search →
2-tab bar (Chats/Friends) → conversation list *or* full friends list (depending on tab). These are
**not the same interaction model** wearing different widgets — mobile has no unread filter, no
favorites, no room/group list in this screen at all, and "start a new conversation" is a whole tab
(browse all friends) rather than a small popover. See
[CROSS-001](../../../../issues.md#cross-001) and
[MessagesSidebarTabBar](./messages-sidebar-tab-bar.md)/[MessagesSidebarFriends](./messages-sidebar-friends.md)
for the two widgets that realize this different model.

## Composes

[MessagesSidebarSearch](./messages-sidebar-search.md) ·
[MessagesSidebarTabBar](./messages-sidebar-tab-bar.md) ·
[MessagesSidebarConversations](./messages-sidebar-conversations.md) (tab 0) ·
[MessagesSidebarFriends](./messages-sidebar-friends.md) (tab 1)
