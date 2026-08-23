# ChatView

**Source:** [`ChatView.tsx`](../../../../../next-js-boilerplate/src/views/messages/ChatView.tsx) ·
utils: [`ChatView-utils.ts`](../../../../../next-js-boilerplate/src/views/messages/ChatView-utils.ts)
**Types:** [`ChatView-types.ts`](../../../../../next-js-boilerplate/src/types/messages/ChatView-types.ts)
**Used in:** [messages page](../page.md) — **not** literally shared with
[chat-room](../../chat-room/components/chat-room-base-view.md), confirmed by reading both trees: they
are architecturally similar (same orchestrator-composes-header/list/input shape) but chat-room has its
own separate component tree, sharing only the underlying hooks/API layer. See
[chat-room page.md § How this differs from messages](../../chat-room/page.md#how-this-differs-from-messages--architecture).
**Mobile equivalent:** [ChatView widget](../../../../mobile/v1/messages/widgets/chat-view.md)

## Purpose

The open-conversation pane's orchestrator — owns message-send/delete/reply state, the attachment
upload flow, infinite-scroll message loading, and connection-state rendering. Composes
[ChatViewHeader](./chat-view-header.md), [ChatMessageList](./chat-message-list.md),
[ReplyBanner](./reply-banner.md), [StorageLimitNotice](./storage-limit-notice.md),
[ChatInputBar](./chat-input-bar.md), `AttachmentModal` (shared, not messages-specific), and
[AttachmentGallerySheet](./attachment-gallery-sheet.md).

## Props (`ChatViewProps`)

`selectedUser`, `user`, `setSelectedUser`, `setSidebarOpen`, `onlineUsers`, `connectionState`.

## State & behavior notes

- **Reply state resets on peer switch without a remount**: `ChatView` isn't keyed by
  `selectedUser.id` at its call site, so switching conversations doesn't naturally clear
  `replyTarget`. Fixed via React's "adjust state during render" pattern (`if (selectedUser.id !==
  replyTargetPeerId) { setReplyTargetPeerId(...); setReplyTarget(null); }`) rather than an effect —
  deliberate, to avoid an extra render pass.
- **Message data**: `useConversation(selectedUser.id)` (an infinite query,
  `src/lib/realtime/useConversation.ts` — realtime-aware, not messages-specific) returns pages
  newest-first; `conversationMessages` reverses and flattens them for display.
- **Connection-state gating**: renders a dedicated "reconnecting" skeleton for
  `connectionState === "connecting"` and a `ConnectionUnstable` notice for `"unstable"`, before
  attempting to render the normal message list/input at all.
- **Storage-limit gating**: `messageUsageQueryOptions()` (backend
  [Get message-storage usage](../../../../backend/billing-usage/usage/endpoints.md#get-message-storage-usage))
  determines `storageLimitReached`; when true, [StorageLimitNotice](./storage-limit-notice.md)
  replaces the reply banner + input bar entirely (not just the input).

### `ChatView-utils.ts`

- `chatViewHandleSend` — the actual send orchestration (see **Calls** below).
- `chatViewHandleDelete` — thin wrapper around `deleteMessage`, mapping a thrown error to
  `setMessageError`.
- `groupMessagesByDate` — buckets a flat message array into day groups for
  [ChatMessageList](./chat-message-list.md).
- `toReplyPreview` — projects a full `Message` down to the `ReplyPreview` shape
  [ReplyBanner](./reply-banner.md) expects.
- `formatMessageTime` — per-bubble timestamp formatting, respecting `dateDisplay`.

## Calls

`handleSend`/`handleSendAttachments` both funnel through `chatViewHandleSend`, which calls
`useMessageActions().sendMessage()` — see [api.md § Send a message (client)](../api.md#send-a-message-client)
for the WS-preferred, REST-fallback logic. `handleDeleteMessage` → `chatViewHandleDelete` →
`useMessageActions().deleteMessage()` — see
[api.md § Delete a message (BFF route)](../api.md#delete-a-message-bff-route).
