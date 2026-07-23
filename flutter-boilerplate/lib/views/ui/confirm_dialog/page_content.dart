import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/confirm_dialog/confirm_dialog.dart';

class ConfirmDialogDemoPage extends StatelessWidget {
  final String lang;
  const ConfirmDialogDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Confirm Dialog')),
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
