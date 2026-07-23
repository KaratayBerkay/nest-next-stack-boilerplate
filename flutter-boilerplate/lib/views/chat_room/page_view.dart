import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'basic_page_view.dart';
import 'free_page_view.dart';
import 'medium_page_view.dart';
import 'premium_page_view.dart';

class ChatRoomPageContent extends ConsumerWidget {
  final String lang;
  final String? initialRoom;

  const ChatRoomPageContent({super.key, required this.lang, this.initialRoom});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TierGate(
      freeWidget: FreePageView(
        lang: lang,
        initialRoom: initialRoom ?? 'general',
        showPageInfo: true,
      ),
      basicWidget: BasicPageView(
        lang: lang,
        initialRoom: initialRoom ?? 'general',
      ),
      mediumWidget: MediumPageView(
        lang: lang,
        initialRoom: initialRoom ?? 'general',
      ),
      premiumWidget: PremiumPageView(
        lang: lang,
        initialRoom: initialRoom ?? 'general',
      ),
    );
  }
}
