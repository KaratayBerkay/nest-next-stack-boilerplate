import 'package:flutter/material.dart';

import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';
import '../../types/messages/friend_request_types.dart';

class PendingRequestCard extends StatelessWidget {
  final FriendRequest request;
  final VoidCallback? onAccept;
  final VoidCallback? onDecline;

  const PendingRequestCard({
    super.key,
    required this.request,
    this.onAccept,
    this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Card(
      child: ListTile(
        leading: Avatar(
          name: request.fromUserName,
          imageUrl: request.fromUserAvatar,
        ),
        title: Text(request.fromUserName),
        subtitle: Text(
          _timeAgo(request.createdAt),
          style: TextStyle(color: colors.fgMuted, fontSize: 12),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: Icon(Icons.check_circle, color: colors.success),
              onPressed: onAccept,
            ),
            IconButton(
              icon: Icon(Icons.cancel, color: colors.danger),
              onPressed: onDecline,
            ),
          ],
        ),
      ),
    );
  }

  String _timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}
