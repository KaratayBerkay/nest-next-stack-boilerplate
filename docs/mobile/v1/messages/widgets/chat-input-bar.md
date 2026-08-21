# ChatInputBar (widget)

**Source:** [`chat_input_bar.dart`](../../../../../flutter-boilerplate/lib/views/messages/chat_input_bar.dart)
**Used in:** [ChatView](./chat-view.md)
**Web equivalent:** [ChatInputBar component](../../../../frontend/v1/messages/components/chat-input-bar.md)

## Purpose

`ConsumerStatefulWidget` — text field, emoji picker (inline panel, not a popover like web), single
attachment picker, and send button. Owns its own typing-indicator timer locally (no shared hook
equivalent to web's [`useTypingIndicator`](../../../../frontend/v1/messages/hooks.md#usetypingindicator) —
the debounce logic is duplicated here as private `_isTyping`/`_typingStopTimer` state).

## Constructor

`conversationId` (required), `onSent` (optional callback, triggers [ChatView](./chat-view.md)'s
scroll-to-bottom).

## Behavior notes vs. web

- **Single attachment only** — `_pendingAttachment` is one nullable field, not a list; web supports
  multiple staged attachments per message via `useAttachmentUploads`. Sending is blocked while
  `_attaching` (upload in flight), matching web's intent but with a narrower ceiling.
- **File picker uses a fixed extension allow-list** (`jpg/jpeg/png/webp/gif/avif/pdf/doc/docx/txt`)
  passed to `FilePicker.pickFiles` directly, rather than referencing a shared constant the way web's
  `ATTACHMENT_ACCEPT` does — worth checking these two lists stay in sync if either changes.
  Oversized files (`file.size > ChatConstants.maxAttachmentSize`) are rejected client-side before
  upload starts, same intent as web's size handling.
- Enter/IME-submit calls `_sendMessage` directly (`onSubmitted`), same UX as web's Enter-to-send.

## Calls

Upload: `messageActionsProvider.uploadAttachment(path, name)` → direct REST `POST
/upload/attachment` (see [api.md](../api.md#shape-per-file), buffered — not the streamed-progress
variant web's equivalent flow uses). Send: see [ChatView § Calls](./chat-view.md#calls).
