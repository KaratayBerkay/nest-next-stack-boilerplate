import 'package:flutter/material.dart';

import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';
import '../../types/messages/message.dart';

class ChatRoomMessageList extends StatelessWidget {
  final List<ChatMessage> messages;
  final String userId;
  final Set<String> onlineUserIds;
  final bool msgsLoading;
  final bool msgsError;

  const ChatRoomMessageList({
    super.key,
    required this.messages,
    required this.userId,
    this.onlineUserIds = const {},
    this.msgsLoading = false,
    this.msgsError = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (msgsError) {
      return const Center(
        child: Text(
          'Failed to load messages',
          style: TextStyle(color: Colors.red, fontSize: 12),
        ),
      );
    }

    if (msgsLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (messages.isEmpty) {
      return Center(
        child: Text(
          'No messages yet',
          style: TextStyle(color: colors.fgMuted, fontSize: 12),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: messages.length,
      itemBuilder: (_, i) {
        final msg = messages[i];
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
