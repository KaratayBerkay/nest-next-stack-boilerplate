# ChatRoomMainContent

**Source:** [`ChatRoomMainContent.tsx`](../../../../../next-js-boilerplate/src/views/chat-room/ChatRoomMainContent.tsx) ·
sub-components: [`ChatRoomSubComponents.tsx`](../../../../../next-js-boilerplate/src/views/chat-room/ChatRoomSubComponents.tsx)
**Types:** [`ChatRoomMainContent-types.ts`](../../../../../next-js-boilerplate/src/types/chat-room/ChatRoomMainContent-types.ts)
**Used in:** [ChatRoomBaseView](./chat-room-base-view.md)
**Mobile equivalent:** [ChatRoomMainContent widget](../../../../mobile/v1/chat-room/widgets/chat-room-main-content.md)

## Purpose

The right-hand pane: connection-state gating, a mobile hamburger + room name header row, the message
list, the "scroll to bottom" affordance, and the full composer (attach / emoji / text / send).
Combines what [messages](../../messages/page.md) splits across
[ChatViewHeader](../../messages/components/chat-view-header.md) +
[ChatInputBar](../../messages/components/chat-input-bar.md) into one component.

## Props (`ChatRoomMainContentProps`)

`room`, `roomCounts`, `connectionState`, `messages`, `userId`, `onlineUserIds`, `msgsLoading`,
`msgsError`, `hasNextPage`, `onFetchNextPage`, `input`, `attaching`, `uploadItems`, `bottomRef`,
`messagesRef`, `isAtBottom`, `onOpenGallery` (optional — folder icon only renders when supplied, same
pattern as [ChatViewHeader](../../messages/components/chat-view-header.md#props-chatviewheaderprops)'s
`onOpenGallery`), `t`, `tErr`, plus the composer callbacks (`onSetSidebarOpen`, `onSetInput`, `onSend`,
`onAttachFiles`, `onRemoveUploadItem`, `onCancelUploads`, `onSendAttachments`).

## Behavior notes

- **Connection-state gating happens here**, not in `ChatRoomBaseView`: `connectionState === "locked"`
  renders a distinct "tab locked" notice (a multi-tab WS-ownership concept — see
  [realtime](../../../../backend/messaging-realtime/realtime/README.md)) before even attempting the
  normal layout; `"unstable"` renders `ConnectionUnstable`. Both replace the entire pane, not just the
  input.
- Emoji insertion (`insertEmojiAtCursor`) manipulates the input's `selectionStart`/`selectionEnd`
  directly via a ref rather than tracking cursor position in state.
- Send button disables on `attaching || uploadItems.length > 0` — WhatsApp-style, same intent as
  [messages' ChatInputBar](../../messages/components/chat-input-bar.md#behavior-notes): once files are
  staged, `AttachmentModal`'s own Send is the only path that ships text + attachments together.

## Sub-components (in `ChatRoomSubComponents.tsx`)

| Component | Renders |
|---|---|
| `HamburgerButton` | Mobile-only room-name + online-count row that opens the sidebar |
| `MessageInput` | The text field |
| `SendButton` | Send icon button |
| `AttachButton` | Hidden `<input type=file multiple>` behind a styled label |
| `EmojiButton` | Wraps the shared `EmojiPickerButton` |
