import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/feed/post_card.dart';
import 'feed_base_view.dart';

class MediumFeedPage extends ConsumerWidget {
  final String lang;
  const MediumFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FeedBaseView(
      lang: lang,
      showSidebar: true,
      cardBuilder: (post) => PostCard(post: post, lang: lang),
    );
  }
}
