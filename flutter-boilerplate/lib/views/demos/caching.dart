import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class CachingDemo extends StatelessWidget {
  const CachingDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoCachingTitle)),
      body: Center(
        child: Text(t.demoCachingDescription),
      ),
    );
  }
}
