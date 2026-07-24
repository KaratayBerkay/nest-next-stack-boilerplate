import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class SseDemo extends StatelessWidget {
  const SseDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoSseTitle)),
      body: Center(
        child: Text(t.demoSseDescription),
      ),
    );
  }
}
