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
      // `_lastMessageLastId` starts null, so the first successful load also
      // satisfies `newLastId != _lastMessageLastId` — that's intentional
      // (mirrors the web's `useAutoScroll`, whose `lastIdRef` starts null
      // too) and is what makes a freshly-opened conversation land at the
      // bottom instead of wherever ListView happens to initialize.
      if (newLastId != _lastMessageLastId && _isAtBottom) {
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
        ChatInputBar(
          conversationId: widget.conversationId,
          onSent: _scrollToBottom,
        ),
      ],
    );

    // The Stack itself must stay unconditional — swapping between
    // `Stack(...)` and a bare `body` (rather than toggling only the
    // Positioned child) changes `body`'s ancestor at this slot, which makes
    // Flutter tear down and recreate the ListView's Scrollable and reset its
    // scroll offset to 0. That's the "slides down then pops back" bug: it
    // fires right as `_isAtBottom` flips true from the button's own scroll.
    final content = Stack(
      children: [
        body,
        if (showScrollButton)
          Positioned(
            bottom: 80,
            right: 16,
            child: ScrollToBottomButton(
              scrollController: _scrollController,
            ),
          ),
      ],
    );

    if (context.isMobile) {
      return Scaffold(body: content);
    }

    return content;
  }
}
