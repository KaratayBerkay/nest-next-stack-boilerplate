import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

/// The peer user id of the conversation currently open in the Messages
/// page's main pane — mirrors the web's `useMessagesPage`'s `selectedUser`
/// state (`FreePageView.tsx`). Null means no conversation is selected
/// (show `EmptyChatState`/the conversation list instead of `ChatView`).
final selectedConversationUserIdProvider = StateProvider<String?>(
  (ref) => null,
);
