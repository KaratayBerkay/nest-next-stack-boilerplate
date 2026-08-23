# ChatRoomBaseView

**Source:** [`ChatRoomBaseView.tsx`](../../../../../next-js-boilerplate/src/views/chat-room/ChatRoomBaseView.tsx) ·
handlers: [`ChatRoomHandlers.tsx`](../../../../../next-js-boilerplate/src/views/chat-room/ChatRoomHandlers.tsx) ·
realtime: [`useChatRoomRealtime.ts`](../../../../../next-js-boilerplate/src/views/chat-room/useChatRoomRealtime.ts)
**Types:** [`ChatRoomBaseView-types.ts`](../../../../../next-js-boilerplate/src/types/chat-room/ChatRoomBaseView-types.ts)
**Used in:** [chat-room page](../page.md) (all four tier views wrap this one component)
**Mobile equivalent:** [ChatRoomBaseView widget](../../../../mobile/v1/chat-room/widgets/chat-room-base-view.md)

## Purpose

The page's orchestrator — owns room selection, message-send state, the attachment upload flow,
infinite-scroll message loading, and connection-state rendering. Wraps `ChatRoomContent` in a
`Suspense` boundary (`ChatRoomFallback`). Composes
[ChatRoomHeader](./chat-room-header.md), [ChatRoomSidebar](./chat-room-sidebar.md),
[ChatRoomMainContent](./chat-room-main-content.md), and
[RoomAttachmentGallerySheet](./room-attachment-gallery-sheet.md).

## Props (`ChatRoomBaseViewProps`)

`initialRoom` (default `"general"`), `showPageInfo`, `vipRooms` (default `[]`), `showSelfCrown`,
`className` — all supplied by the tier view that renders it (see [page.md](../page.md)).

## State & behavior notes

- **Room list**: `[...dbRooms.map(r => r.slug), ...vipRooms]` — `dbRooms` comes from a real
  `useQuery(roomsQueryOptions())` call (`GET /api/rooms`), so the fixed public rooms are genuinely
  fetched, not hardcoded; `vipRooms` (the tier-supplied `["vip-lounge"]`) is appended client-side on
  top of whatever the backend returns.
- **Send is WebSocket-only, no REST/GraphQL fallback**: `chatRoomHandleSend` (in
  `ChatRoomHandlers.tsx`) no-ops silently if `realtime` is falsy — unlike
  [messages' send](../../messages/components/chat-view.md#calls), which falls back to REST when the
  socket is down. A user who sends while disconnected simply loses the click (the Send button is
  independently disabled while `connectionState !== "online"`, so this mostly matters for a message
  typed just as the connection drops).
- **Optimistic insert is hand-rolled here**, not delegated to a shared cache-patching hook the way
  [`useMessageActions`](../../messages/api.md#send-a-message-client) does for DMs:
  `chatRoomHandleSend` directly calls `queryClient.setQueryData(["room", room], ...)` to append a
  `pending: true` row keyed by a `temp-<timestamp>` id, deduped by id so a duplicate frame echo is a
  no-op.
- **No `replyToId` anywhere in the send payload** — see [page.md § Known issues](../page.md#known-issues-affecting-this-page),
  [CROSS-024](../../../../issues.md#cross-024).
- **Room switching** (`selectChatRoom`) resets `roomMembers` and closes the mobile sidebar overlay,
  then both updates local state and calls `router.replace(?room=...)` (URL sync, no navigation) —
  switching rooms doesn't remount this component, so [`useChatRoomRealtime`](#usechatroomrealtime)
  re-subscribes to the new room's presence events via its own `room` dependency rather than a fresh
  mount.
- **Manual scroll-to-bottom via `useAutoScroll`** — same shared hook messages uses, keyed off the
  flattened `messages` array.

### `useChatRoomRealtime`

Not a page-level hook in `hooks/chat-room/` — it lives alongside the component in
`views/chat-room/useChatRoomRealtime.ts` (this vertical has no `hooks/` folder of its own; see
[hooks.md](../hooks.md)). Subscribes to `room-counts`/`room-members`/`user-joined`/`user-left` frames
and issues `get-room-counts`/`get-room-members` on mount and room change — the pull-based
`get-room-members` call exists specifically to cover a real race (a client joining a room after
others are already present gets no `user-joined` broadcast for those pre-existing members) — see
[realtime/endpoints.md](../../../../backend/messaging-realtime/realtime/endpoints.md) for the
`get-room-members` handler this depends on.

## Calls

`handleSend`/`handleSendAttachments` → `chatRoomHandleSend` → `realtime.send({type: "room-message",
...})` — see
[messaging/endpoints.md § WebSocket Events](../../../../backend/messaging-realtime/messaging/endpoints.md#websocket-events)
(`room-message` row). Attachment upload:
[`useAttachmentUploads`](../../messages/hooks.md#useattachmentuploads) →
[upload/endpoints.md § Stream a chat attachment upload](../../../../backend/messaging-realtime/upload/endpoints.md#stream-a-chat-attachment-upload),
called with `{ kind: "chat-room", id: room }` as the upload scope (see
[upload/README.md § Upload scoping](../../../../backend/messaging-realtime/upload/README.md#upload-scoping--one-endpoint-two-composers)).
