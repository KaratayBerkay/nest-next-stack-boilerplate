import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class DynamicDemo extends StatelessWidget {
  const DynamicDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoDynamicRoutesTitle)),
      body: Center(
        child: Text(t.demoDynamicRoutesDescription),
      ),
    );
  }
}
