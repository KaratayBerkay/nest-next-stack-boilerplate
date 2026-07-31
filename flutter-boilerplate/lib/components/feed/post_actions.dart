import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/posts/query.dart';
import '../../constants/theme.dart';
import '../../types/feed/post.dart';
import 'comment_section.dart';

class PostActions extends ConsumerStatefulWidget {
  final Post postData;
  final String? currentUserId;
  final VoidCallback? onCommentAdded;
  final Future<void> Function(String postId, String body, String? parentId)?
      onCreateComment;
  final Future<void> Function(String commentId, String body)? onUpdateComment;
  final Future<void> Function(String commentId)? onDeleteComment;
  final Future<void> Function(String type, String? postId, String? commentId)?
      onToggleReaction;

  const PostActions({
    super.key,
    required this.postData,
    this.currentUserId,
    this.onCommentAdded,
    this.onCreateComment,
    this.onUpdateComment,
    this.onDeleteComment,
    this.onToggleReaction,
  });

  @override
  ConsumerState<PostActions> createState() => _PostActionsState();
}

class _PostActionsState extends ConsumerState<PostActions> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final commentsAsync = ref.watch(postCommentsProvider(widget.postData.id));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            children: [
              IconButton(
                icon: Icon(
                  _isExpanded ? Icons.message : Icons.message_outlined,
                  size: 16,
                  color: _isExpanded ? colors.brand : colors.fgMuted,
                ),
                onPressed: () => setState(() => _isExpanded = !_isExpanded),
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                padding: EdgeInsets.zero,
                tooltip: 'Comments',
              ),
              Text(
                '${widget.postData.commentCount}',
                style: TextStyle(fontSize: 11, color: colors.fgMuted),
              ),
            ],
          ),
        ),
        if (_isExpanded)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: commentsAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(16),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Error: $e',
                  style: TextStyle(color: colors.fgMuted, fontSize: 11),
                ),
              ),
              data: (comments) => CommentSection(
                postId: widget.postData.id,
                comments: comments,
                currentUserId: widget.currentUserId,
                onCommentAdded: widget.onCommentAdded,
                onCreateComment: widget.onCreateComment,
                onUpdateComment: widget.onUpdateComment,
                onDeleteComment: widget.onDeleteComment,
                onToggleReaction: widget.onToggleReaction,
              ),
            ),
          ),
      ],
    );
  }
}
