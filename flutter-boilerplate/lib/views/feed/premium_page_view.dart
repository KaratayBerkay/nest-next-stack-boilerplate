import 'package:flutter/material.dart';

import '../../components/ui/empty/empty.dart';
import '../../l10n/app_localizations.dart';

class PremiumFeedPage extends StatelessWidget {
  final String lang;
  const PremiumFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return EmptyWidget(
      title: t.feedPremiumTitle,
      description: t.feedPremiumDescription,
      icon: Icons.workspace_premium,
    );
  }
}
