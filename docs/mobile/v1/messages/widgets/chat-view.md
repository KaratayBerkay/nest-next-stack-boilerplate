# ChatView (widget)

**Source:** [`chat_view.dart`](../../../../../flutter-boilerplate/lib/views/messages/chat_view.dart)
**Used in:** [screen.md](../screen.md)
**Web equivalent:** [ChatView component](../../../../frontend/v1/messages/components/chat-view.md)

## Purpose

`ConsumerStatefulWidget` — the open-conversation orchestrator: mark-read triggering, scroll
management, and composing [ChatViewHeader](./chat-view-header.md),
[ChatMessageList](./chat-message-list.md), [ChatInputBar](./chat-input-bar.md).

## Constructor

`conversationId` (required), `lang` (required).

## Behavior notes vs. web

- **Mark-read is triggered from three places**, more aggressively than web: `initState`,
  `didUpdateWidget` (peer switch), and inline inside `build()` whenever the latest message id changes
  and it's unread + not from the current user. The in-`build` trigger's own comment explains why:
  live delivery's own inline mark-read (in `realtime_provider.dart`'s `direct-message` handler) only
  catches a message arriving at exactly the right instant — this redundant path catches bursts, and
  messages that land moments before this conversation becomes active.
- **Manual scroll-to-bottom settling** (`_settleToBottom`, up to 8 recursive post-frame-callback
  attempts) works around `ListView`'s `maxScrollExtent` being only an estimate until every
  intervening item has actually been laid out — a long conversation needs several frames of
  "jump, remeasure, jump again" before a real animated scroll can target the true bottom. Web has no
  equivalent complexity here (`useAutoScroll` relies on DOM `scrollHeight`, always exact).
- **No reply state** — no `replyTarget` equivalent exists (see
  `CROSS-006` (resolved)); this widget is correspondingly simpler than its web
  counterpart, which owns reply staging/cancellation on top of everything above.
- **No storage-limit gating** — no equivalent of web's `StorageLimitNotice` swap-in. Confirmed a real
  gap, not just out of Phase 0's scope: the limit **is** enforced server-side identically on both
  platforms (`UsageService.assertCanSendMessage`), but nothing in mobile's chat composer reads
  `messageUsageProvider`/`storageUsageProvider` to pre-emptively block sending — a mobile user who
  hits the cap gets a real, hard send failure with no advance warning instead of this widget's web
  counterpart's graceful pre-emptive block. See
  [frontend StorageLimitNotice § Mobile equivalent](../../../../frontend/v1/messages/components/storage-limit-notice.md)
  and `CROSS-033` (resolved).

## Calls

Mark-read: `markReadActionsProvider` → direct GraphQL (see
[api.md § Shape per file](../api.md#shape-per-file), `mark_read.dart`) →
[messaging/endpoints.md § Mark messages read / delete for me / delete for everyone (GraphQL)](../../../../backend/messaging-realtime/messaging/endpoints.md#mark-messages-read--delete-for-me--delete-for-everyone-graphql).
Send/list/delete are delegated to [ChatInputBar](./chat-input-bar.md)/[ChatMessageList](./chat-message-list.md)/
[ChatMessageBubble](./chat-message-bubble.md) respectively — this widget doesn't call those actions
itself.
