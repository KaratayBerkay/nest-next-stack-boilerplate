import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
      cardBuilder: (post) => PostCard(post: post, lang: lang),
    );
  }
}
