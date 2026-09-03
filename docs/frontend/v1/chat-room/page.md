# Chat Room (page)

**Route:** `/v1/[lang]/chat-room` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/chat-room/page.tsx)
**Mobile equivalent:** [chat-room screen](../../../mobile/v1/chat-room/screen.md)

## What renders here

Server component. Resolves the session user and the query-string `?room=` param (defaults to
`"general"` if absent), then hands off to `getTierView()`, same pattern as
[messages](../messages/page.md):

```ts
const VIEWS = { FREE: FreePageView, BASIC: BasicPageView, MEDIUM: MediumPageView, PREMIUM: PremiumPageView };
```

| Tier | View file | Adds |
|---|---|---|
| Free | [`FreePageView.tsx`](../../../../next-js-boilerplate/src/views/chat-room/FreePageView.tsx) | `showPageInfo` (the info-icon dialog) |
| Basic | `BasicPageView.tsx` | nothing — `export const BasicPageView = FreePageView;`, a real alias, not a duplicate file (contrast `FE-010` (resolved), the *wrong* pattern this repo has elsewhere) |
| Medium | `MediumPageView.tsx` | `vipRooms={["vip-lounge"]}` |
| Premium | `PremiumPageView.tsx` | `vipRooms={["vip-lounge"]}` + `showSelfCrown` (a crown badge next to the viewer's own name in the online-members list) |

All four wrap the same `ChatRoomBaseView` (per `FreePageView.tsx`) — not independently reusable, same
rationale as every other tier-branched page in this codebase. Nothing here is a real capability gate;
`vipRooms` only affects which rooms this page's *sidebar* renders a crown icon next to and offers
navigation into — the backend's own tier gate (`hasRoomTierAccess`, `MEDIUM`+ for any `vip-`-prefixed
room) is the actual enforcement, checked independently on every join/read/send.

## How this differs from messages — architecture

**Chat-room has its own, separate component tree** — it does **not** reuse
[`ChatView`](../messages/components/chat-view.md)/[`ChatMessageList`](../messages/components/chat-message-list.md)/
[`ChatInputBar`](../messages/components/chat-input-bar.md)/[`ChatMessageBubble`](../messages/components/chat-message-bubble.md)
from the messages vertical, despite `chat-view.md`'s own doc describing itself as "also reused
conceptually by chat-room" — that turned out to mean *architecturally similar*, not *literally
shared*. Confirmed by reading both trees directly: `chat-room`'s components
(`ChatRoomBaseView`/`ChatRoomHeader`/`ChatRoomSidebar`/`ChatRoomMainContent`/`ChatRoomMessageList`)
are a completely independent implementation, styled as a Discord/Slack-style room UI (room list +
online-members sidebar, `#room-name` header) rather than messages' WhatsApp-style DM list.

**What genuinely is shared**, confirmed by import:

- [`useAttachmentUploads`](../messages/hooks.md#useattachmentuploads) — the hook's own doc comment
  already says "shared by messages and chat-room composers," and this page's use of it confirms that.
- `roomsQueryOptions`, `roomMessagesQueryOptions`, `roomAttachmentsQueryOptions` — all from
  `api/client/messages/{rooms,query}.ts`. **This page has no API layer of its own at all** — see
  [api.md](./api.md).
- Generic, non-messaging UI primitives: `AttachmentModal`, `ConnectionUnstable`,
  `ScrollToBottomButton`, `AttachmentPreview`, `LoadEarlierButton`, `EmojiPickerButton`,
  `PageInfoButton`.

So the honest answer to "how does chat-room relate to messages" is: **separate component tree,
shared data/hook layer** — not a fork of the same components, not a fully independent feature either.

## Client component tree

```
ChatRoomBaseView                          (Suspense wrapper around ChatRoomContent)
└─ ChatRoomContent
   ├─ ChatRoomHeader                      (avatar, connection dot, page-info)
   ├─ ChatRoomSidebar                     (room list tab + online-members tab)
   ├─ ChatRoomMainContent
   │   ├─ ChatRoomMessageList
   │   ├─ composer chrome (attach/emoji/input/send — small leaves defined in ChatRoomSubComponents.tsx)
   │   └─ AttachmentModal                 (shared, not chat-room-specific)
   └─ RoomAttachmentGallerySheet          ("All uploads" side panel, opened from the header's folder icon)
```

`ChatRoomSubComponents.tsx` holds several small presentational pieces
(`SidebarCloseButton`/`RoomButton`/`HamburgerButton`/`MessageInput`/`SendButton`/`AttachButton`/
`EmojiButton`) — per [conventions.md §2](../../../conventions.md#2-file-naming) these are folded into
the docs for the components that render them
([chat-room-sidebar.md](./components/chat-room-sidebar.md),
[chat-room-main-content.md](./components/chat-room-main-content.md)) rather than each getting its own
file.

## Components

6 significant components in
[`src/views/chat-room/`](../../../../next-js-boilerplate/src/views/chat-room/):

[chat-room-base-view.md](./components/chat-room-base-view.md) ·
[chat-room-header.md](./components/chat-room-header.md) ·
[chat-room-sidebar.md](./components/chat-room-sidebar.md) ·
[chat-room-main-content.md](./components/chat-room-main-content.md) ·
[chat-room-message-list.md](./components/chat-room-message-list.md) ·
[room-attachment-gallery-sheet.md](./components/room-attachment-gallery-sheet.md)

## Hooks & API

- [hooks.md](./hooks.md) — `useChatRoomRealtime`, plus the non-hook `ChatRoomHandlers.tsx` send/select
  helpers
- [api.md](./api.md) — this vertical reuses [messages' api.md](../messages/api.md) almost entirely;
  this page's own `api.md` documents only what's chat-room-specific

## Do the messages vertical's known gaps apply here too?

Checked directly rather than assumed, per this effort's own house rule
([conventions.md §11](../../../conventions.md#11-old-reference-docs-are-a-lead-not-a-source-of-truth)):

- `CROSS-001` (resolved) (web's favorites/groups filter-pill sidebar has no
  Flutter counterpart) **doesn't apply structurally** — chat-room's sidebar is a room list + an
  online-members tab, not a filterable conversation list, on *either* platform. There's no
  favorites/groups-shaped feature here to be missing.
- `CROSS-006` (resolved) (Flutter DM messaging has no reply-to at all) **doesn't
  apply either, for a different reason** — see [CROSS-024](#known-issues-affecting-this-page)
  below: chat-room lacks reply-to (and delete) on **every** platform, because the backend doesn't
  support it for rooms at all. This is a new, separate finding, not an instance of CROSS-006.

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| List rooms | [messaging/endpoints.md § List / read / write chat rooms](../../../backend/messaging-realtime/messaging/endpoints.md#list--read--write-chat-rooms) |
| Paginated room messages | same entry — `GET /api/rooms/:roomId/messages` |
| Room attachments gallery | same entry — `GET /api/rooms/:roomId/attachments` |
| Send a room message | [messaging/endpoints.md § WebSocket Events](../../../backend/messaging-realtime/messaging/endpoints.md#websocket-events) — `room-message`, **WS only, no REST/GraphQL fallback** (see [hooks.md](./hooks.md)) |
| Join/leave room, presence, counts | [messaging/endpoints.md § WebSocket Events](../../../backend/messaging-realtime/messaging/endpoints.md#websocket-events) — `join-room`/`leave-room` (via the `chat-room` page-claim, not called directly by this page's own code — see [realtime/endpoints.md](../../../backend/messaging-realtime/realtime/endpoints.md)), `get-room-counts`, `get-room-members` |
| Attachment upload | [upload/endpoints.md § Stream a chat attachment upload](../../../backend/messaging-realtime/upload/endpoints.md#stream-a-chat-attachment-upload) |
| Attachment download/preview | [upload/endpoints.md § Serve a decrypted attachment](../../../backend/messaging-realtime/upload/endpoints.md#serve-a-decrypted-attachment) |

## Known issues affecting this page

- ⚠ `BE-016` (resolved) — the VIP room (`vip-lounge`) both tier views above expose has
  no backing `Room` database row created by any seed/startup path. Joining it and viewing its (empty)
  history works — sending the **first** message in it fails with a `409` (a Prisma foreign-key
  conflict surfacing through the standard exception mapping), not a clean "room not found." Every
  Medium/Premium user hits this identically until the row is created out-of-band.
- `BE-017` (resolved) — sending a message with an `attachments[].url` copied from a
  message/room the sender doesn't own silently re-links that attachment's access control to the new
  message — see [upload/README.md § Known issues](../../../backend/messaging-realtime/upload/README.md#known-issues).
- `CROSS-024` (resolved — fixed 2026-09-03: chat rooms now have reply-to and delete (for me / for everyone) end to end — `RoomMessage.replyToId`/`deletedAt` + `RoomMessageDeletion`, `POST rooms/:roomSlug/messages/:messageId/delete-for-me|delete-for-everyone`, a `room-message-deleted` WS frame, and matching UI in both web apps and Flutter) — unlike [messages](../messages/page.md), chat-room has **no**
  reply-to-message and **no** delete-message capability, on any surface — this isn't a
  frontend-only gap (contrast `CROSS-006` (resolved), which is DM reply present
  backend-side but missing only on Flutter): the backend's `RoomMessage`/`RoomMessageAttachment`
  models have no reply-target or soft-delete columns at all, `saveRoomMessage()` takes no
  `replyToId`, and no delete-room-message endpoint exists anywhere (REST, GraphQL, or WS). This is
  consistent — and therefore not a cross-platform parity bug — but is a real feature gap relative to
  1:1 messaging.
- `CROSS-026` (resolved 2026-09-03) — this page's deep-link query param is `?room=` (built by
  [`MessagesSidebarRooms`](../messages/components/messages-sidebar-rooms.md) as
  `` /v1/{lang}/chat-room?room={slug} ``); mobile used to build and read `?conversation=` instead,
  so a URL built for one platform wouldn't pre-select a room on the other. Mobile now uses `?room=`
  as well.
