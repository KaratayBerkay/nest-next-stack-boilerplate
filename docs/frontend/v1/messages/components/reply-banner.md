# ReplyBanner

**Source:** [`ReplyBanner.tsx`](../../../../../next-js-boilerplate/src/views/messages/ReplyBanner.tsx)
**Types:** [`ReplyBanner-types.ts`](../../../../../next-js-boilerplate/src/types/messages/ReplyBanner-types.ts)
**Used in:** [ChatView](./chat-view.md) (above [ChatInputBar](./chat-input-bar.md), only while a reply is staged)
**Mobile equivalent:** none found in the mobile widget list — a Flutter equivalent may not exist yet; not confirmed as a gap since reply-to itself needs verification on mobile (check during a later pass).

## Purpose

Shows the message being replied to (sender label + a one-line preview) above the input bar, with a
cancel affordance. Purely presentational — the actual `replyTarget` state lives in
[ChatView](./chat-view.md).

## Props (`ReplyBannerProps`)

`replyTarget` (a `ReplyPreview` — see the backend's
[`ReplyPreview` model](../../../../backend/messaging-realtime/messaging/README.md)), `isReplyToMe`
(swaps the sender label to "You"), `peerName`, `onCancel`.

## Behavior notes

Preview text priority mirrors [ChatMessageBubble](./chat-message-bubble.md)'s own reply-preview
logic exactly (deleted → attachment-only → decryption-failed → body) — if one ever changes, check
whether the other should too.
