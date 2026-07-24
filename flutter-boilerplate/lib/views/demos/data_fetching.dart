import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class DataFetchingDemo extends StatelessWidget {
  const DataFetchingDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoDataFetchingTitle)),
      body: Center(
        child: Text(t.demoDataFetchingDescription),
      ),
    );
  }
}
