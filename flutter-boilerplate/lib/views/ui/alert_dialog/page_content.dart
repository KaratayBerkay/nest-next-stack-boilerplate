import 'package:flutter/material.dart';
import '../../../components/ui/alert_dialog/alert_dialog.dart';
import '../../../components/ui/button/button.dart';
import '../../../l10n/app_localizations.dart';

class AlertDialogDemoPage extends StatelessWidget {
  final String lang;
  const AlertDialogDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiAlertDialogTitle)),
      body: Center(
        child: Button(
          child: const Text('Show Alert Dialog'),
          onPressed: () => AlertDialogWidget.show(
            context,
            title: 'Confirm Action',
            description: 'Are you sure you want to proceed?',
          ),
        ),
      ),
    );
  }
}
