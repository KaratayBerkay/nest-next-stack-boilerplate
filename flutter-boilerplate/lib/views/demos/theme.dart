import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class ThemeDemo extends StatelessWidget {
  const ThemeDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoThemingTitle)),
      body: Center(
        child: Text(t.demoThemingDescription),
      ),
    );
  }
}
