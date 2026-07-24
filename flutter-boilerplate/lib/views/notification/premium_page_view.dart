import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class PremiumNotificationPage extends StatelessWidget {
  final String lang;

  const PremiumNotificationPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Center(child: Text(t.notificationPremiumFeatures));
  }
}
