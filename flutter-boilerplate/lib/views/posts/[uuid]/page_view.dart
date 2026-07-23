import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../lib/tier_view.dart';
import '../../../constants/theme.dart';
import '../../../api/client/posts/query.dart';
import '../../../api/client/posts/actions.dart';
import '../../../types/feed/post.dart';
import 'free_page_view.dart';
import 'basic_page_view.dart';
import 'medium_page_view.dart';
import 'premium_page_view.dart';

class PostDetailPage extends ConsumerWidget {
  final String lang;
  final String postId;

  const PostDetailPage({super.key, required this.lang, required this.postId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(postProvider(postId));

    return TierGate(
      freeWidget: FreePostDetailPage(postId: postId, lang: lang),
      basicWidget: BasicPostDetailPage(postId: postId, lang: lang),
      mediumWidget: MediumPostDetailPage(postId: postId, lang: lang),
      premiumWidget: PremiumPostDetailPage(postId: postId, lang: lang),
    );
  }
}
