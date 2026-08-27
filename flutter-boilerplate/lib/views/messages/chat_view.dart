import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/client/messages/mark_read.dart';
import 'package:flutter_boilerplate/api/client/messages/query.dart';
import 'package:flutter_boilerplate/components/ui/scroll_to_bottom_button/scroll_to_bottom_button.dart';
import 'package:flutter_boilerplate/lib/container.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/usage/query.dart';
import '../../hooks/use_auth.dart';
import '../../l10n/app_localizations.dart';
import '../../types/messages/message.dart';
import 'chat_input_bar.dart';
import 'chat_message_list.dart';
import 'chat_view_header.dart';
import 'storage_limit_notice.dart';

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
  ChatMessage? _replyTarget;

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

  String _replyTargetLabel() {
    final target = _replyTarget;
    if (target == null) return '';
    final myId = ref.read(currentUserProvider)?.id;
    return target.senderId == myId
        ? AppLocalizations.of(context).messagesYou
        : target.senderName;
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
    WidgetsBinding.instance.addPostFrameCallback((_) => _settleToBottom());
  }

  /// `maxScrollExtent` is only an estimate until every item between the
  /// current viewport and the end has actually been built — `ListView`
  /// only lays out items near what's visible. For a long conversation, a
  /// single jump/animate to that estimate undershoots, because scrolling
  /// through is what makes Flutter build (and correct the estimate for)
  /// the rest. Keep jumping to the newest estimate, one frame at a time,
  /// until it stops growing, then finish with one smooth animation.
  void _settleToBottom([int attempt = 0]) {
    if (!_scrollController.hasClients) return;
    final before = _scrollController.position.maxScrollExtent;
    _scrollController.jumpTo(before);
    if (attempt >= 8) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      final after = _scrollController.position.maxScrollExtent;
      if (after > before) {
        _settleToBottom(attempt + 1);
      } else {
        _scrollController.animateTo(
          after,
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final messagesState =
        ref.watch(conversationMessagesProvider(widget.conversationId));

    final currentMessages = messagesState.items;
    if (currentMessages.isNotEmpty) {
      final newLastId = currentMessages.last.id;
      // `_lastMessageLastId` starts null, so the first successful load also
      // satisfies `newLastId != _lastMessageLastId` — that's intentional
      // (mirrors the web's `useAutoScroll`, whose `lastIdRef` starts null
      // too) and is what makes a freshly-opened conversation land at the
      // bottom instead of wherever ListView happens to initialize.
      if (newLastId != _lastMessageLastId && _isAtBottom) {
        _scrollToBottom();
      }
      // Live delivery (realtime_provider.dart's 'direct-message' handler)
      // already tries to mark-read inline off the raw WS frame the instant
      // it lands — but that only catches a message that arrives at exactly
      // the moment its own frame is processed. Doing it here too, driven by
      // the same refetch that's already proven to reach this screen (it's
      // what renders the bubble), catches everything else: several
      // messages landing in a burst, one that arrived a moment before this
      // conversation became the active one, etc. `markMessagesRead` is a
      // bulk "everything from this peer" call, so triggering off just the
      // last message is enough.
      if (newLastId != _lastMessageLastId) {
        final last = currentMessages.last;
        final myId = ref.read(currentUserProvider)?.id;
        if (!last.isRead && last.senderId != myId) {
          _markRead();
        }
      }
      _lastMessageLastId = newLastId;
    }

    final hasMessages = currentMessages.isNotEmpty;
    final showScrollButton = !_isAtBottom && hasMessages;

    final messageUsage = ref.watch(messageUsageProvider).asData?.value;
    final storageLimitReached =
        messageUsage != null && messageUsage.bytes >= messageUsage.limitBytes;

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
            onReply: (msg) => setState(() => _replyTarget = msg),
          ),
        ),
        if (storageLimitReached)
          const StorageLimitNotice()
        else
          ChatInputBar(
            conversationId: widget.conversationId,
            onSent: _scrollToBottom,
            replyTarget: _replyTarget,
            replyTargetLabel: _replyTargetLabel(),
            onCancelReply: () => setState(() => _replyTarget = null),
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
