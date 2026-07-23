import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../constants/theme.dart';
import '../../../types/feed/post.dart';

class PostContentView extends StatelessWidget {
  final Post post;

  const PostContentView({super.key, required this.post});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(post.title, style: typography.h2),
        const SizedBox(height: 8),
        Text(post.content, style: typography.body),
        if (post.imageUrl != null) ...[
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              imageUrl: post.imageUrl!,
              width: double.infinity,
              fit: BoxFit.cover,
              placeholder: (_, __) => Container(
                height: 240,
                color: colors.surfaceHover,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
