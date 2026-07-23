import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/posts/query.dart';
import 'post_detail_base_view.dart';

class MediumPostDetailPage extends ConsumerWidget {
  final String lang;
  final String postId;

  const MediumPostDetailPage({super.key, required this.lang, required this.postId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postAsync = ref.watch(postProvider(postId));

    return postAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(title: const Text('Post')),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(title: const Text('Post')),
        body: Center(child: Text('Error: $e')),
      ),
      data: (post) => PostDetailBaseView(
        post: post,
        lang: lang,
        showReactions: true,
      ),
    );
  }
}
