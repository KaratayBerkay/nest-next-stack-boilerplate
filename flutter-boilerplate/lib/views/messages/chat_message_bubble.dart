import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/date_time.dart';

import '../../constants/theme.dart';
import '../../types/messages/message.dart';

class ChatMessageBubble extends StatelessWidget {
  final ChatMessage message;
  final bool isMe;

  const ChatMessageBubble({
    super.key,
    required this.message,
    this.isMe = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Column(
        crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          if (!isMe)
            Padding(
              padding: const EdgeInsets.only(bottom: 2),
              child: Text(
                message.senderName,
                style: TextStyle(fontSize: 11, color: colors.fgMuted, fontWeight: FontWeight.w500),
              ),
            ),
          Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
  }
}
