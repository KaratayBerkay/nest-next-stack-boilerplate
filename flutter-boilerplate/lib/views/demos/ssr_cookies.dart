import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class SsrCookiesDemo extends StatelessWidget {
  const SsrCookiesDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoSsrCookiesTitle)),
      body: Center(
        child: Text(t.demoSsrCookiesDescription),
      ),
    );
  }
}
