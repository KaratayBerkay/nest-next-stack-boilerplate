import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../constants/theme.dart';
import '../../types/feed/post.dart';

class PostContent extends StatelessWidget {
  final Post postData;
  final bool editing;
  final String? editTitle;
  final String? editContent;
  final ValueChanged<String>? onTitleChange;
  final ValueChanged<String>? onContentChange;

  const PostContent({
    super.key,
    required this.postData,
    this.editing = false,
    this.editTitle,
    this.editContent,
    this.onTitleChange,
    this.onContentChange,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (postData.imageUrl != null)
            Padding(
              padding: const EdgeInsets.only(top: 2, right: 12),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: CachedNetworkImage(
                  imageUrl: postData.imageUrl!,
                  width: 64,
                  height: 64,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (editing)
                  TextField(
                    controller: TextEditingController(
                      text: editTitle ?? postData.title,
                    ),
                    onChanged: onTitleChange,
                    style: TextStyle(
                      color: colors.fg,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                    decoration: InputDecoration(
                      isDense: true,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide: BorderSide(color: colors.border),
                      ),
                    ),
                  )
                else
                  Text(
                    postData.title,
                    style: TextStyle(
                      color: colors.fg,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                const SizedBox(height: 4),
                if (editing)
                  TextField(
                    controller: TextEditingController(
                      text: editContent ?? postData.content,
                    ),
                    onChanged: onContentChange,
                    maxLines: 3,
                    style: TextStyle(color: colors.fg, fontSize: 12),
                    decoration: InputDecoration(
                      isDense: true,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide: BorderSide(color: colors.border),
                      ),
                    ),
                  )
                else
                  Text(
                    postData.content.length > 200
                        ? '${postData.content.substring(0, 200)}...'
                        : postData.content,
                    style: TextStyle(
                      color: colors.fgMuted,
                      fontSize: 12,
                      height: 1.5,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
