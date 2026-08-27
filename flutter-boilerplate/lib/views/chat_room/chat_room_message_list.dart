import 'package:flutter/material.dart';

import '../../components/ui/attachment_preview/attachment_preview.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../components/ui/button/button.dart';
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
  });

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

        return Padding(
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
                    if (msg.content.isNotEmpty)
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
      },
    );
  }
}
