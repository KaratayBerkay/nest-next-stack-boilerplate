import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/date_time.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/messages/actions.dart';
import '../../components/ui/attachment_preview/attachment_preview.dart';
import '../../components/ui/confirm_dialog/confirm_dialog.dart';
import '../../components/ui/context_menu/context_menu.dart';
import '../../components/ui/toast/toast.dart';
import '../../constants/chat.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/messages/message.dart';

class ChatMessageBubble extends ConsumerWidget {
  final ChatMessage message;
  final bool isMe;
  final String? currentUserId;
  final String peerName;
  final ValueChanged<ChatMessage>? onReply;

  const ChatMessageBubble({
    super.key,
    required this.message,
    this.isMe = false,
    this.currentUserId,
    this.peerName = '',
    this.onReply,
  });

  String _replyAuthorLabel(BuildContext context, String senderId) {
    final t = AppLocalizations.of(context);
    return senderId == currentUserId ? t.messagesYou : peerName;
  }

  String _replySnippet(BuildContext context, ReplyPreview reply) {
    final t = AppLocalizations.of(context);
    if (reply.deletedAt != null) return t.messagesDeletedMessage;
    if (reply.body != null && reply.body!.isNotEmpty) return reply.body!;
    if (reply.hasAttachments) return t.messagesAttachmentLabel;
    return '';
  }

  Future<void> _deleteForMe(BuildContext context, WidgetRef ref) async {
    final t = AppLocalizations.of(context);
    try {
      await ref.read(messageActionsProvider).deleteMessageForMe(message.id);
    } catch (_) {
      if (context.mounted) {
        showToast(
          context,
          t.messagesFailedToDeleteMessage,
          type: ToastType.error,
        );
      }
    }
  }

  Future<void> _deleteForEveryone(BuildContext context, WidgetRef ref) async {
    final t = AppLocalizations.of(context);
    final confirmed = await ConfirmDialogWidget.show(
      context,
      title: t.messagesDeleteForEveryoneConfirmTitle,
      message: t.messagesDeleteForEveryoneConfirm,
      confirmText: t.messagesDeleteForEveryone,
      cancelText: t.messagesCancel,
    );
    if (confirmed != true) return;
    if (!context.mounted) return;
    try {
      await ref
          .read(messageActionsProvider)
          .deleteMessageForEveryone(message.id);
    } catch (_) {
      if (context.mounted) {
        showToast(
          context,
          t.messagesFailedToDeleteMessage,
          type: ToastType.error,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final isDeleted = message.deletedAt != null;
    final canDeleteForEveryone = isMe &&
        !isDeleted &&
        DateTime.now().difference(message.createdAt) <
            ChatConstants.deleteForEveryoneWindow;

    final bubble = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Column(
        crossAxisAlignment:
            isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          if (!isMe)
            Padding(
              padding: const EdgeInsets.only(bottom: 2),
              child: Text(
                message.senderName,
                style: TextStyle(
                  fontSize: 11,
                  color: colors.fgMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          if (!isDeleted && message.replyTo != null)
            Container(
              margin: const EdgeInsets.only(bottom: 4),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.65,
              ),
              decoration: BoxDecoration(
                color: colors.surfaceAlt,
                borderRadius: BorderRadius.circular(8),
                border: Border(
                  left: BorderSide(color: colors.brand, width: 3),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _replyAuthorLabel(context, message.replyTo!.senderId),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: colors.brand,
                    ),
                  ),
                  Text(
                    _replySnippet(context, message.replyTo!),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 12, color: colors.fgMuted),
                  ),
                ],
              ),
            ),
          if (!isDeleted)
            for (final att in message.attachments)
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: AttachmentPreview(
                  url: att.url,
                  type: att.type,
                  name: att.name,
                  thumbnailUrl: att.thumbnailUrl,
                ),
              ),
          Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment:
                isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (isDeleted)
                Flexible(
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: colors.surfaceAlt,
                      borderRadius: BorderRadius.circular(12).copyWith(
                        bottomRight: isMe ? const Radius.circular(2) : null,
                        bottomLeft: !isMe ? const Radius.circular(2) : null,
                      ),
                    ),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.65,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.block, size: 13, color: colors.fgMuted),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            t.messagesDeletedMessage,
                            style: TextStyle(
                              fontSize: 13,
                              fontStyle: FontStyle.italic,
                              color: colors.fgMuted,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else if (message.content.isNotEmpty)
                Flexible(
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isMe ? colors.brand : colors.surfaceAlt,
                      borderRadius: BorderRadius.circular(12).copyWith(
                        bottomRight: isMe ? const Radius.circular(2) : null,
                        bottomLeft: !isMe ? const Radius.circular(2) : null,
                      ),
                    ),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.65,
                    ),
                    child: Text(
                      message.content,
                      style: TextStyle(
                        fontSize: 14,
                        color: isMe ? colors.surface : colors.fg,
                      ),
                    ),
                  ),
                ),
              const SizedBox(width: 4),
              Text(
                DateTimeHelper.formatTime(message.createdAt),
                style: TextStyle(fontSize: 10, color: colors.fgMuted),
              ),
              if (isMe)
                Padding(
                  padding: const EdgeInsets.only(left: 2),
                  child: Icon(
                    message.isRead ? Icons.done_all : Icons.done,
                    size: 14,
                    color: message.isRead ? colors.brand : colors.fgMuted,
                  ),
                ),
            ],
          ),
        ],
      ),
    );

    if (isDeleted) return bubble;

    return ContextMenu(
      entries: [
        if (onReply != null)
          ContextMenuEntry(
            value: 'reply',
            label: t.messagesReply,
            icon: Icons.reply,
            onTap: () => onReply!(message),
          ),
        ContextMenuEntry(
          value: 'delete-for-me',
          label: t.messagesDeleteForMe,
          icon: Icons.delete_outline,
          onTap: () => _deleteForMe(context, ref),
        ),
        if (canDeleteForEveryone)
          ContextMenuEntry(
            value: 'delete-for-everyone',
            label: t.messagesDeleteForEveryone,
            icon: Icons.delete_forever_outlined,
            onTap: () => _deleteForEveryone(context, ref),
          ),
      ],
      child: bubble,
    );
  }
}
