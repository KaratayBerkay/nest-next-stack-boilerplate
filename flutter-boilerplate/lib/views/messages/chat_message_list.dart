import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/messages/query.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../hooks/use_auth.dart';
import 'chat_message_bubble.dart';

class ChatMessageList extends ConsumerWidget {
  final String conversationId;

  const ChatMessageList({
    super.key,
    required this.conversationId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUser = ref.watch(currentUserProvider);
    final messagesAsync =
        ref.watch(conversationMessagesProvider(conversationId));

    return messagesAsync.when(
      loading: () => const Spinner(),
      error: (_, __) => const EmptyWidget(
        title: 'Failed to load messages',
        icon: Icons.error_outline,
      ),
      data: (messages) {
        if (messages.isEmpty) {
          return const EmptyWidget(
            title: 'No messages yet',
            description: 'Send a message to start the conversation',
            icon: Icons.chat_outlined,
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 12),
          itemCount: messages.length,
          itemBuilder: (_, i) {
            final msg = messages[i];
            final isMe = currentUser?.id == msg.senderId;
            return ChatMessageBubble(
              message: msg,
              isMe: isMe,
            );
          },
        );
      },
    );
  }
}
