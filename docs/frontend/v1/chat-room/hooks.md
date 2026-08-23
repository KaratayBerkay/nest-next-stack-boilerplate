# Chat Room — Hooks & Handlers

Page: [page.md](./page.md) · Source: [`src/views/chat-room/`](../../../../next-js-boilerplate/src/views/chat-room/)

Unlike [messages](../messages/hooks.md), this vertical has no `hooks/chat-room/` folder — its one
real hook and its send/select logic both live directly alongside the components in
`views/chat-room/`. Documented together here since together they're this vertical's entire
non-render logic layer.

### `useChatRoomRealtime`

[`useChatRoomRealtime.ts`](../../../../next-js-boilerplate/src/views/chat-room/useChatRoomRealtime.ts) —
subscribes the page to room-presence frames (`room-counts`, `room-members`, `user-joined`,
`user-left`) and issues the pull-based `get-room-counts`/`get-room-members` requests on mount and on
every room change (the pull covers a real race — see
[chat-room-base-view.md](./components/chat-room-base-view.md#usechatroomrealtime)). Returns the
`realtime` client itself so [ChatRoomBaseView](./components/chat-room-base-view.md) can also send
frames directly (`room-message`, `get-room-counts`) without a second `useRealtime()` call.

Has its own test file,
[`useChatRoomRealtime.test.ts`](../../../../next-js-boilerplate/src/views/chat-room/useChatRoomRealtime.test.ts) —
the only test file anywhere in this vertical.

### `useRoom`

[`useRoom.ts`](../../../../next-js-boilerplate/src/lib/realtime/useRoom.ts) — lives in
`src/lib/realtime/` (not `views/chat-room/`) but has exactly one real caller, `ChatRoomBaseView`; a
thin `useInfiniteQuery(roomMessagesQueryOptions(room))` wrapper, the room-message equivalent of
messages' `useConversation`. Re-exports `ChatRoomMessage` as a type alias for convenience at its call
site.

### `ChatRoomHandlers.tsx` (not a hook — two plain functions)

[`ChatRoomHandlers.tsx`](../../../../next-js-boilerplate/src/views/chat-room/ChatRoomHandlers.tsx):

- **`chatRoomHandleSend`** — the actual send orchestration. No-ops if there's no open `realtime`
  connection (see [page.md § How this differs from messages](./page.md#how-this-differs-from-messages--architecture));
  otherwise inserts an optimistic `pending: true` row directly into the `["room", room]` query-cache
  entry, then sends a `room-message` WS frame with a `tempId` for echo-matching (via
  [`trackTempId`](../messages/hooks.md), the same cross-page dedup helper messages uses).
- **`selectChatRoom`** — switches the active room: resets local member state, closes the mobile
  sidebar, re-claims the `chat-room` realtime page with the new room param, and issues a fresh
  `get-room-counts`. Also syncs the URL via `router.replace(?room=...)`, scroll-preserving
  (`{ scroll: false }`).

## Cross-cutting hooks used here but not chat-room-specific

`useAuth`, `useConnectionState`, `useAutoScroll`, `useYSwipeGesture`, `useQuery`/`useQueryClient`
(TanStack Query), [`useAttachmentUploads`](../messages/hooks.md#useattachmentuploads) — all defined
outside `views/chat-room/` and documented where first introduced (mostly in
[messages/hooks.md](../messages/hooks.md), since that's the other vertical that shares them).
