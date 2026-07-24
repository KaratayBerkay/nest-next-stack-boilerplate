import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class MediumNotificationPage extends StatelessWidget {
  final String lang;

  const MediumNotificationPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Center(child: Text(t.notificationMediumFeatures));
  }
}
