import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class NotificationHeader extends StatelessWidget {
  final String title;
  final VoidCallback? onMarkAllRead;

  const NotificationHeader({
    super.key,
    this.title = 'Notifications',
    this.onMarkAllRead,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 8, 4),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ),
          if (onMarkAllRead != null)
            TextButton.icon(
              onPressed: onMarkAllRead,
              icon: Icon(Icons.done_all, size: 18, color: colors.brand),
              label: Text(
                'Mark all read',
                style: TextStyle(fontSize: 13, color: colors.brand),
              ),
            ),
        ],
      ),
    );
  }
}
