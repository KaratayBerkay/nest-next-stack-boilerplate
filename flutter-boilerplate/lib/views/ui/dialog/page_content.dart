import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/dialog/dialog_content.dart';
import '../../../components/ui/dialog/dialog_title.dart';

class DialogDemoPage extends StatelessWidget {
  final String lang;
  const DialogDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Button(
        child: const Text('Open Dialog'),
        onPressed: () => showDialog<bool>(
          context: context,
          // Pop via the builder's own context, not the outer `context` —
          // see confirm_dialog.dart's ConfirmDialogWidget.show for why this
          // demo would otherwise teach the exact pattern that hangs a
          // dialog forever under a nested Navigator.
          builder: (dialogContext) => AlertDialog(
            title: const DialogTitleWidget(text: 'Dialog Title'),
            content: const DialogContent(
              child: Text('This is the dialog content.'),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(dialogContext).pop(),
                child: const Text('Cancel'),
              ),
              Button(
                child: const Text('Confirm'),
                onPressed: () => Navigator.of(dialogContext).pop(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
