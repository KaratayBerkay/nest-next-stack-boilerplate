# OnlineAvatar (widget)

**Source:** [`online_avatar.dart`](../../../../../flutter-boilerplate/lib/views/messages/online_avatar.dart)
**Used in:** [MessagesSidebarConversations](./messages-sidebar-conversations.md),
[MessagesSidebarFriends](./messages-sidebar-friends.md)
**Web equivalent:** none — a Flutter-only extraction, not a gap. Web inlines the same
avatar-plus-online-ring markup directly inside
[MessagesSidebarConversations](../../../../frontend/v1/messages/components/messages-sidebar-conversations.md)
rather than factoring it into its own component.

## Purpose

`ConsumerWidget` wrapping the shared `Avatar` widget with a green ring + dot overlay when
`onlineUsersProvider` contains the given `userId`. Shared between the conversations list and the
friends-tab list so the presence-ring visual stays consistent across both.

## Constructor

`imageUrl` (optional), `name` (required, for initials fallback), `userId` (required, presence
lookup key).
