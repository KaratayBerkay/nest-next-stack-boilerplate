# ChatMessageBubble

**Source:** [`ChatMessageBubble.tsx`](../../../../../next-js-boilerplate/src/views/messages/ChatMessageBubble.tsx)
**Types:** [`ChatMessageBubble-types.ts`](../../../../../next-js-boilerplate/src/types/messages/ChatMessageBubble-types.ts)
**Used in:** [messages page](../page.md), rendered by [ChatMessageList](./chat-message-list.md)
**Mobile equivalent:** [ChatMessageBubble widget](../../../../mobile/v1/messages/widgets/chat-message-bubble.md)

## Purpose

Renders one message bubble: text/attachments, quoted-reply preview, timestamp + read/delivered tick,
and a hover-revealed reply/delete action menu. Client component (`"use client"`).

## Props (`ChatMessageBubbleProps`)

| Prop | Purpose |
|---|---|
| `msg` | the message row — may be `deletedAt`-tombstoned, or have an empty `body` if client-side decrypt failed |
| `isMe` | flips bubble alignment (`flex-row-reverse`) and bubble color (brand vs. surface) |
| `userName`, `userEmail`, `userAvatarUrl` | peer identity, for the avatar + reply-sender label |
| `dateDisplay` | pre-resolved date-format preference, passed through to `formatMessageTime` |
| `onDelete(id, scope)` | callback — see **Calls** below, not a direct API call from this component |
| `onReply(msg)` | wires into [ReplyBanner](./reply-banner.md) via `ChatView`'s `replyTarget` state |

## Behavior notes

- **Link cards** (added post-docs): every http(s) URL in a message body renders a
  [ChatLinkCard](./chat-link-card.md) under the bubble — copyable always, clickable only when it passes the
  strict https/public-domain policy documented there.

- **Decryption-failure state**: a non-deleted message with an empty `body` and no attachments
  renders a distinct "🔒 decryption failed" bubble instead of blank space — see
  [wire-crypto](../../../../backend/messaging-realtime/wire-crypto/README.md) for why a message
  might arrive undecryptable.
- **Delete-for-everyone window is UI-only here**: `canDeleteForEveryone` compares a `useState`
  lazy-initializer snapshot of "now" (captured once, at mount, to avoid an impure `Date.now()` read
  on every render) against `msg.createdAt` — the actual enforcement is server-side (see
  [messaging/endpoints.md#delete-a-message](../../../../backend/messaging-realtime/messaging/endpoints.md#delete-a-message)).
  A bubble that still shows the delete-for-everyone option after the real window closes will simply
  get a `403` back from the server.
- **Reply preview resolution**: `msg.replyTo` (when present) is rendered from whatever the server
  already decrypted server-side (see `ReplyPreview` in the backend's
  [`message-body.util.ts`](../../../../../nest-js-boilerplate/src/messaging/message-body.util.ts)) —
  this component does no decryption of its own for the quoted preview, only branches on
  `deletedAt`/`body`/`hasAttachments` to pick the right placeholder text.
- Uses shared UI primitives: `Avatar`, `MessageTick`, `AttachmentPreview`, `ConfirmDialog`,
  `DropdownMenu`, `IconButton` (all `components/ui/`).

## Calls (indirect — this component never calls `fetch`/a hook's mutation directly)

`onDelete` is supplied by [`ChatView`](./chat-view.md) and resolves to:

```
ChatMessageBubble (onDelete prop)
  → ChatView.handleDeleteMessage → useMessageActions().deleteMessage()  — src/api/client/messages/actions.ts
    → deleteMessageForMeServer() / deleteMessageForEveryoneServer()    — src/api/server/messages/delete-message.ts
      → backend: POST /api/messages/:messageId/delete-for-me | delete-for-everyone
```

- Frontend BFF route: [api.md § Delete a message (BFF route)](../api.md#delete-a-message-bff-route)
- Backend endpoint: [messaging/endpoints.md#delete-a-message](../../../../backend/messaging-realtime/messaging/endpoints.md#delete-a-message)
