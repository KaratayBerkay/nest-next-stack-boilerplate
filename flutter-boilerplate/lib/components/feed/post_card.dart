import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/date_time.dart';

import '../../constants/theme.dart';
import '../../types/feed/post.dart';
import '../ui/avatar/avatar.dart';

class PostCard extends StatelessWidget {
  final Post post;
  final VoidCallback? onTap;
  final VoidCallback? onLike;
  final VoidCallback? onComment;

  const PostCard({
    super.key,
    required this.post,
    this.onTap,
    this.onLike,
    this.onComment,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Row(
                children: [
                  Avatar(
                    imageUrl: post.authorAvatarUrl,
                    name: post.authorName,
                    radius: 18,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          post.authorName,
                          style: typography.label,
                        ),
                        Text(
                          DateTimeHelper.relative(post.createdAt),
                          style: TextStyle(
                            fontSize: 11,
                            color: colors.fgMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Image
            if (post.imageUrl != null) ...[
              const SizedBox(height: 12),
              CachedNetworkImage(
                imageUrl: post.imageUrl!,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
                placeholder: (_, __) => Container(
                  height: 200,
                  color: colors.surfaceHover,
                ),
              ),
            ],

            // Title & Content
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    post.title,
                    style: typography.h4,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    post.content,
                    style: typography.body,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            // Actions
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(
                      post.isLiked ? Icons.favorite : Icons.favorite_border,
                      size: 20,
                      color: post.isLiked ? colors.danger : colors.fgMuted,
                    ),
                    tooltip: 'Like',
                    onPressed: onLike,
                    style: IconButton.styleFrom(
                      minimumSize: const Size(36, 36),
                    ),
                  ),
                  Text(
                    '${post.likeCount}',
                    style: TextStyle(fontSize: 12, color: colors.fgMuted),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: Icon(Icons.chat_bubble_outline, size: 20, color: colors.fgMuted),
                    tooltip: 'Comment',
                    onPressed: onComment,
                    style: IconButton.styleFrom(minimumSize: const Size(36, 36)),
                  ),
                  Text(
                    '${post.commentCount}',
                    style: TextStyle(fontSize: 12, color: colors.fgMuted),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: Icon(Icons.bookmark_border, size: 20, color: colors.fgMuted),
                    onPressed: null,
                    style: IconButton.styleFrom(minimumSize: const Size(36, 36)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
