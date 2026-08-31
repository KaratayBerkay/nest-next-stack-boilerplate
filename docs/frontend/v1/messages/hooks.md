# Messages — Hooks

Page: [page.md](./page.md) · Source: [`src/hooks/messages/`](../../../../next-js-boilerplate/src/hooks/messages/)

### `useMessagesPage`

[`useMessagesPage.ts`](../../../../next-js-boilerplate/src/hooks/messages/useMessagesPage.ts) — the
page's one big state hook; everything `MessagesPageContent` renders comes from here.

- Composes `useMessagesData` (below) with local UI state: selected conversation, sidebar
  open/closed, search text, and the active sidebar filter (persisted in `sessionStorage`, key
  `msg_filter`, so it survives a reload but not a new tab).
- **Deep-link handling**: if the page loaded with `?user=<id>` (set by another page's "Message this
  user" action), resolves that id against `conversations` first, then `friends` (a friend with no
  message history yet has no `conversations` row) — opens that thread and marks it read, once.
- **`selectedUser` is recomputed every render**, not just set-and-forgotten: it overlays the live
  `conversations`/`friends` record onto the last-clicked user id, so a peer's profile change (e.g.
  toggling `hideAvatar` mid-conversation) is reflected in the open chat header/bubbles immediately —
  without this, only the sidebar (which renders straight from the live lists) would update.
- Calls `setActivePeerId()` ([`event-dispatch.ts`](../../../../next-js-boilerplate/src/lib/realtime/event-dispatch.ts))
  so realtime frames received *elsewhere* (e.g. the feed page) don't get auto-marked-read for a
  conversation that isn't actually open — cleared on unmount.
- Surfaces `connectionState` (`useConnectionState`) and `onlineUsers` (`usePresence`) — both are
  cross-page realtime hooks, not messages-specific; documented where they're introduced.

### `useMessagesData`

[`useMessagesData.ts`](../../../../next-js-boilerplate/src/hooks/messages/useMessagesData.ts) — thin
composition of two React Query hooks: `friendsQueryOptions()` (seeded with the server-fetched
`initialFriends`) and `useConversations()` (the realtime-aware conversations list, defined in
`src/lib/realtime/`, shared with other pages that show conversation previews).

### `useSessionCrypto`

[`useSessionCrypto.ts`](../../../../next-js-boilerplate/src/hooks/messages/useSessionCrypto.ts) —
the client side of [wire-crypto](../../../backend/messaging-realtime/wire-crypto/README.md)'s
transport encryption. Wraps `src/lib/crypto/session.ts`'s `hasSession`/`encryptForServer`/
`decryptFromServer`, exposing `active` (via `useSyncExternalStore`, reactive to a
`session-crypto-change` window event), `encrypt`, and `decrypt`. **Not** a message-content E2EE hook
— see `CROSS-004` (resolved) if the name suggests otherwise.
Handshake triggering itself lives in the realtime connection setup (`realtime-client.ts`), not here.

### `useTypingIndicator`

[`useTypingIndicator.ts`](../../../../next-js-boilerplate/src/hooks/messages/useTypingIndicator.ts) —
per-recipient debounce: calls `onTypingStart` once on the first keystroke after idle, resets a 3s
timer on every subsequent keystroke, calls `onTypingStop` when the timer fires or the input empties.
Used by [`ChatInputBar`](./components/chat-input-bar.md); the actual WS send happens in
`useTypingUsers` (a cross-page hook, called from [`ChatView`](./components/chat-view.md)), which this
hook's `onTypingStart`/`onTypingStop` callbacks are wired to.

### `useAttachmentUploads`

[`useAttachmentUploads.ts`](../../../../next-js-boilerplate/src/hooks/messages/useAttachmentUploads.ts) —
multi-file upload state shared by messages and chat-room composers. Files upload in parallel
(max 10 staged at once) over a streamed `XMLHttpRequest` (not `fetch`, to get real byte-level
`onprogress`) via `useMessageUpload` (see [api.md](./api.md)). Dedupes by `name:size` against
already-staged items regardless of their status, so the same file can't be added twice from one
picker selection or across repeated attach clicks. Exposes per-item cancel (`removeItem`, aborts the
in-flight XHR) and `doneAttachments()` for `ChatView` to collect once all uploads finish.

## Cross-cutting hooks used here but not messaging-specific

`useAuth`, `useConnectionState`, `usePresence`, `useTypingUsers`, `useAutoScroll`,
`useYSwipeGesture`, `useDateDisplayCookie`, `useDebounce` — all defined outside `hooks/messages/`
and shared across pages; documented where first introduced rather than repeated here.
