import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class ServerActionsDemo extends StatelessWidget {
  const ServerActionsDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoServerActionsTitle)),
      body: Center(
        child: Text(t.demoServerActionsDescription),
      ),
    );
  }
}
