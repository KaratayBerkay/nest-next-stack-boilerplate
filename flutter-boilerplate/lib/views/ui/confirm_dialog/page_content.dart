import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/confirm_dialog/confirm_dialog.dart';

class ConfirmDialogDemoPage extends StatelessWidget {
  final String lang;
  const ConfirmDialogDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Button(
        child: const Text('Show Confirm'),
        // ConfirmDialogWidget.build() is intentionally a no-op (SizedBox.shrink)
        // — the real dialog content lives in its static show(), not in the
        // widget itself. Wrapping it in a second showDialog (as this demo
        // used to) rendered a blank dialog instead of the confirm sheet.
        onPressed: () => ConfirmDialogWidget.show(
          context,
          title: 'Delete Item',
          message: 'Are you sure? This cannot be undone.',
        ),
      ),
    );
  }
}
