import 'package:flutter/material.dart';

import '../../constants/theme.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../lib/date_time.dart';
import '../../types/notification/notification_item.dart';

class NotificationItemWidget extends StatelessWidget {
  final NotificationItem item;
  final String lang;
  final VoidCallback? onTap;

  const NotificationItemWidget({
    super.key,
    required this.item,
    required this.lang,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Avatar(
              imageUrl: item.imageUrl,
              name: item.title,
              radius: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: TextStyle(
                      fontWeight: item.isRead ? FontWeight.normal : FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    item.body,
                    style: TextStyle(fontSize: 12, color: colors.fgMuted),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    DateTimeHelper.relative(item.createdAt),
                    style: TextStyle(fontSize: 11, color: colors.fgMuted),
                  ),
                ],
              ),
            ),
            if (!item.isRead)
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: colors.brand,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
