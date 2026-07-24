import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/posts/query.dart';
import '../../../hooks/use_auth.dart';
import 'post_detail_base_view.dart';

class PremiumPostDetailPage extends ConsumerWidget {
  final String lang;
  final String postId;

  const PremiumPostDetailPage({
    super.key,
    required this.lang,
    required this.postId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postAsync = ref.watch(postProvider(postId));
    final user = ref.watch(currentUserProvider);

    return postAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(title: const Text('Post')),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(title: const Text('Post')),
        body: Center(child: Text('Error: $e')),
      ),
      data: (post) {
        final isAuthor = user?.id == post.id;
        return PostDetailBaseView(
          post: post,
          lang: lang,
          showReactions: true,
          showEdit: isAuthor,
          showWhoReacted: true,
        );
      },
    );
  }
}
