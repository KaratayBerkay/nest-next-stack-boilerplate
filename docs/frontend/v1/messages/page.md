# Messages (page)

**Route:** `/v1/[lang]/messages` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/messages/page.tsx)
**Mobile equivalent:** [messages screen](../../../mobile/v1/messages/screen.md)

## What renders here

Server component. Resolves the session user and, **in parallel**, the query-string `?user=` param
(used when navigating here from another page's "Message" action — see `hooks.md`), then hands off to
`getTierView()`, which renders one of four tier-branch view files based on `user.tier`:

```ts
const VIEWS = { FREE: FreePageView, BASIC: BasicPageView, MEDIUM: MediumPageView, PREMIUM: PremiumPageView };
```

| Tier | View file |
|---|---|
| Free | [`FreePageView.tsx`](../../../../next-js-boilerplate/src/views/messages/FreePageView.tsx) |
| Basic | `BasicPageView.tsx` |
| Medium | `MediumPageView.tsx` |
| Premium | `PremiumPageView.tsx` |

These 4 files are **not** documented as standalone components — they're tier-branches of this same
page (all four wrap the same `MessagesPageContent`, per `FreePageView.tsx`), not independently
reusable UI. Nothing about the messaging feature itself is actually tier-gated at the page level
(no `TierGate`/`@MinTier` in this vertical) — the four-file split exists for the `getTierView`
routing convention this codebase uses uniformly across pages, not because messaging has tier-specific
behavior.

## Server-side data fetch

Before rendering, the page itself fetches the friends list directly (`backendFetch(FRIENDS_URL)`,
[`src/lib/backend.ts`](../../../../next-js-boilerplate/src/lib/backend.ts)) — a direct
server-to-backend call, not through a client hook — seeding `initialFriends` for first paint. Errors
here are swallowed (empty array fallback); the client-side `useMessagesData` hook (see
[hooks.md](./hooks.md)) takes over for everything after initial load and its own error state.

## Client component tree

`MessagesPageContent` (inside each tier view) uses [`useMessagesPage`](./hooks.md) for essentially
all state, and renders:

```
MessagesPageContent
├─ MessagesSidebar                    (conversation/room list + filters + search)
│   ├─ MessagesSidebarFilterBar       (All/Unread/Favorites/Groups pills + new-chat picker)
│   ├─ MessagesSidebarSearch
│   ├─ MessagesSidebarConversations   (when filter ≠ "groups")
│   └─ MessagesSidebarRooms           (when filter === "groups")
└─ ChatView                           (when a conversation is selected; EmptyChatState otherwise)
    ├─ ChatViewHeader
    ├─ ChatMessageList → ChatMessageBubble (× N)
    ├─ ReplyBanner                    (when replying)
    ├─ StorageLimitNotice             (instead of the input bar, when over quota)
    ├─ ChatInputBar
    └─ AttachmentGallerySheet         ("All uploads" side panel)
```

## Components

14 significant components in
[`src/views/messages/`](../../../../next-js-boilerplate/src/views/messages/):

[chat-message-bubble.md](./components/chat-message-bubble.md) ·
[chat-input-bar.md](./components/chat-input-bar.md) ·
[chat-message-list.md](./components/chat-message-list.md) ·
[chat-view.md](./components/chat-view.md) ·
[chat-view-header.md](./components/chat-view-header.md) ·
[attachment-gallery-sheet.md](./components/attachment-gallery-sheet.md) ·
[empty-chat-state.md](./components/empty-chat-state.md) ·
[messages-sidebar.md](./components/messages-sidebar.md) ·
[messages-sidebar-conversations.md](./components/messages-sidebar-conversations.md) ·
[messages-sidebar-filter-bar.md](./components/messages-sidebar-filter-bar.md) ·
[messages-sidebar-rooms.md](./components/messages-sidebar-rooms.md) ·
[messages-sidebar-search.md](./components/messages-sidebar-search.md) ·
[reply-banner.md](./components/reply-banner.md) ·
[storage-limit-notice.md](./components/storage-limit-notice.md)

## Hooks & API

- [hooks.md](./hooks.md) — `useMessagesPage`, `useMessagesData`, `useAttachmentUploads`,
  `useSessionCrypto`, `useTypingIndicator`
- [api.md](./api.md) — full client/server API map (4 client files, 16 BFF route files)

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Send a message | [messaging/endpoints.md#send-a-direct-message](../../../backend/messaging-realtime/messaging/endpoints.md#send-a-direct-message) — normally over the WebSocket, REST as fallback (see [hooks.md](./hooks.md)) |
| Delete a message | [messaging/endpoints.md#delete-a-message](../../../backend/messaging-realtime/messaging/endpoints.md#delete-a-message) |
| List conversations / friends / rooms | [messaging/endpoints.md § REST](../../../backend/messaging-realtime/messaging/endpoints.md#rest) |
| Favorite/unfavorite | [messaging/endpoints.md § REST](../../../backend/messaging-realtime/messaging/endpoints.md#favorite--unfavorite-a-conversation) |
| Mark read | [messaging/endpoints.md#mark-messages-read](../../../backend/messaging-realtime/messaging/endpoints.md#mark-messages-read) |
| Real-time delivery, typing, read receipts | [realtime/endpoints.md](../../../backend/messaging-realtime/realtime/endpoints.md), [messaging/endpoints.md § WebSocket Events](../../../backend/messaging-realtime/messaging/endpoints.md#websocket-events) |
| Attachment upload | [upload/endpoints.md § Stream a chat attachment upload](../../../backend/messaging-realtime/upload/endpoints.md#stream-a-chat-attachment-upload) |

## Known issues affecting this page

- `CROSS-001` (resolved) — `MessagesSidebarFilterBar.tsx`'s favorites/groups
  filter has no Flutter counterpart.
- `BE-017` (resolved) — sending a message with an `attachments[].url` copied from
  elsewhere silently re-links that attachment's access control to the new message — found while
  documenting the upload module (Phase 3b); see
  [upload/README.md § Known issues](../../../backend/messaging-realtime/upload/README.md#known-issues).
