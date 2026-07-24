import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class BoomPageContent extends StatelessWidget {
  final String lang;

  const BoomPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.boomTitle)),
      body: Center(
        child: FilledButton(
          onPressed: () {
            throw Exception('This is a test error from the Boom page!');
          },
          child: Text(t.boomTrigger),
        ),
      ),
    );
  }
}
