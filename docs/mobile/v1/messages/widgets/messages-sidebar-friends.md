# MessagesSidebarFriends (widget)

**Source:** [`messages_sidebar_friends.dart`](../../../../../flutter-boilerplate/lib/views/messages/messages_sidebar_friends.dart)
**Used in:** [MessagesSidebar](./messages-sidebar.md) (Friends tab)
**Web equivalent:** loosely, the `NewChatPicker` inner component of
[MessagesSidebarFilterBar](../../../../frontend/v1/messages/components/messages-sidebar-filter-bar.md) —
web surfaces it as a small popover triggered by a "+" icon; mobile makes it a full tab.

## Purpose

`ConsumerWidget` — the complete friends list ([OnlineAvatar](./online-avatar.md) + name + literal
"Online"/"Offline" text, filtered by `searchQuery`), tapping a friend sets
`selectedConversationUserIdProvider` directly (starts or opens that conversation — same effect as
web's `NewChatPicker.onSelect`, just reached via a persistent tab instead of a transient popover).

## Behavior notes

Online/offline label here is a hardcoded literal string ("Online"/"Offline"), not run through
`AppLocalizations` like the rest of this widget's text (`t.messagesNoFriends`,
`t.messagesFailedToLoad` are localized; the presence label is not) — worth a look if this vertical's
i18n coverage is audited later.

## Calls

Reads `friendsListProvider` ([`api/client/friends/query.dart`](../../../../../flutter-boilerplate/lib/api/client/friends/query.dart) —
outside this vertical's own API surface, shared with the friends feature, Phase 2) and
`onlineUsersProvider`.
