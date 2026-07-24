import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class ObservabilityDemo extends StatelessWidget {
  const ObservabilityDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoObservabilityTitle)),
      body: Center(
        child: Text(t.demoObservabilityDescription),
      ),
    );
  }
}
