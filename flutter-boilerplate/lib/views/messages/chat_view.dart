import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/messages/mark_read.dart';
import 'package:flutter_boilerplate/lib/container.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'chat_input_bar.dart';
import 'chat_message_list.dart';
import 'chat_view_header.dart';

class ChatView extends ConsumerStatefulWidget {
  final String conversationId;
  final String lang;

  const ChatView({
    super.key,
    required this.conversationId,
    required this.lang,
  });

  @override
  ConsumerState<ChatView> createState() => _ChatViewState();
}

class _ChatViewState extends ConsumerState<ChatView> {
  @override
  void initState() {
    super.initState();
    _markRead();
  }

  @override
  void didUpdateWidget(ChatView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.conversationId != widget.conversationId) {
      _markRead();
    }
  }

  void _markRead() {
    ref.read(markReadActionsProvider).call(widget.conversationId);
  }

  @override
  Widget build(BuildContext context) {
    if (context.isMobile) {
      return Scaffold(
        body: Column(
          children: [
            ChatViewHeader(
              conversationId: widget.conversationId,
              lang: widget.lang,
            ),
            Expanded(
              child: ChatMessageList(conversationId: widget.conversationId),
            ),
            ChatInputBar(conversationId: widget.conversationId),
          ],
        ),
      );
    }

    return Column(
      children: [
        ChatViewHeader(
          conversationId: widget.conversationId,
          lang: widget.lang,
        ),
        Expanded(
          child: ChatMessageList(conversationId: widget.conversationId),
        ),
        ChatInputBar(conversationId: widget.conversationId),
      ],
    );
  }
}
