import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../lib/tier_view.dart';
import 'free_page_view.dart';
import 'basic_page_view.dart';
import 'medium_page_view.dart';
import 'premium_page_view.dart';

class FindFriendsPageContent extends ConsumerWidget {
  final String lang;

  const FindFriendsPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TierGate(
      freeWidget: FreeFindFriendsPage(lang: lang),
      basicWidget: BasicFindFriendsPage(lang: lang),
      mediumWidget: MediumFindFriendsPage(lang: lang),
      premiumWidget: PremiumFindFriendsPage(lang: lang),
    );
  }
}
