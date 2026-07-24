import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class PprDemo extends StatelessWidget {
  const PprDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoPprTitle)),
      body: Center(
        child: Text(t.demoPprDescription),
      ),
    );
  }
}
