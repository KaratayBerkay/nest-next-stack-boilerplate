import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/feed/post_card.dart';
import '../../hooks/use_auth.dart';
import 'feed_base_view.dart';

class PremiumFeedPage extends ConsumerWidget {
  final String lang;
  const PremiumFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    return FeedBaseView(
      lang: lang,
      showSidebar: true,
      showPageInfo: true,
      isOwnPost: (post) => post.authorId == user?.id,
      cardBuilder: (post) => PostCard(post: post, lang: lang),
    );
  }
}
