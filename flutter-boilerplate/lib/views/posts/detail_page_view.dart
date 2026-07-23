import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/posts/actions.dart';
import '../../api/client/posts/query.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';

class PostDetailPageContent extends ConsumerWidget {
  final String lang;
  final String postId;

  const PostDetailPageContent({super.key, required this.lang, required this.postId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(postProvider(postId));
    ref.watch(postCommentsProvider(postId));

    return TierGate(
      freeWidget: Scaffold(
        appBar: AppBar(title: const Text('Post')),
        body: const Center(child: Text('Upgrade to view post details')),
      ),
      basicWidget: _PostDetailView(postId: postId, lang: lang),
      mediumWidget: _PostDetailView(postId: postId, lang: lang),
      premiumWidget: _PostDetailView(postId: postId, lang: lang),
    );
  }
}

class _PostDetailView extends ConsumerWidget {
  final String lang;
  final String postId;

  const _PostDetailView({required this.postId, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final postAsync = ref.watch(postProvider(postId));
    final commentController = TextEditingController();

    return Scaffold(
      appBar: AppBar(title: const Text('Post')),
      body: postAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (post) => Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Row(
                    children: [
                      Avatar(name: post.authorName),
                      const SizedBox(width: 8),
                      Text(post.authorName, style: const TextStyle(fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(post.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(post.content),
                  if (post.imageUrl != null) ...[
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(post.imageUrl!, fit: BoxFit.cover),
                    ),
                  ],
                  const SizedBox(height: 16),
                  const Divider(),
                  const Text('Comments', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ref.watch(postCommentsProvider(postId)).when(
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
                        : Column(children: comments.map((c) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Avatar(name: c.authorName, radius: 12),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(c.authorName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                        Text(c.content),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),).toList(),),
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
                        ref.read(postActionsProvider).addComment(postId, text);
                        commentController.clear();
                      }
                    },
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
