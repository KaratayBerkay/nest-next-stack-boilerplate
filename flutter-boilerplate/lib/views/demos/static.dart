import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class StaticDemo extends StatelessWidget {
  const StaticDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoStaticGenerationTitle)),
      body: const Center(
        child: Text(
          'Static site generation at build time for optimal performance',
        ),
      ),
    );
  }
}
