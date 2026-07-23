import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/query.dart';
import '../../components/feed/post_card.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../components/ui/empty/empty.dart';
import '../../types/feed/post.dart';

class FeedBaseView extends ConsumerWidget {
  final String lang;
  final Widget Function(List<Post> posts) builder;

  const FeedBaseView({
    super.key,
    required this.lang,
    required this.builder,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(feedProvider);

    return postsAsync.when(
      loading: () => const Column(
        children: [
          SizedBox(height: 16),
          Spinner(),
        ],
      ),
      error: (err, _) => EmptyWidget(
        title: 'Failed to load feed',
        description: err.toString(),
        icon: Icons.error_outline,
      ),
      data: (posts) {
        if (posts.isEmpty) {
          return const EmptyWidget(
            title: 'No posts yet',
            description: 'Follow people to see their posts here.',
            icon: Icons.article_outlined,
          );
        }
        return builder(posts);
      },
    );
  }
}

class FeedListView extends StatelessWidget {
  final String lang;
  final List<Post> posts;
  final Widget Function(Post post, int index) cardBuilder;
  final Future<void> Function()? onRefresh;

  const FeedListView({
    super.key,
    required this.lang,
    required this.posts,
    required this.cardBuilder,
    this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh ?? () async {},
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: posts.length,
        itemBuilder: (_, i) => cardBuilder(posts[i], i),
      ),
    );
  }
}
