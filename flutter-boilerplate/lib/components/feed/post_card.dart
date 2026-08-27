import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/actions.dart' hide PostActions;
import '../../api/client/posts/query.dart';
import '../../hooks/use_auth.dart';
import '../../types/feed/post.dart';
import 'post_actions.dart';
import 'post_content.dart';
import 'post_header.dart';

class PostCard extends ConsumerWidget {
  final Post post;
  final String lang;

  const PostCard({
    super.key,
    required this.post,
    required this.lang,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final isOwn = user?.id == post.authorId;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PostHeader(
            postData: post,
            isOwn: isOwn,
            currentUserId: user?.id,
            onViewPost: () => context.push('/v1/$lang/posts/${post.id}'),
            onToggleReaction: (String type) => ref
                .read(postActionsProvider)
                .toggleReaction(post.id, type: type),
            // No inline edit form on the feed card — the post detail page
            // (wired up in MOB-008) has the real edit toggle, so route there.
            onEditStart: () => context.push('/v1/$lang/posts/${post.id}'),
            onDeleteConfirm: () =>
                ref.read(postActionsProvider).delete(post.id),
            onRefresh: () => ref.invalidate(paginatedFeedProvider),
          ),
          PostContent(postData: post),
          PostActions(
            postData: post,
            currentUserId: user?.id,
            onCommentAdded: () => ref.invalidate(paginatedFeedProvider),
            onCreateComment: (String postId, String body, String? parentId) =>
                ref
                    .read(postActionsProvider)
                    .addComment(postId, body, parentId: parentId),
            onUpdateComment: (String commentId, String body) => ref
                .read(postActionsProvider)
                .updateComment(commentId, bodyText: body),
            onDeleteComment: (String commentId) =>
                ref.read(postActionsProvider).deleteComment(commentId),
            onToggleReaction:
                (String type, String? postId, String? commentId) =>
                    commentId != null
                        ? ref.read(postActionsProvider).toggleCommentReaction(
                              commentId,
                              postId: post.id,
                              type: type,
                            )
                        : ref
                            .read(postActionsProvider)
                            .toggleReaction(postId!, type: type),
          ),
        ],
      ),
    );
  }
}
