import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/query.dart';
import '../../components/feed/post_card.dart';
import '../../types/feed/post.dart';
import 'feed_base_view.dart';

class PremiumFeedPage extends ConsumerWidget {
  final String lang;
  const PremiumFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FeedBaseView(
      lang: lang,
      showSidebar: true,
      builder: (posts) {
        return RefreshIndicator(
          onRefresh: () => ref.refresh(feedProvider.future),
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 4),
            itemCount: posts.length,
            itemBuilder: (_, i) => _PremiumPostCard(
              post: posts[i],
              lang: lang,
            ),
          ),
        );
      },
    );
  }
}

class _PremiumPostCard extends StatelessWidget {
  final Post post;
  final String lang;

  const _PremiumPostCard({
    required this.post,
    required this.lang,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        PostCard(
          post: post,
          onTap: () => context.push('/v1/$lang/posts/${post.id}'),
          onLike: () {},
          onComment: () => context.push('/v1/$lang/posts/${post.id}'),
        ),
      ],
    );
  }
}
