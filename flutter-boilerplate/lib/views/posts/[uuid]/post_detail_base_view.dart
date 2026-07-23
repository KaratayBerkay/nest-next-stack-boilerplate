import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/posts/query.dart';
import '../../../api/client/posts/actions.dart';
import '../../../constants/theme.dart';
import '../../../types/feed/post.dart';
import '../../../types/feed/comment.dart';
import '../../../components/ui/avatar/avatar.dart';
import 'post_header.dart';
import 'post_content_view.dart';
import 'post_edit_form.dart';
import 'reaction_breakdown.dart';
import 'who_reacted.dart';

class PostDetailBaseView extends ConsumerWidget {
  final Post post;
  final String lang;
  final bool showReactions;
  final bool showEdit;
  final bool showWhoReacted;

  const PostDetailBaseView({
    super.key,
    required this.post,
    required this.lang,
    this.showReactions = false,
    this.showEdit = false,
    this.showWhoReacted = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final commentController = TextEditingController();
    final isEditing = ValueNotifier<bool>(false);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Post'),
        actions: [
          if (showEdit)
            ValueListenableBuilder<bool>(
              valueListenable: isEditing,
              builder: (_, editing, __) => IconButton(
                icon: Icon(editing ? Icons.close : Icons.edit),
                onPressed: () => isEditing.value = !editing,
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                ValueListenableBuilder<bool>(
                  valueListenable: isEditing,
                  builder: (_, editing, __) {
                    if (editing) {
                      return PostEditForm(
                        post: post,
                        onSaved: () => isEditing.value = false,
                      );
                    }
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        PostHeader(post: post),
                        const SizedBox(height: 12),
                        PostContentView(post: post),
                        if (showReactions) ...[
                          const SizedBox(height: 16),
                          ReactionBreakdown(post: post),
                        ],
                        if (showWhoReacted) ...[
                          const SizedBox(height: 16),
                          const Divider(),
                          WhoReacted(postId: post.id),
                        ],
                        const SizedBox(height: 16),
                        const Divider(),
                        _CommentSection(postId: post.id, lang: lang),
                      ],
                    );
                  },
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            decoration: BoxDecoration(
              color: colors.surface,
              border: Border(top: BorderSide(color: colors.border)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: commentController,
                    decoration: const InputDecoration(
                      hintText: 'Write a comment...',
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: () {
                    final text = commentController.text.trim();
                    if (text.isNotEmpty) {
                      ref.read(postActionsProvider).addComment(post.id, text);
                      commentController.clear();
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CommentSection extends ConsumerWidget {
  final String postId;
  final String lang;

  const _CommentSection({required this.postId, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final commentsAsync = ref.watch(postCommentsProvider(postId));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Comments', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        commentsAsync.when(
          loading: () => const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (e, _) => Text('Error: $e'),
          data: (comments) => comments.isEmpty
              ? Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text('No comments yet', style: TextStyle(color: colors.fgMuted)),
                )
              : Column(children: comments.map((c) => _CommentTile(comment: c)).toList()),
        ),
      ],
    );
  }
}

class _CommentTile extends StatelessWidget {
  final Comment comment;

  const _CommentTile({required this.comment});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Avatar(name: comment.authorName, radius: 12),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  comment.authorName,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                ),
                Text(
                  comment.content,
                  style: TextStyle(color: colors.fg),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
