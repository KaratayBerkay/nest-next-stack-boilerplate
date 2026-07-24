import 'package:flutter/material.dart';

import '../../components/ui/empty/empty.dart';
import '../../l10n/app_localizations.dart';

class MediumFeedPage extends StatelessWidget {
  final String lang;
  const MediumFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return EmptyWidget(
      title: t.feedMediumTitle,
      description: t.feedMediumDescription,
      icon: Icons.trending_up,
    );
  }
}
