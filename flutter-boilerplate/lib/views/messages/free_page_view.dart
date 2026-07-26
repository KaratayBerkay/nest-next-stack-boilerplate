import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/container.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../hooks/use_messages_page.dart';
import 'chat_view.dart';
import 'empty_chat_state.dart';
import 'messages_sidebar.dart';

class FreeMessagesPage extends ConsumerWidget {
  final String lang;

  const FreeMessagesPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedUserId = ref.watch(selectedConversationUserIdProvider);

    if (context.isMobile) {
      // Mobile has no room for side-by-side panes — show the conversation
      // list until one is selected, then swap to ChatView full-screen
      // (mirrors web's `hidden`/`flex md:hidden` pair, just as separate
      // widgets instead of CSS breakpoints).
      return selectedUserId == null
          ? const MessagesSidebar()
          : ChatView(conversationId: selectedUserId, lang: lang);
    }

    return Row(
      children: [
        const MessagesSidebar(),
        Expanded(
          child: selectedUserId == null
              ? const EmptyChatState()
              : ChatView(conversationId: selectedUserId, lang: lang),
        ),
      ],
    );
  }
}
