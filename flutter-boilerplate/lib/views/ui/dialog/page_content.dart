import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/dialog/dialog_content.dart';
import '../../../components/ui/dialog/dialog_title.dart';
import '../../../l10n/app_localizations.dart';

class DialogDemoPage extends StatelessWidget {
  final String lang;
  const DialogDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiDialogTitle)),
      body: Center(
        child: Button(
          child: const Text('Open Dialog'),
          onPressed: () => showDialog<bool>(
            context: context,
            builder: (_) => AlertDialog(
              title: const DialogTitleWidget(text: 'Dialog Title'),
              content: const DialogContent(
                child: Text('This is the dialog content.'),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cancel'),
                ),
                Button(
                  child: const Text('Confirm'),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
