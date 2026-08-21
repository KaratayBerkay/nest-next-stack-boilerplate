# ChatInputBar

**Source:** [`ChatInputBar.tsx`](../../../../../next-js-boilerplate/src/views/messages/ChatInputBar.tsx)
**Types:** [`ChatInputBar-types.ts`](../../../../../next-js-boilerplate/src/types/messages/ChatInputBar-types.ts)
**Used in:** [ChatView](./chat-view.md)
**Mobile equivalent:** [ChatInputBar widget](../../../../mobile/v1/messages/widgets/chat-input-bar.md)

## Purpose

Text input + attach + emoji + send, disabled whenever `connectionState !== "online"`.

## Props (`ChatInputBarProps`)

`input`/`setInput`, `messageError`, `handleSend`, `connectionState`, `inputPlaceholder`,
`connectingLabel`, `recipientId`, `onTypingStart`/`onTypingStop`, `attaching`, `uploadItems`,
`onAttachFiles`, `chatWindowRef` (passed through to the emoji picker for width-matching).

## Behavior notes

- Wraps [`useTypingIndicator`](../hooks.md#usetypingindicator) (`recipientId`, `onTypingStart`,
  `onTypingStop`) — every keystroke calls `notifyTyping`, which the hook debounces into
  start/stop events.
- **Blocks Send while an attachment is uploading or staged** (`attaching || uploadItems.length > 0`)
  — WhatsApp-style: once files are attached, the [attachment modal](../hooks.md#useattachmentuploads)'s
  own Send button is the only path that ships text + attachments together, not this bar's button.
- Enter sends (unless Shift is held); the file `<input>` is visually hidden behind a styled `<label>`
  for consistent theming across browsers.

## Calls

`handleSend` is a callback supplied by [ChatView](./chat-view.md) — this component never calls a
mutation itself. See [chat-view.md § Calls](./chat-view.md#calls) for the full send chain (prefers
WebSocket, falls back to the [Send a message (BFF route)](../api.md#send-a-message-bff-route)).
