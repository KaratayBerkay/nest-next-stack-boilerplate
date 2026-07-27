import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/messages/actions.dart';
import '../../constants/chat.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class ChatInputBar extends ConsumerStatefulWidget {
  final String conversationId;
  final VoidCallback? onSent;

  const ChatInputBar({
    super.key,
    required this.conversationId,
    this.onSent,
  });

  @override
  ConsumerState<ChatInputBar> createState() => _ChatInputBarState();
}

class _ChatInputBarState extends ConsumerState<ChatInputBar> {
  final _controller = TextEditingController();
  Timer? _typingStopTimer;
  bool _isTyping = false;

  @override
  void dispose() {
    _sendTypingStop();
    _typingStopTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onTextChanged(String text) {
    if (text.trim().isNotEmpty && !_isTyping) {
      _isTyping = true;
      _sendTypingStart();
    }

    _typingStopTimer?.cancel();
    if (text.trim().isNotEmpty) {
      _typingStopTimer = Timer(ChatConstants.typingTimeout, () {
        _sendTypingStop();
      });
    } else {
      _sendTypingStop();
    }
  }

  void _sendTypingStart() {
    ref.read(realtimeProvider).send({
      'type': 'typing-start',
      'recipientId': widget.conversationId,
    });
  }

  void _sendTypingStop() {
    if (!_isTyping) return;
    _isTyping = false;
    _typingStopTimer?.cancel();
    ref.read(realtimeProvider).send({
      'type': 'typing-stop',
      'recipientId': widget.conversationId,
    });
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    _sendTypingStop();

    await ref
        .read(messageActionsProvider)
        .sendMessage(widget.conversationId, text);
    if (!mounted) return;
    _controller.clear();
    widget.onSent?.call();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      decoration: BoxDecoration(
        color: colors.surface,
        border: Border(top: BorderSide(color: colors.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: t.messagesInputPlaceholder,
                border: const OutlineInputBorder(),
                isDense: true,
              ),
              onChanged: _onTextChanged,
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: Icon(Icons.send, color: colors.brand),
            onPressed: _sendMessage,
          ),
        ],
      ),
    );
  }
}
