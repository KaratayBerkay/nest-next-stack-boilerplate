import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class SsrDemo extends StatelessWidget {
  const SsrDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoSsrTitle)),
      body: Center(
        child: Text(t.demoSsrDescription),
      ),
    );
  }
}
