# EmptyChatState (widget)

**Source:** [`empty_chat_state.dart`](../../../../../flutter-boilerplate/lib/views/messages/empty_chat_state.dart)
**Used in:** [screen.md](../screen.md) (desktop layout only, filling the right pane when no
conversation is selected — see `FreeMessagesPage`'s `Row`)
**Web equivalent:** [EmptyChatState component](../../../../frontend/v1/messages/components/empty-chat-state.md)

## Purpose

Stateless placeholder using the shared `EmptyWidget` primitive (icon + title + description) — no
props, no data dependency. Directly analogous to the web component; the only difference is web
hand-rolls its own markup where mobile reuses a shared `EmptyWidget`.
