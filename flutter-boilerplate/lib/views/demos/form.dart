import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

class FormDemo extends StatelessWidget {
  const FormDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoFormsTitle)),
      body: Center(
        child: Text(t.demoFormsDescription),
      ),
    );
  }
}
