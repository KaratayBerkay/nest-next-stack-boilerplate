import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class BasicNotificationPage extends StatelessWidget {
  final String lang;

  const BasicNotificationPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Center(child: Text(t.notificationBasicFeatures));
  }
}
