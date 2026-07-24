import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/posts/actions.dart';
import '../../../constants/theme.dart';
import '../../../types/feed/post.dart';

class ReactionBreakdown extends ConsumerWidget {
  final Post post;

  const ReactionBreakdown({super.key, required this.post});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: colors.surfaceAlt,
      ),
      child: Row(
        children: [
          IconButton(
            icon: Icon(
              post.isLiked ? Icons.favorite : Icons.favorite_border,
              color: post.isLiked ? colors.danger : colors.fgMuted,
              size: 22,
            ),
            onPressed: () =>
                ref.read(postActionsProvider).toggleReaction(post.id),
            style: IconButton.styleFrom(minimumSize: const Size(40, 40)),
          ),
          Text(
            '${post.likeCount}',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: post.isLiked ? colors.danger : colors.fg,
            ),
          ),
          const SizedBox(width: 24),
          Icon(Icons.chat_bubble_outline, size: 22, color: colors.fgMuted),
          const SizedBox(width: 6),
          Text(
            '${post.commentCount}',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: colors.fg,
            ),
          ),
          const Spacer(),
          Icon(Icons.bookmark_border, size: 22, color: colors.fgMuted),
        ],
      ),
    );
  }
}
