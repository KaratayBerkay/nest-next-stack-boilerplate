# Messages — API

Screen: [screen.md](./screen.md) · Client:
[`lib/api/client/messages/`](../../../../flutter-boilerplate/lib/api/client/messages/) · Server:
[`lib/api/server/messages/`](../../../../flutter-boilerplate/lib/api/server/messages/)

All calls use one shared `Dio` instance (`dioProvider`,
[`lib/lib/api_client.dart`](../../../../flutter-boilerplate/lib/lib/api_client.dart) — the doubled
`lib/lib/` segment is real, not a typo), base URL = `AppConfig.apiBaseUrl`. **Every file in this vertical hits the NestJS backend directly — confirmed
by reading all 13 server files, not inferred.** See
`CROSS-007` (resolved) for why this note exists explicitly
(an earlier, less-verified pass claimed otherwise) and
[../../../conventions.md § 9](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)
for the shape test applied to reach this conclusion.

## Shape per file

| File | Shape | Path/operation | Backend endpoint |
|---|---|---|---|
| [`send_message.dart`](../../../../flutter-boilerplate/lib/api/server/messages/send_message.dart) | Direct GraphQL (hand-rolled `_dio.post('/graphql', ...)`, no `gql_helper`) | `mutation SendMessage` | [Send a message (GraphQL)](../../../backend/messaging-realtime/messaging/endpoints.md#send-a-message-graphql) |
| [`delete_message.dart`](../../../../flutter-boilerplate/lib/api/server/messages/delete_message.dart) | Direct GraphQL | `mutation DeleteMessageForMe` / `DeleteMessageForEveryone` | [Mark messages read / delete for me / delete for everyone (GraphQL)](../../../backend/messaging-realtime/messaging/endpoints.md#mark-messages-read--delete-for-me--delete-for-everyone-graphql) |
| [`conversations.dart`](../../../../flutter-boilerplate/lib/api/server/messages/conversations.dart) | Direct GraphQL | `query Conversations` | [List conversations (GraphQL)](../../../backend/messaging-realtime/messaging/endpoints.md#list-conversations-graphql) |
| [`conversation_messages.dart`](../../../../flutter-boilerplate/lib/api/server/messages/conversation_messages.dart) | Direct GraphQL | `query ConversationMessages` | [Paginated conversation messages (GraphQL)](../../../backend/messaging-realtime/messaging/endpoints.md#paginated-conversation-messages-graphql) |
| [`mark_read.dart`](../../../../flutter-boilerplate/lib/api/server/messages/mark_read.dart) | Direct GraphQL | `mutation MarkMessagesRead` | same as delete above |
| [`dm_unread_count.dart`](../../../../flutter-boilerplate/lib/api/server/messages/dm_unread_count.dart) | Direct REST | `GET /api/messages/unread-count` | [Get total unread DM count](../../../backend/messaging-realtime/messaging/endpoints.md#get-total-unread-dm-count) |
| [`friends.dart`](../../../../flutter-boilerplate/lib/api/server/messages/friends.dart) | Direct REST | `GET /api/friends` | [List friends](../../../backend/messaging-realtime/messaging/endpoints.md#list-friends) |
| [`friend_requests.dart`](../../../../flutter-boilerplate/lib/api/server/messages/friend_requests.dart) | Direct REST | `GET /api/friends/requests` | [List pending friend requests](../../../backend/messaging-realtime/messaging/endpoints.md#list-pending-friend-requests) |
| [`accept_friend_request.dart`](../../../../flutter-boilerplate/lib/api/server/messages/accept_friend_request.dart), [`decline_friend_request.dart`](../../../../flutter-boilerplate/lib/api/server/messages/decline_friend_request.dart), [`send_friend_request.dart`](../../../../flutter-boilerplate/lib/api/server/messages/send_friend_request.dart) | Direct REST | `POST /api/friends/{accept,decline,request}/:userId` | [Send / accept / decline a friend request](../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request) |
| [`room_messages.dart`](../../../../flutter-boilerplate/lib/api/server/messages/room_messages.dart) | Direct REST | `GET /api/rooms/:room/messages` | [List / read / write chat rooms](../../../backend/messaging-realtime/messaging/endpoints.md#list--read--write-chat-rooms) — used by chat-room (Phase 3), not this screen directly |
| [`upload_attachment.dart`](../../../../flutter-boilerplate/lib/api/server/messages/upload_attachment.dart) | Direct REST | `POST /upload/attachment` (note: **not** `-stream` — mobile uses the buffered multipart endpoint; web's `useAttachmentUploads` uses the streamed variant for progress events) | [Upload a chat attachment](../../../backend/messaging-realtime/upload/endpoints.md#upload-a-chat-attachment) — ⚠ this call has no `scope` parameter anywhere in its chain, so it never sends the `x-scope-kind`/`x-scope-id` headers the backend reads; every mobile attachment (from this screen or [chat-room](../../../mobile/v1/chat-room/screen.md)) lands in the default DM storage folder — see `MOB-017` (resolved) |

No file here calls a favorite/unfavorite or conversation/room-attachments-gallery endpoint — matches
the confirmed absence of that UI on mobile (`CROSS-001` (resolved)). Also confirmed
absent app-wide, not just this vertical: the shared `AttachmentPreview` widget every attachment
preview on mobile renders through has no `thumbnailUrl` parameter at all, so the thumbnails the
[upload module](../../../backend/messaging-realtime/upload/README.md#thumbnail-generation) generates
never actually render on mobile — see `CROSS-027` (resolved), found while documenting
Phase 3b (upload + chat-room).

## Client layer (`lib/api/client/messages/`)

| File | Purpose |
|---|---|
| [`actions.dart`](../../../../flutter-boilerplate/lib/api/client/messages/actions.dart) | `messageActionsProvider` → `MessageActions` (`sendMessage`, `uploadAttachment`, `deleteMessageForMe`, `deleteMessageForEveryone`) — thin pass-through to the server files above, no optimistic-cache management (unlike web's `useMessageActions`, which patches the React Query cache before the call resolves) |
| [`query.dart`](../../../../flutter-boilerplate/lib/api/client/messages/query.dart) | `conversationsProvider`, `dmUnreadCountProvider` (both `FutureProvider`), plus `conversationMessagesProvider`/`roomMessagesProvider` — `StateNotifierProvider.family` classes doing manual pagination (`loadMore`/`refresh`/`appendLive`), Riverpod's answer to React Query's `useInfiniteQuery` |
| [`mark_read.dart`](../../../../flutter-boilerplate/lib/api/client/messages/mark_read.dart) | `markReadActionsProvider` — standalone, called from [ChatView](./widgets/chat-view.md)'s `initState`/`didUpdateWidget`, not bundled into `MessageActions` |

## No WebSocket send path

Unlike web (which prefers the WebSocket for sending and falls back to REST/GraphQL only when the
socket is down — see [frontend api.md § Send a message (client)](../../../frontend/v1/messages/api.md#send-a-message-client)),
mobile's `MessageActions.sendMessage` always calls the GraphQL mutation directly — there is no
socket-preferred path in `actions.dart`. Live delivery of *incoming* messages still arrives over the
WebSocket (`realtime_provider.dart`'s `direct-message` handler, referenced from
[ChatView](./widgets/chat-view.md)'s doc) — only the *send* action skips it. Worth confirming this is
intentional (simpler, one path) rather than a partial port, next time this file is touched.
