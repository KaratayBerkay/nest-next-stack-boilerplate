# ChatMessageList

**Source:** [`ChatMessageList.tsx`](../../../../../next-js-boilerplate/src/views/messages/ChatMessageList.tsx)
**Types:** [`ChatMessageList-types.ts`](../../../../../next-js-boilerplate/src/types/messages/ChatMessageList-types.ts)
**Used in:** [ChatView](./chat-view.md)
**Mobile equivalent:** [ChatMessageList widget](../../../../mobile/v1/messages/widgets/chat-message-list.md)

## Purpose

Scrollable message list: day-grouped, oldest-at-top, with a "Load earlier" affordance at the top and
a decryption-failure banner when any visible message failed to decrypt. Pure presentational — all
data comes from props (grouped by [`groupMessagesByDate`](./chat-view.md#chatview-utilsts), computed
in `ChatView`).

## Props (`ChatMessageListProps`)

`messagesRef` (swipe-gesture ref), `msgsError`, `hasNextPage`, `onFetchNextPage`, `groupedMessages`,
`conversationMessages` (flat list, used only for the decryption-failure check), `user`,
`selectedUser`, `dateDisplay`, `bottomRef` (scroll anchor), `onDelete`, `onReply`, `t` (a narrowed
i18n subset: `failedToLoad`/`noMessages`/`decryptionFailed`).

## Behavior notes

- Renders one [`ChatMessageBubble`](./chat-message-bubble.md) per message, passing `onDelete`/
  `onReply` straight through unchanged (this component doesn't intercept them).
- The decryption-failure banner (`hasDecryptionFailure`) is a **list-level** rollup of the same
  per-message check `ChatMessageBubble` does individually — shown once at the top when *any* visible
  message qualifies, in addition to each affected bubble's own inline indicator.
- Date groups use `group.date === new Date().toLocaleDateString() ? "Today" : group.date` — a
  browser-locale string, not passed through `dateDisplay`/`formatDateByPreference` like every other
  timestamp in this vertical (worth a second look if group-header dates ever look inconsistent with
  bubble timestamps in a non-default locale).
