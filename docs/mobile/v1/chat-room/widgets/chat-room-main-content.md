# ChatRoomMainContent (widget)

**Source:** [`chat_room_main_content.dart`](../../../../../flutter-boilerplate/lib/views/chat_room/chat_room_main_content.dart) ·
sub-components: [`chat_room_sub_components.dart`](../../../../../flutter-boilerplate/lib/views/chat_room/chat_room_sub_components.dart)
**Used in:** [ChatRoomBaseView](./chat-room-base-view.md)
**Web equivalent:** [ChatRoomMainContent component](../../../../frontend/v1/chat-room/components/chat-room-main-content.md)

## Purpose

`StatelessWidget` — connection-state gating (`locked`/`unstable` short-circuit before the normal
layout, same as web), the hamburger header row, [ChatRoomMessageList](./chat-room-message-list.md),
an inline `EmojiPicker` panel (toggled, not a popover), a pending-attachment chip, and the composer
row (emoji/attach/input/send).

## Constructor

`useNativeControls` (accepted, never read — see [MOB-014](../../../../issues.md#mob-014)), `room`,
`roomCounts`, `connectionState`, `messages`, `hasMore`, `isLoadingMore`, `onLoadMore`, `userId`,
`onlineUserIds`, `msgsLoading`, `msgsError`, `messageController`, `scrollController`, `isAtBottom`,
`attaching`, `emojiOpen`, `pendingAttachment`, `onSetSidebarOpen`, `onSend`, `onAttachFile`,
`onRemoveAttachment`, `onToggleEmoji`.

## Behavior notes vs. web

- **Single attachment only** (`pendingAttachment` is one nullable value, shown as a dismissible chip
  above the composer) — web supports multiple staged attachments via the shared `AttachmentModal`.
  Same gap shape as [messages' `ChatInputBar` widget](../../messages/widgets/chat-input-bar.md#behavior-notes-vs-web).
- Emoji insertion (`_insertEmojiAtCursor`) manipulates `TextEditingController.selection` directly,
  same intent as web's cursor-position manipulation.
- Send disables on `connectionState != 'online' || (text empty && no attachment) || attaching` —
  matches web's composer-disable logic exactly.

## Sub-components (in `chat_room_sub_components.dart`)

| Widget | Renders | Localized? |
|---|---|---|
| `HamburgerButton` | Room name + online-count row, opens the sidebar | Semantics label falls back to `AppLocalizations.of(context).chatRoomOpenRooms` |
| `MessageInput` | The text field | Placeholder falls back to `AppLocalizations.of(context).chatRoomTypeMessage` |
| `ComposerIconButton` | Emoji/attach icon buttons (loading-spinner variant for attach-in-flight) | Tooltip passed in by the caller |
| `SendButton` | Send icon button | Tooltip falls back to `AppLocalizations.of(context).chatRoomSend` |
