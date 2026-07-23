import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../lib/container.dart';
import 'chat_view_header.dart';
import 'chat_message_list.dart';
import 'chat_input_bar.dart';

class ChatView extends ConsumerWidget {
  final String conversationId;
  final String lang;

  const ChatView({
    super.key,
    required this.conversationId,
    required this.lang,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (context.isMobile) {
      return Scaffold(
        body: Column(
          children: [
            ChatViewHeader(conversationId: conversationId, lang: lang),
            Expanded(
              child: ChatMessageList(conversationId: conversationId),
            ),
            ChatInputBar(conversationId: conversationId),
          ],
        ),
      );
    }

    return Column(
      children: [
        ChatViewHeader(conversationId: conversationId, lang: lang),
        Expanded(
          child: ChatMessageList(conversationId: conversationId),
        ),
        ChatInputBar(conversationId: conversationId),
      ],
    );
  }
}
