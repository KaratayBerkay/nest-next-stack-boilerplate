import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../lib/tier_view.dart';
import 'messages_sidebar.dart';
import 'free_page_view.dart';
import 'basic_page_view.dart';
import 'medium_page_view.dart';
import 'premium_page_view.dart';

class MessagesPageContent extends ConsumerWidget {
  final String lang;

  const MessagesPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TierGate(
      freeWidget: FreeMessagesPage(lang: lang),
      basicWidget: BasicMessagesPage(lang: lang),
      mediumWidget: MediumMessagesPage(lang: lang),
      premiumWidget: PremiumMessagesPage(lang: lang),
    );
  }
}
