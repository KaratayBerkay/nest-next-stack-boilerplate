# ChatMessageBubble (widget)

**Source:** [`chat_message_bubble.dart`](../../../../../flutter-boilerplate/lib/views/messages/chat_message_bubble.dart)
**Used in:** [ChatMessageList](./chat-message-list.md)
**Web equivalent:** [ChatMessageBubble component](../../../../frontend/v1/messages/components/chat-message-bubble.md)

## Purpose

`ConsumerWidget` rendering one message bubble: sender name (peer messages only), attachments,
text/tombstone, timestamp, and a read/delivered tick. Long-press opens a context menu with
delete-for-me and (sender-only, within the delete window) delete-for-everyone.

## Constructor

```dart
class ChatMessageBubble extends ConsumerWidget {
  final ChatMessage message;
  final bool isMe;
  const ChatMessageBubble({super.key, required this.message, this.isMe = false});
}
```

## Behavior notes vs. web

- **No reply support** — the context menu here has exactly 2 entries (delete-for-me,
  delete-for-everyone); web's equivalent adds a 3rd (reply), and this widget's `ChatMessage` has no
  `replyTo` field to render one even if the action existed. See
  [CROSS-006](../../../../issues.md#cross-006).
- **No decryption-failure state** — web's bubble explicitly branches on an empty `body` with no
  attachments to show a "🔒 decryption failed" indicator; this widget has no equivalent branch (a
  message with empty `content` and no attachments would currently render an essentially blank
  bubble aside from the timestamp/tick). Worth checking whether this is reachable in practice, given
  [wire-crypto](../../../../backend/messaging-realtime/wire-crypto/README.md)'s at-rest encryption
  is server-controlled (not true E2EE — see
  [CROSS-004](../../../../issues.md#cross-004)), so a genuine decrypt failure should be rarer here
  than a real E2EE system, but `resolveBody`'s multi-key-attempt fallback in the backend's
  [`message-body.util.ts`](../../../../../nest-js-boilerplate/src/messaging/message-body.util.ts)
  can still return an unresolved row.
- **Delete-for-everyone window check is UI-only here too** (`DateTime.now().difference(...) <
  ChatConstants.deleteForEveryoneWindow`), same caveat as web: server re-checks independently.

## Calls

`_deleteForMe`/`_deleteForEveryone` read `messageActionsProvider`
([`lib/api/client/messages/actions.dart`](../../../../../flutter-boilerplate/lib/api/client/messages/actions.dart))
and call `.deleteMessageForMe(id)`/`.deleteMessageForEveryone(id)` — both **direct GraphQL**, no BFF
hop (verified, see [api.md](../api.md)):

- [api.md § Shape per file](../api.md#shape-per-file) → `delete_message.dart`
- Backend: [messaging/endpoints.md § Mark messages read / delete for me / delete for everyone (GraphQL)](../../../../backend/messaging-realtime/messaging/endpoints.md#mark-messages-read--delete-for-me--delete-for-everyone-graphql)

Contrast with the **web** equivalent's delete action, which is REST via the Next.js BFF — same
backend outcome, different transport and different intermediary entirely. See
[ChatMessageBubble (web)](../../../../frontend/v1/messages/components/chat-message-bubble.md#calls-indirect--this-component-never-calls-fetcha-hooks-mutation-directly)
for that path.
