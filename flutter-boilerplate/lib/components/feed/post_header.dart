import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/date_time.dart';

import '../../constants/theme.dart';
import '../../types/feed/post.dart';
import '../ui/avatar/avatar.dart';
import 'reaction_buttons.dart';

class PostHeader extends StatelessWidget {
  final Post postData;
  final bool isOwn;
  final bool editing;
  final VoidCallback? onRefresh;
  final VoidCallback? onEditStart;
  final VoidCallback? onDeleteConfirm;
  final VoidCallback? onViewPost;
  final Future<void> Function(String type)? onToggleReaction;

  const PostHeader({
    super.key,
    required this.postData,
    this.isOwn = false,
    this.editing = false,
    this.onRefresh,
    this.onEditStart,
    this.onDeleteConfirm,
    this.onViewPost,
    this.onToggleReaction,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Avatar(
            name: postData.authorName,
            imageUrl: postData.authorAvatarUrl,
            radius: 12,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      postData.authorName,
                      style: TextStyle(
                        color: colors.fg,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      DateTimeHelper.relative(postData.createdAt),
                      style: TextStyle(
                        color: colors.fgMuted,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              ReactionInline(
                postId: postData.id,
                reactions: postData.reactions,
                onReactionChange: onRefresh,
                onToggle: onToggleReaction,
              ),
              if (onViewPost != null)
                IconButton(
                  icon: Icon(Icons.visibility_outlined,
                      size: 14, color: colors.fgMuted,),
                  onPressed: onViewPost,
                  constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                  padding: EdgeInsets.zero,
                  tooltip: 'View post',
                ),
              if (isOwn && !editing) ...[
                IconButton(
                  icon: Icon(Icons.edit_outlined,
                      size: 14, color: colors.fgMuted,),
                  onPressed: onEditStart,
                  constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                  padding: EdgeInsets.zero,
                  tooltip: 'Edit post',
                ),
                IconButton(
                  icon: Icon(Icons.delete_outline,
                      size: 14, color: colors.fgMuted,),
                  onPressed: () async {
                    final confirmed = await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Delete post'),
                        content:
                            const Text('Are you sure you want to delete this post?'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.of(ctx).pop(false),
                            child: const Text('Cancel'),
                          ),
                          FilledButton(
                            onPressed: () => Navigator.of(ctx).pop(true),
                            child: const Text('Delete'),
                          ),
                        ],
                      ),
                    );
                    if (confirmed == true) onDeleteConfirm?.call();
                  },
                  constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                  padding: EdgeInsets.zero,
                  tooltip: 'Delete post',
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
