import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/query.dart';
import '../../components/feed/post_card.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../l10n/app_localizations.dart';

class FreeFeedPage extends ConsumerWidget {
  final String lang;
  const FreeFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(feedProvider);
    final t = AppLocalizations.of(context);

    return postsAsync.when(
      loading: () => const Column(
        children: [
          SizedBox(height: 16),
          Spinner(),
        ],
      ),
      error: (err, _) => EmptyWidget(
        title: t.feedFailedToLoadPosts,
        description: err.toString(),
        icon: Icons.error_outline,
      ),
      data: (posts) {
        if (posts.isEmpty) {
          return EmptyWidget(
            title: t.feedNoPostsYet,
            description: t.feedEmptyDescription,
            icon: Icons.article_outlined,
          );
        }
        return RefreshIndicator(
          onRefresh: () => ref.refresh(feedProvider.future),
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
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
