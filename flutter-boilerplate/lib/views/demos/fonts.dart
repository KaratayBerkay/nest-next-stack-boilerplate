import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class FontsDemo extends StatelessWidget {
  const FontsDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoFontsTitle)),
      body: Center(
        child: Text(t.demoFontsDescription),
      ),
    );
  }
}
