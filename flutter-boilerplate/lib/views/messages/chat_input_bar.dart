import 'dart:async';

import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/messages/actions.dart';
import '../../components/ui/toast/toast.dart';
import '../../constants/chat.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/messages/message_attachment.dart';

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
  MessageAttachment? _pendingAttachment;
  bool _attaching = false;
  bool _emojiOpen = false;

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

  Future<void> _pickAttachment() async {
    final result = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: const [
        'jpg',
        'jpeg',
        'png',
        'webp',
        'gif',
        'avif',
        'pdf',
        'doc',
        'docx',
        'txt',
      ],
    );
    if (result == null || result.files.isEmpty) return;
    if (!mounted) return;

    final file = result.files.first;
    final path = file.path;
    if (path == null) return;

    final t = AppLocalizations.of(context);
    if (file.size > ChatConstants.maxAttachmentSize) {
      showToast(context, t.messagesAttachmentTooLarge);
      return;
    }

    setState(() => _attaching = true);
    try {
      final attachment = await ref
          .read(messageActionsProvider)
          .uploadAttachment(path, file.name);
      if (!mounted) return;
      setState(() {
        _pendingAttachment = attachment;
        _attaching = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _attaching = false);
      showToast(context, t.messagesAttachmentUploadFailed);
    }
  }

  void _insertEmoji(Emoji emoji) {
    final text = _controller.text;
    final selection = _controller.selection;
    final start = selection.isValid ? selection.start : text.length;
    final end = selection.isValid ? selection.end : text.length;
    final updated = text.replaceRange(start, end, emoji.emoji);
    _controller.value = TextEditingValue(
      text: updated,
      selection: TextSelection.collapsed(offset: start + emoji.emoji.length),
    );
  }

  Future<void> _sendMessage() async {
    // Block send while the attachment upload is in flight — sending early
    // silently drops the attachment. This also covers the keyboard/IME
    // submit path, which bypasses the button-level disabled state (F35).
    if (_attaching) return;
    final text = _controller.text.trim();
    if (text.isEmpty && _pendingAttachment == null) return;

    _sendTypingStop();

    await ref.read(messageActionsProvider).sendMessage(
          widget.conversationId,
          text,
          attachment: _pendingAttachment,
        );
    if (!mounted) return;
    _controller.clear();
    setState(() => _pendingAttachment = null);
    widget.onSent?.call();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final canSend = !_attaching &&
        (_controller.text.trim().isNotEmpty || _pendingAttachment != null);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      decoration: BoxDecoration(
        color: colors.surface,
        border: Border(top: BorderSide(color: colors.border)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_emojiOpen)
            SizedBox(
              height: 260,
              child: EmojiPicker(
                onEmojiSelected: (_, emoji) {
                  setState(() {
                    _insertEmoji(emoji);
                    _emojiOpen = false;
                  });
                },
              ),
            ),
          if (_pendingAttachment != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.attach_file, size: 14, color: colors.fgMuted),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      _pendingAttachment!.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 12, color: colors.fg),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 16),
                    visualDensity: VisualDensity.compact,
                    onPressed: () => setState(() => _pendingAttachment = null),
                  ),
                ],
              ),
            ),
          Row(
            children: [
              IconButton(
                icon: Icon(
                  Icons.emoji_emotions_outlined,
                  color: colors.fgMuted,
                  size: 22,
                ),
                onPressed: _attaching
                    ? null
                    : () => setState(() => _emojiOpen = !_emojiOpen),
              ),
              IconButton(
                icon: _attaching
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Icon(Icons.attach_file, color: colors.fgMuted, size: 22),
                onPressed: _attaching ? null : _pickAttachment,
              ),
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
                onPressed: canSend ? _sendMessage : null,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
