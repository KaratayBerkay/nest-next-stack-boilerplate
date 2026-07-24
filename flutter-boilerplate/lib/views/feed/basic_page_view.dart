import 'package:flutter/material.dart';

import '../../components/ui/empty/empty.dart';
import '../../l10n/app_localizations.dart';

class BasicFeedPage extends StatelessWidget {
  final String lang;
  const BasicFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return EmptyWidget(
      title: t.feedBasicTitle,
      description: t.feedBasicDescription,
      icon: Icons.auto_awesome,
    );
  }
}
