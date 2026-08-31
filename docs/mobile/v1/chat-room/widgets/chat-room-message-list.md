# ChatRoomMessageList (widget)

**Source:** [`chat_room_message_list.dart`](../../../../../flutter-boilerplate/lib/views/chat_room/chat_room_message_list.dart)
**Used in:** [ChatRoomMainContent](./chat-room-main-content.md)
**Web equivalent:** [ChatRoomMessageList component](../../../../frontend/v1/chat-room/components/chat-room-message-list.md)

## Purpose

`StatelessWidget` — a plain `ListView.builder` over the message list passed in, with a "Load earlier"
button injected as item 0 when more history exists. No day-grouping, same simplification
[messages' equivalent widget](../../messages/widgets/chat-message-list.md#behavior-notes-vs-web)
makes relative to web.

## Constructor

`messages`, `hasMore`, `isLoadingMore`, `onLoadMore`, `userId`, `onlineUserIds`, `msgsLoading`,
`msgsError`, `scrollController`.

## Behavior notes vs. web

- **No per-message actions** — no delete, no reply, no long-press menu. Matches web exactly (the
  backend has no such capability for room messages at all — see
  [CROSS-024](../../../../issues.md#cross-024)), so this is *not* a mobile-specific gap.
- **No read/delivered tick** — rooms have no per-user read-tracking; consistent across both platforms.
- ⚠ Two hardcoded, unlocalized string literals: `'Failed to load messages'` (also hardcoded on web —
  a shared, cross-platform gap, not mobile-only) and `'No messages yet'` (web correctly uses `t.noMessages`
  here; the matching ARB key `chatRoomNoMessages` exists on mobile and goes unused). See
  `MOB-015` (resolved).
- ⚠ **Renders attachments via the shared `AttachmentPreview` widget without passing `thumbnailUrl`**
  — the loop (`for (final att in msg.attachments) ... AttachmentPreview(url: att.url, type: att.type,
  name: att.name)`) never reads `att.thumbnailUrl`, even though `MessageAttachment.fromJson` parses
  and retains it correctly. The widget itself has no `thumbnailUrl` parameter to pass regardless — see
  `CROSS-027` (resolved).

## Calls

None directly — pure presentational widget, all data via constructor parameters (matches web's
equivalent, which is also "pure presentational — all data comes from props").
