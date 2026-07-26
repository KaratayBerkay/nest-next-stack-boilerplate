import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/messages/mark_read.dart';
import 'package:flutter_boilerplate/api/client/messages/query.dart';
import 'package:flutter_boilerplate/components/ui/scroll_to_bottom_button/scroll_to_bottom_button.dart';
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
  final _scrollController = ScrollController();
  bool _isAtBottom = true;
  String? _lastMessageLastId;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _markRead();
  }

  @override
  void didUpdateWidget(ChatView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.conversationId != widget.conversationId) {
      _markRead();
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _markRead() {
    ref.read(markReadActionsProvider).call(widget.conversationId);
  }

  void _onScroll() {
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;
    final atBottom = (maxScroll - currentScroll) < 50;
    if (atBottom != _isAtBottom) {
      setState(() => _isAtBottom = atBottom);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync =
        ref.watch(conversationMessagesProvider(widget.conversationId));

    final currentMessages = messagesAsync.asData?.value;
    if (currentMessages != null && currentMessages.isNotEmpty) {
      final newLastId = currentMessages.last.id;
      if (_lastMessageLastId != null &&
          newLastId != _lastMessageLastId &&
          _isAtBottom) {
        _scrollToBottom();
      }
      _lastMessageLastId = newLastId;
    }

    final hasMessages = currentMessages != null && currentMessages.isNotEmpty;
    final showScrollButton = !_isAtBottom && hasMessages;

    final body = Column(
      children: [
        ChatViewHeader(
          conversationId: widget.conversationId,
          lang: widget.lang,
        ),
        Expanded(
          child: ChatMessageList(
            conversationId: widget.conversationId,
            scrollController: _scrollController,
          ),
        ),
        ChatInputBar(conversationId: widget.conversationId),
      ],
    );

    final content = showScrollButton
        ? Stack(
            children: [
              body,
              Positioned(
                bottom: 80,
                right: 16,
                child: ScrollToBottomButton(
                  scrollController: _scrollController,
                ),
              ),
            ],
          )
        : body;

    if (context.isMobile) {
      return Scaffold(body: content);
    }

    return content;
  }
}
