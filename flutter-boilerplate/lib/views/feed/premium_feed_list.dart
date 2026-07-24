import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/query.dart';
import '../../components/feed/post_card.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/feed/post.dart';
import 'feed_base_view.dart';

class PremiumFeedList extends ConsumerWidget {
  final String lang;

  const PremiumFeedList({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FeedBaseView(
      lang: lang,
      builder: (posts) {
        return Column(
          children: [
            _PremiumBanner(),
            Expanded(
              child: FeedListView(
                lang: lang,
                posts: posts,
                onRefresh: () => ref.refresh(feedProvider.future),
                cardBuilder: (post, _) => _PremiumPostCard(
                  post: post,
                  lang: lang,
                  onLike: () => ref.read(feedProvider.future),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _PremiumBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: colors.brand.withValues(alpha: 0.1),
      child: Row(
        children: [
          Icon(Icons.auto_awesome, color: colors.brand, size: 20),
          const SizedBox(width: 8),
          Text(
            t.feedAiRecommendations,
            style: TextStyle(
              color: colors.brand,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}

class _PremiumPostCard extends StatelessWidget {
  final Post post;
  final String lang;
  final VoidCallback? onLike;

  const _PremiumPostCard({
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
