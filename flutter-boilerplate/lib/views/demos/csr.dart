import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class CsrDemo extends StatelessWidget {
  const CsrDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoCsrTitle)),
      body: Center(
        child: Text(t.demoCsrDescription),
      ),
    );
  }
}
