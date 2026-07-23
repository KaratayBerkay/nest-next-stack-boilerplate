import 'package:flutter/material.dart';

import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';

class ChatRoomHeader extends StatelessWidget {
  final String userName;
  final String? userEmail;
  final String connectionState;
  final bool showPageInfo;
  final VoidCallback? onPageInfo;

  const ChatRoomHeader({
    super.key,
    required this.userName,
    this.userEmail,
    this.connectionState = 'online',
    this.showPageInfo = false,
    this.onPageInfo,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Stack(
            children: [
              Avatar(
                name: userName.isNotEmpty ? userName : userEmail ?? '?',
                radius: 16,
              ),
              Positioned(
                right: -1,
                bottom: -1,
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: connectionState == 'online'
                        ? colors.success
                        : connectionState == 'connecting'
                            ? colors.warning
                            : colors.danger,
                    shape: BoxShape.circle,
                    border: Border.all(color: colors.surface, width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          Text(
            'Chat Rooms',
            style: TextStyle(
              color: colors.brand,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Spacer(),
          if (showPageInfo && onPageInfo != null)
            IconButton(
              icon: Icon(Icons.info_outline, size: 18, color: colors.fgMuted),
              onPressed: onPageInfo,
            ),
        ],
      ),
    );
  }
}
