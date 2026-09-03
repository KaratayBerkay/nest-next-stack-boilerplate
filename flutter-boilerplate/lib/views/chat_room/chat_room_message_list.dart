import 'package:flutter/material.dart';

import '../../components/ui/attachment_preview/attachment_preview.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../components/ui/button/button.dart';
import '../../components/ui/context_menu/context_menu.dart';
import '../../constants/chat.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/messages/message.dart';

class ChatRoomMessageList extends StatelessWidget {
  final List<ChatMessage> messages;
  final bool hasMore;
  final bool isLoadingMore;
  final VoidCallback? onLoadMore;
  final String userId;
  final Set<String> onlineUserIds;
  final bool msgsLoading;
  final bool msgsError;
  final ScrollController? scrollController;
  // CROSS-024: when wired, live messages get a long-press menu with
  // Reply / Delete for me / Delete for everyone (sender, inside the window).
  final ValueChanged<ChatMessage>? onReply;
  final ValueChanged<ChatMessage>? onDeleteForMe;
  final ValueChanged<ChatMessage>? onDeleteForEveryone;

  const ChatRoomMessageList({
    super.key,
    required this.messages,
    this.hasMore = false,
    this.isLoadingMore = false,
    this.onLoadMore,
    required this.userId,
    this.onlineUserIds = const {},
    this.msgsLoading = false,
    this.msgsError = false,
    this.scrollController,
    this.onReply,
    this.onDeleteForMe,
    this.onDeleteForEveryone,
  });

  String _replySnippet(AppLocalizations t, ReplyPreview reply) {
    if (reply.deletedAt != null) return t.messagesDeletedMessage;
    if (reply.body != null && reply.body!.isNotEmpty) return reply.body!;
    if (reply.hasAttachments) return t.messagesAttachmentLabel;
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (msgsError) {
      return Center(
        child: Text(
          AppLocalizations.of(context).messagesFailedToLoad,
          style: TextStyle(color: colors.danger, fontSize: 12),
        ),
      );
    }

    if (msgsLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (messages.isEmpty) {
      return Center(
        child: Text(
          AppLocalizations.of(context).chatRoomNoMessages,
          style: TextStyle(color: colors.fgMuted, fontSize: 12),
        ),
      );
    }

    return ListView.builder(
      controller: scrollController,
      // Extra bottom padding is deliberate margin above the input bar — it's
      // part of the scrollable content, so "scroll to bottom" naturally
      // settles with this gap already showing instead of stopping short of
      // it (see ChatRoomMainContent/ChatView, which no longer add a static
      // sibling gap for the same reason).
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 24),
      itemCount: messages.length + (hasMore ? 1 : 0),
      itemBuilder: (_, i) {
        if (hasMore && i == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Center(
              child: Button(
                variant: ButtonVariant.secondary,
                size: ButtonSize.sm,
                loading: isLoadingMore,
                onPressed: onLoadMore,
                child: Text(AppLocalizations.of(context).chatRoomLoadEarlier),
              ),
            ),
          );
        }
        final msg = messages[i - (hasMore ? 1 : 0)];
        final isMe = msg.senderId == userId;
        final t = AppLocalizations.of(context);
        final isDeleted = msg.deletedAt != null;
        final canDeleteForEveryone = isMe &&
            !isDeleted &&
            DateTime.now().difference(msg.createdAt) <
                ChatConstants.deleteForEveryoneWindow;

        final row = Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            textDirection: isMe ? TextDirection.rtl : TextDirection.ltr,
            children: [
              if (!isMe)
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: Stack(
                    children: [
                      Avatar(
                        name: msg.senderName,
                        radius: 12,
                      ),
                      if (onlineUserIds.contains(msg.senderId))
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: colors.success,
                              shape: BoxShape.circle,
                              border:
                                  Border.all(color: colors.surface, width: 1.5),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              Flexible(
                child: Column(
                  crossAxisAlignment:
                      isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                  children: [
                    if (!isMe)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Text(
                          msg.senderName,
                          style: TextStyle(
                            color: colors.fgMuted,
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    if (!isDeleted && msg.replyTo != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 4),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 6,
                        ),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.65,
                        ),
                        decoration: BoxDecoration(
                          color: colors.surfaceAlt,
                          borderRadius: BorderRadius.circular(8),
                          border: Border(
                            left: BorderSide(color: colors.brand, width: 2),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              msg.replyTo!.senderId == userId
                                  ? t.messagesYou
                                  : (msg.replyTo!.senderName ?? ''),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                color: colors.brand,
                              ),
                            ),
                            Text(
                              _replySnippet(t, msg.replyTo!),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12,
                                color: colors.fgMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    if (isDeleted)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: colors.surfaceAlt,
                          borderRadius: BorderRadius.circular(12),
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
                    if (!isDeleted)
                      for (final att in msg.attachments)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: AttachmentPreview(
                            url: att.url,
                            type: att.type,
                            name: att.name,
                            thumbnailUrl: att.thumbnailUrl,
                          ),
                        ),
                    if (!isDeleted && msg.content.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: isMe ? colors.brand : colors.surfaceAlt,
                          borderRadius: BorderRadius.circular(12).copyWith(
                            bottomRight:
                                isMe ? Radius.zero : const Radius.circular(12),
                            bottomLeft:
                                !isMe ? Radius.zero : const Radius.circular(12),
                          ),
                        ),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.7,
                        ),
                        child: Text(
                          msg.content,
                          style: TextStyle(
                            fontSize: 14,
                            color: isMe ? colors.surface : colors.fg,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );

        if (isDeleted || onReply == null) return row;
        return ContextMenu(
          entries: [
            ContextMenuEntry(
              value: 'reply',
              label: t.messagesReply,
              icon: Icons.reply,
              onTap: () => onReply!(msg),
            ),
            if (onDeleteForMe != null)
              ContextMenuEntry(
                value: 'delete-for-me',
                label: t.messagesDeleteForMe,
                icon: Icons.delete_outline,
                onTap: () => onDeleteForMe!(msg),
              ),
            if (canDeleteForEveryone && onDeleteForEveryone != null)
              ContextMenuEntry(
                value: 'delete-for-everyone',
                label: t.messagesDeleteForEveryone,
                icon: Icons.delete_forever_outlined,
                onTap: () => onDeleteForEveryone!(msg),
              ),
          ],
          child: row,
        );
      },
    );
  }
}
