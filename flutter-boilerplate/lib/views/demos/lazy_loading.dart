import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class LazyLoadingDemo extends StatelessWidget {
  const LazyLoadingDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoLazyLoadingTitle)),
      body: Center(
        child: Text(t.demoLazyLoadingDescription),
      ),
    );
  }
}
