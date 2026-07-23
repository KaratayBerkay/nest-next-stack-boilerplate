import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../constants/theme.dart';
import '../../../components/ui/avatar/avatar.dart';

class WhoReacted extends ConsumerWidget {
  final String postId;

  const WhoReacted({super.key, required this.postId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Reactions',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            color: colors.surfaceAlt,
          ),
          child: Row(
            children: [
              AvatarGroup(
                overlap: 6,
                avatars: [
                  Avatar(name: 'Alice', radius: 14),
                  Avatar(name: 'Bob', radius: 14),
                  Avatar(name: 'Charlie', radius: 14),
                ],
              ),
              const SizedBox(width: 12),
              Text(
                'Alice, Bob and 5 others',
                style: TextStyle(fontSize: 13, color: colors.fgMuted),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
