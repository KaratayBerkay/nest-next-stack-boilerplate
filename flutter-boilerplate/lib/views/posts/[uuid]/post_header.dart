import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/date_time.dart';

import '../../../components/ui/avatar/avatar.dart';
import '../../../constants/theme.dart';
import '../../../types/feed/post.dart';

class PostHeader extends StatelessWidget {
  final Post post;

  const PostHeader({super.key, required this.post});

  @override
  Widget build(BuildContext context) {
    final typography = AppTypography.of(context);

    return Row(
      children: [
        Avatar(
          imageUrl: post.authorAvatarUrl,
          name: post.authorName,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(post.authorName, style: typography.label),
              Text(
                DateTimeHelper.relative(post.createdAt),
                style: TextStyle(
                  fontSize: 11,
                  color: AppColors.of(context).fgMuted,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
