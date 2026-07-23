import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/query.dart';
import '../../components/feed/post_card.dart';
import 'feed_base_view.dart';

class FreeFeedList extends ConsumerWidget {
  final String lang;

  const FreeFeedList({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FeedBaseView(
      lang: lang,
      builder: (posts) {
        return FeedListView(
          lang: lang,
          posts: posts,
          onRefresh: () => ref.refresh(feedProvider.future),
          cardBuilder: (post, _) => PostCard(
            post: post,
            onTap: () => context.push('/v1/$lang/posts/${post.id}'),
            onLike: () => ref.read(feedProvider.future),
            onComment: () => context.push('/v1/$lang/posts/${post.id}'),
          ),
        );
      },
    );
  }
}
