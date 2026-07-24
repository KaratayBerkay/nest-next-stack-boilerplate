import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class WsDemo extends StatelessWidget {
  const WsDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoWsTitle)),
      body: Center(
        child: Text(t.demoWsDescription),
      ),
    );
  }
}
