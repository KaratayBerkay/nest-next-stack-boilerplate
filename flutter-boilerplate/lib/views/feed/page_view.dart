import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'basic_page_view.dart';
import 'free_page_view.dart';
import 'medium_page_view.dart';
import 'premium_page_view.dart';

class FeedPageContent extends ConsumerWidget {
  final String lang;

  const FeedPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TierGate(
      freeWidget: FreeFeedPage(lang: lang),
      basicWidget: BasicFeedPage(lang: lang),
      mediumWidget: MediumFeedPage(lang: lang),
      premiumWidget: PremiumFeedPage(lang: lang),
    );
  }
}
