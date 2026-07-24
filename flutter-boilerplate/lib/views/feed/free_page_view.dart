import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/query.dart';
import '../../components/feed/post_card.dart';
import 'feed_base_view.dart';

class FreeFeedPage extends ConsumerWidget {
  final String lang;
  const FreeFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FeedBaseView(
      lang: lang,
      showPageInfo: true,
      builder: (posts) {
        return RefreshIndicator(
          onRefresh: () => ref.refresh(feedProvider.future),
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 4),
            itemCount: posts.length,
            itemBuilder: (_, i) => PostCard(
              post: posts[i],
              onTap: () => context.push('/v1/$lang/posts/${posts[i].id}'),
              onLike: () => ref.read(feedProvider.future),
              onComment: () => context.push('/v1/$lang/posts/${posts[i].id}'),
            ),
          ),
        );
      },
    );
  }
}
