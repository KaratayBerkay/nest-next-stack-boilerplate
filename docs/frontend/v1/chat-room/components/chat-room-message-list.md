# ChatRoomMessageList

**Source:** [`ChatRoomMessageList.tsx`](../../../../../next-js-boilerplate/src/views/chat-room/ChatRoomMessageList.tsx)
**Types:** [`ChatRoomMessageList-types.ts`](../../../../../next-js-boilerplate/src/types/views/chat-room/ChatRoomMessageList-types.ts)
**Used in:** [ChatRoomMainContent](./chat-room-main-content.md)
**Mobile equivalent:** [ChatRoomMessageList widget](../../../../mobile/v1/chat-room/widgets/chat-room-message-list.md)

## Purpose

Scrollable message list for the active room: skeleton loading state, a "Load earlier" button, a
decryption-failure banner, and one row per message (avatar + name for others' messages, no avatar/name
for the viewer's own, matching a standard chat-bubble layout). Pure presentational — all data comes
from props, no day-grouping (contrast [messages' `ChatMessageList`](../../messages/components/chat-message-list.md),
which buckets into date-headed groups; this list renders one flat sequence).

## Props (`ChatRoomMessageListProps`)

`messages`, `userId`, `onlineUserIds`, `msgsLoading`, `msgsError`, `hasNextPage`, `onFetchNextPage`,
`bottomRef`, `t`.

## Behavior notes

- **Link cards** (added post-docs): every http(s) URL in a message body renders a
  [ChatLinkCard](../../messages/components/chat-link-card.md) under the bubble — copyable always, clickable only when it passes the
  strict https/public-domain policy documented there.

- **No per-message actions at all** — no delete, no reply, no context menu of any kind. Contrast
  [ChatMessageBubble](../../messages/components/chat-message-bubble.md), which has a hover-revealed
  reply/delete menu. This isn't a missing affordance; the backend has nothing to call (see
  [page.md § Known issues](../page.md#known-issues-affecting-this-page),
  `CROSS-024` (resolved — fixed 2026-09-03: chat rooms now have reply-to and delete (for me / for everyone) end to end — `RoomMessage.replyToId`/`deletedAt` + `RoomMessageDeletion`, `POST rooms/:roomSlug/messages/:messageId/delete-for-me|delete-for-everyone`, a `room-message-deleted` WS frame, and matching UI in both web apps and Flutter)).
- **No read/delivered tick** — rooms have no per-user read-tracking concept at all (no equivalent of
  DM's `message-read`/`message-delivered` WS events for rooms).
- Decryption-failure detection is the same heuristic as messages' list-level rollup
  (`body == null || body === ""` with no attachments), shown once at the top when any visible message
  qualifies.
- Renders attachments via the shared `AttachmentPreview`, passing `thumbnailUrl` through — the
  generated thumbnail (see
  [upload/README.md § Thumbnail generation](../../../../backend/messaging-realtime/upload/README.md#thumbnail-generation))
  genuinely renders here on web (contrast mobile's equivalent widget, which doesn't pass it at all —
  `CROSS-027` (resolved)).
