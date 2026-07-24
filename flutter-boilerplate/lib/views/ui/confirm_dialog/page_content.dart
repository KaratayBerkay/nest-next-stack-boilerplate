import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/confirm_dialog/confirm_dialog.dart';
import '../../../l10n/app_localizations.dart';

class ConfirmDialogDemoPage extends StatelessWidget {
  final String lang;
  const ConfirmDialogDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiConfirmDialogTitle)),
      body: Center(
        child: Button(
          child: const Text('Show Confirm'),
          onPressed: () => showDialog<bool>(
            context: context,
            builder: (_) => const ConfirmDialogWidget(
              title: 'Delete Item',
              message: 'Are you sure? This cannot be undone.',
            ),
          ),
        ),
      ),
    );
  }
}
