import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class SeoDemo extends StatelessWidget {
  const SeoDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoSeoTitle)),
      body: const Center(
        child: Text(
          'Search engine optimization with metadata and structured data',
        ),
      ),
    );
  }
}
