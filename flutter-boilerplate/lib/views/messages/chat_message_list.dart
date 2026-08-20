import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/messages/query.dart';
import '../../components/ui/button/button.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';
import 'chat_message_bubble.dart';

class ChatMessageList extends ConsumerWidget {
  final String conversationId;
  final ScrollController? scrollController;

  const ChatMessageList({
    super.key,
    required this.conversationId,
    this.scrollController,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUser = ref.watch(currentUserProvider);
    final messagesState =
        ref.watch(conversationMessagesProvider(conversationId));
    final t = AppLocalizations.of(context);

    if (messagesState.isInitialLoading) return const Spinner();
    if (messagesState.error != null) {
      return EmptyWidget(
        title: t.messagesFailedToLoad,
        icon: Icons.error_outline,
      );
    }

    final messages = messagesState.items;
    if (messages.isEmpty) {
      return EmptyWidget(
        title: t.messagesNoMessages,
        icon: Icons.chat_outlined,
      );
    }

    final hasMore = messagesState.hasMore;
    return ListView.builder(
      controller: scrollController,
      // Extra bottom padding is deliberate margin above the input bar —
      // it's part of the scrollable content, so "scroll to bottom"
      // naturally settles with this gap already showing instead of
      // stopping short of it (see ChatView, which no longer adds a
      // static sibling gap for the same reason).
      padding: const EdgeInsets.only(top: 12, bottom: 24),
      itemCount: messages.length + (hasMore ? 1 : 0),
      itemBuilder: (_, i) {
        if (hasMore && i == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Center(
              child: Button(
                variant: ButtonVariant.secondary,
                size: ButtonSize.sm,
                loading: messagesState.isLoadingMore,
                onPressed: () => ref
                    .read(conversationMessagesProvider(conversationId).notifier)
                    .loadMore(),
                child: Text(t.chatRoomLoadEarlier),
              ),
            ),
          );
        }
        final msg = messages[i - (hasMore ? 1 : 0)];
        final isMe = currentUser?.id == msg.senderId;
        return ChatMessageBubble(
          message: msg,
          isMe: isMe,
        );
      },
    );
  }
}
