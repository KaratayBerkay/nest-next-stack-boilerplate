# ChatMessageList (widget)

**Source:** [`chat_message_list.dart`](../../../../../flutter-boilerplate/lib/views/messages/chat_message_list.dart)
**Used in:** [ChatView](./chat-view.md)
**Web equivalent:** [ChatMessageList component](../../../../frontend/v1/messages/components/chat-message-list.md)

## Purpose

`ConsumerWidget` — a plain `ListView.builder` over `conversationMessagesProvider(conversationId)`'s
state (ascending/oldest-first, matching a bottom-anchored scroll — see
[api.md](../api.md#client-layer-libapiclientmessages)), with a "Load earlier" button injected as
item 0 when more history exists.

## Behavior notes vs. web

- **No day-grouping** — web buckets messages into date-headed groups
  (`groupMessagesByDate`/`ChatMessageList`'s rendering); this widget renders one flat list with no
  date separators. Not necessarily a bug — could be an intentional mobile simplification — but a
  real UI difference worth confirming is deliberate.
- **No decryption-failure banner** — web shows a list-level rollup warning when any visible message
  failed to decrypt; no equivalent check here (consistent with
  [ChatMessageBubble](./chat-message-bubble.md)'s own missing per-bubble indicator).
- Bottom padding (24px) is deliberately part of the scrollable content, not a sibling gap — the
  code comment notes this is so "scroll to bottom" naturally settles with the gap already showing.

## Calls

Reads `conversationMessagesProvider(conversationId)` (direct GraphQL, `conversation_messages.dart`
— see [api.md](../api.md#shape-per-file)) and `loadMore()` on that same provider's notifier for
pagination.
