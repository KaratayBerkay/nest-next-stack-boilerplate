import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';

class OnlineAvatar extends ConsumerWidget {
  final String? imageUrl;
  final String name;
  final String userId;

  const OnlineAvatar({
    super.key,
    this.imageUrl,
    required this.name,
    required this.userId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final onlineUsers = ref.watch(onlineUsersProvider);
    final isOnline = onlineUsers.contains(userId);

    return Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border:
                isOnline ? Border.all(color: colors.success, width: 2) : null,
          ),
          child: Padding(
            padding: const EdgeInsets.all(2),
            child: Avatar(imageUrl: imageUrl, name: name),
          ),
        ),
        if (isOnline)
          Positioned(
            right: 0,
            bottom: 2,
            child: Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: colors.success,
                shape: BoxShape.circle,
                border: Border.all(color: colors.surface, width: 1.5),
              ),
            ),
          ),
      ],
    );
  }
}
