# MessagesSidebarConversations (widget)

**Source:** [`messages_sidebar_conversations.dart`](../../../../../flutter-boilerplate/lib/views/messages/messages_sidebar_conversations.dart)
**Used in:** [MessagesSidebar](./messages-sidebar.md) (Chats tab)
**Web equivalent:** [MessagesSidebarConversations component](../../../../frontend/v1/messages/components/messages-sidebar-conversations.md)

## Purpose

`ConsumerWidget` — the conversation row list: [OnlineAvatar](./online-avatar.md), name, last-message
preview, relative timestamp, unread-count badge. Filters `conversationsProvider`'s data by
`searchQuery` locally (name or last-message substring match) — client-side, same as web.

## Behavior notes vs. web

- **No favorite star** — no favorite/unfavorite affordance anywhere in this widget (consistent with
  `CROSS-001` (resolved)).
- **No "friend with no history yet" synthesis** — web's sidebar merges in placeholder rows for
  friends without a conversation row so "All" reads as "everyone you can message"; this widget only
  ever shows real conversation rows. On mobile, starting a chat with a friend who has no history yet
  is entirely the [Friends tab](./messages-sidebar-friends.md)'s job instead — a different UI path to
  the same outcome, not a missing feature, given the 2-tab model.
- Last-message preview has only 2 states here (vs. web's 4): the `"[Deleted]"` sentinel → localized
  "deleted message" copy, otherwise the raw string (or a "no messages" fallback) — no distinct
  attachment-only or decryption-failed placeholder branch. Consistent with
  [ChatMessageBubble](./chat-message-bubble.md)'s own missing decryption-failure state.

## Calls

Reads `conversationsProvider` (direct GraphQL, see [api.md](../api.md#shape-per-file)) and
`selectedConversationUserIdProvider` (write, on tap).
