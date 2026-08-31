# Messages (screen)

**Route:** `/v1/:lang/messages` (GoRouter name `v1Messages`)
**Router registration:** [`router.dart#L312-L319`](../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => MessagesPageContent(lang: ..., initialUser: state.uri.queryParameters['user'])`.
The `?user=` query param mirrors the web page's own `?user=` deep-link handling (e.g. from a push
notification) — see [`page_view.dart`](../../../../flutter-boilerplate/lib/views/messages/page_view.dart)'s
`initialUser` doc comment, which explicitly cites this parity intent.
**Entry widget:** `MessagesPageContent` in
[`page_view.dart`](../../../../flutter-boilerplate/lib/views/messages/page_view.dart)
**Web equivalent:** [messages page](../../../frontend/v1/messages/page.md)

## What renders here

Same tier-gate composition pattern as web (`TierGate` wrapping 4 tier widgets), flattened into one
folder — Flutter keeps a vertical's screens+widgets together, no separate `widgets/` split in the
real source (this doc's own `widgets/` folder is a documentation-only grouping, see
[conventions.md](../../../conventions.md)):

| Tier | File |
|---|---|
| Free | [`free_page_view.dart`](../../../../flutter-boilerplate/lib/views/messages/free_page_view.dart) |
| Basic | `basic_page_view.dart` |
| Medium | `medium_page_view.dart` |
| Premium | `premium_page_view.dart` |

All four wrap the same `MessagesSidebar`/`ChatView`/`EmptyChatState` composition (per
`free_page_view.dart`) — not independently reusable, not documented as standalone widgets, same
rationale as web's four `*PageView.tsx` files.

`_applyInitialUser()` (in `MessagesPageContent`'s state) writes the deep-linked user id into
`selectedConversationUserIdProvider` — re-run on `didUpdateWidget`, not just `initState`, because
GoRouter reuses this widget's State across a query-param-only navigation (e.g. tapping a second
notification without leaving the page).

## Layout: mobile vs. desktop

Unlike web's CSS-breakpoint approach (`hidden`/`md:flex` pairs on both panes simultaneously),
`FreeMessagesPage` branches explicitly on `context.isMobile`: mobile shows either
[MessagesSidebar](./widgets/messages-sidebar.md) **or** [ChatView](./widgets/chat-view.md)
full-screen (never both), desktop shows them side-by-side in a `Row` with
[EmptyChatState](./widgets/empty-chat-state.md) filling the empty pane.

## State

Selection state is a single Riverpod provider, not a page-level hook object like web's
`useMessagesPage`:
[`selectedConversationUserIdProvider`](../../../../flutter-boilerplate/lib/hooks/use_messages_page.dart)
(`StateProvider<String?>`) — read/written directly by
[MessagesSidebarConversations](./widgets/messages-sidebar-conversations.md),
[MessagesSidebarFriends](./widgets/messages-sidebar-friends.md), and
[ChatViewHeader](./widgets/chat-view-header.md)'s back button, with no intermediate hook layer. This
is one of the simpler verticals in that sense — web's equivalent `useMessagesPage` also owns filter/
search/sidebar-open state that here is local `State` inside
[MessagesSidebar](./widgets/messages-sidebar.md) itself instead of centralized.

## Widgets

12 significant widgets in
[`lib/views/messages/`](../../../../flutter-boilerplate/lib/views/messages/):
[chat-message-bubble.md](./widgets/chat-message-bubble.md) ·
[chat-input-bar.md](./widgets/chat-input-bar.md) ·
[chat-message-list.md](./widgets/chat-message-list.md) ·
[chat-view.md](./widgets/chat-view.md) ·
[chat-view-header.md](./widgets/chat-view-header.md) ·
[empty-chat-state.md](./widgets/empty-chat-state.md) ·
[messages-sidebar.md](./widgets/messages-sidebar.md) ·
[messages-sidebar-conversations.md](./widgets/messages-sidebar-conversations.md) ·
[messages-sidebar-friends.md](./widgets/messages-sidebar-friends.md) ·
[messages-sidebar-search.md](./widgets/messages-sidebar-search.md) ·
[messages-sidebar-tab-bar.md](./widgets/messages-sidebar-tab-bar.md) ·
[online-avatar.md](./widgets/online-avatar.md)

## Confirmed parity gaps vs. web (found while documenting this screen)

- ⚠ **No favorites/groups filtering** — mobile's sidebar is a 2-tab switcher (Chats / Friends,
  [MessagesSidebarTabBar](./widgets/messages-sidebar-tab-bar.md)), not web's 4-pill filter bar
  (All/Unread/Favorites/Groups). There's no unread-only filter, no favorite-star action anywhere in
  the mobile widget set, and no in-sidebar room/group list — see
  `CROSS-001` (resolved). The "Friends" tab ([MessagesSidebarFriends](./widgets/messages-sidebar-friends.md))
  is mobile's equivalent of web's "start a new chat" popover, not a like-for-like filter.
- ⚠ **No reply-to-message feature at all** — no field on `ChatMessage`, no UI, no action. See
  `CROSS-006` (resolved) — a larger gap than the filter/favorites one, since
  reply-to is a core backend feature (`replyToId`/`replyTo` on every surface), not a recent
  web-only addition.
- ⚠ **No attachment gallery ("all uploads") screen/sheet** — confirmed absent, not just "not yet
  located": `grep -rli "attachmentgallery\|alluploads"` across the entire Flutter app returns nothing.
  Web has this feature in *both* [messages](../../../frontend/v1/messages/components/attachment-gallery-sheet.md)
  and [chat-room](../../../frontend/v1/chat-room/components/room-attachment-gallery-sheet.md); mobile
  has it in neither. Verified while documenting Phase 3b (upload + chat-room) — see
  `CROSS-028` (resolved).

## API

[api.md](./api.md) — **confirmed zero Next.js involvement for this entire vertical**: all 13
`lib/api/server/messages/*.dart` files call the NestJS backend directly (5 via raw `/graphql` POSTs,
8 via REST paths that match the backend's own native controller routes). See
[../../../conventions.md § 9](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)
and `CROSS-007` (resolved) (this finding corrected an earlier,
less-verified claim from research done before this screen was documented).
