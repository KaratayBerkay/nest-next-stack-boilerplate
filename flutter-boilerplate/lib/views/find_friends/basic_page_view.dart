import 'package:flutter/material.dart';

import '../../components/ui/empty/empty.dart';
import '../../l10n/app_localizations.dart';

class BasicFindFriendsPage extends StatelessWidget {
  final String lang;

  const BasicFindFriendsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return EmptyWidget(
      title: t.findFriendsTitle,
      description: t.findFriendsUpgradeToSee,
      icon: Icons.people_outline,
    );
  }
}
