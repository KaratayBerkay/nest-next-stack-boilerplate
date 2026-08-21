# ChatViewHeader (widget)

**Source:** [`chat_view_header.dart`](../../../../../flutter-boilerplate/lib/views/messages/chat_view_header.dart)
**Used in:** [ChatView](./chat-view.md)
**Web equivalent:** [ChatViewHeader component](../../../../frontend/v1/messages/components/chat-view-header.md)

## Purpose

`ConsumerWidget` — peer avatar (with a `_PresenceAvatar` online ring, a private widget local to this
file), name, typing/online/offline status line, and (mobile-only, `context.isMobile`) a back button
that clears `selectedConversationUserIdProvider`.

## Behavior notes

- Looks up the peer's name/avatar by scanning `conversationsProvider`'s already-fetched list for a
  matching id (`convs.where((c) => c.id == conversationId).firstOrNull`) rather than accepting them
  as props the way web's `ChatViewHeader` does (`selectedUser` passed in directly) — falls back to
  the literal string `"Chat"` if no match is found (e.g. messaging a friend with no conversation
  history yet, before the first message creates a real conversation row).
- Status-line priority matches web exactly: typing > online > offline.
- **No "open attachment gallery" affordance** — web's header has an optional folder icon
  (`onOpenGallery`); no equivalent button exists here, consistent with no gallery screen being found
  in this widget set (see [screen.md](../screen.md#confirmed-parity-gaps-vs-web-found-while-documenting-this-screen)).

## Calls

None directly — reads `conversationsProvider`, `onlineUsersProvider`, `typingUsersProvider` (all
Riverpod, no imperative fetch triggered by this widget itself).
