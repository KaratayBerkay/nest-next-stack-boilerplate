import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class CsrCookiesDemo extends StatelessWidget {
  const CsrCookiesDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoCsrCookiesTitle)),
      body: Center(
        child: Text(t.demoCsrCookiesDescription),
      ),
    );
  }
}
