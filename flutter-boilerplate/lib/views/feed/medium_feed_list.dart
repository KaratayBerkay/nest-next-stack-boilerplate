import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/query.dart';
import '../../components/feed/post_card.dart';
import '../../constants/theme.dart';
import '../../types/feed/post.dart';
import 'feed_base_view.dart';

class MediumFeedList extends ConsumerWidget {
  final String lang;

  const MediumFeedList({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FeedBaseView(
      lang: lang,
      builder: (posts) {
        return FeedListView(
          lang: lang,
          posts: posts,
          onRefresh: () => ref.refresh(feedProvider.future),
          cardBuilder: (post, _) => _MediumPostCard(
            post: post,
            lang: lang,
            onLike: () => ref.read(feedProvider.future),
          ),
        );
      },
    );
  }
}

class _MediumPostCard extends StatelessWidget {
  final Post post;
  final String lang;
  final VoidCallback? onLike;

  const _MediumPostCard({
    required this.post,
    required this.lang,
    this.onLike,
  });

  @override
  Widget build(BuildContext context) {
    return PostCard(
      post: post,
      onTap: () => context.push('/v1/$lang/posts/${post.id}'),
      onLike: onLike,
      onComment: () => context.push('/v1/$lang/posts/${post.id}'),
    );
  }
}
