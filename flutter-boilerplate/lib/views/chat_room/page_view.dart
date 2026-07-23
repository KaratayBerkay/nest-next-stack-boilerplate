import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../lib/tier_view.dart';
import '../../lib/realtime/realtime_provider.dart';
import '../../constants/theme.dart';
import '../../api/client/messages/query.dart';
import '../../api/client/messages/actions.dart';
import '../../hooks/use_auth.dart';


class ChatRoomPageContent extends ConsumerWidget {
  final String lang;
  final String? conversationId;

  const ChatRoomPageContent({super.key, required this.lang, this.conversationId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TierGate(
      freeWidget: Scaffold(
        appBar: AppBar(title: const Text('Chat')),
        body: const Center(child: Text('Upgrade to use chat')),
      ),
      basicWidget: _ChatRoomView(lang: lang, conversationId: conversationId),
      mediumWidget: _ChatRoomView(lang: lang, conversationId: conversationId),
      premiumWidget: _ChatRoomView(lang: lang, conversationId: conversationId),
    );
  }
}

class _ChatRoomView extends ConsumerStatefulWidget {
  final String lang;
  final String? conversationId;

  const _ChatRoomView({required this.lang, this.conversationId});

  @override
  ConsumerState<_ChatRoomView> createState() => _ChatRoomViewState();
}

class _ChatRoomViewState extends ConsumerState<_ChatRoomView> {
  final _messageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final convId = widget.conversationId;
    if (convId != null) {
      ref.read(realtimeProvider).watch('conversation:$convId');
    }
  }

  @override
  void dispose() {
    final convId = widget.conversationId;
    if (convId != null) {
      ref.read(realtimeProvider).unwatch('conversation:$convId');
    }
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final currentUser = ref.watch(currentUserProvider);
    final messagesAsync = ref.watch(conversationMessagesProvider(widget.conversationId ?? ''));

    return Scaffold(
      appBar: AppBar(title: const Text('Chat Room')),
      body: Column(
        children: [
          Expanded(
            child: messagesAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (messages) {
                final msgs = messages;
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: msgs.length,
                  itemBuilder: (_, i) {
                    final msg = msgs[i];
                    final isMe = currentUser?.id == msg.senderId;
                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: isMe ? colors.brand : colors.surfaceAlt,
                          borderRadius: BorderRadius.circular(12).copyWith(
                            bottomRight: isMe ? const Radius.circular(0) : null,
                            bottomLeft: !isMe ? const Radius.circular(0) : null,
                          ),
                        ),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.75,
                        ),
                        child: Text(msg.content, style: TextStyle(color: isMe ? colors.surface : colors.fg)),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            decoration: BoxDecoration(
              color: colors.surface,
              border: Border(top: BorderSide(color: colors.border)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: () {
                    final text = _messageController.text.trim();
                    if (text.isNotEmpty && widget.conversationId != null) {
                      ref.read(messageActionsProvider).sendMessage(widget.conversationId!, text);
                      _messageController.clear();
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
