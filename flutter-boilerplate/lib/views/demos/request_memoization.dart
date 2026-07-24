import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class RequestMemoizationDemo extends StatelessWidget {
  const RequestMemoizationDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoRequestMemoizationTitle)),
      body: const Center(
        child: Text(
          'Automatic request deduplication and caching across components',
        ),
      ),
    );
  }
}
