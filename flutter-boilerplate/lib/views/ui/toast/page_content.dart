import 'package:flutter/material.dart';
import '../../../components/ui/button/button.dart';
import '../../../l10n/app_localizations.dart';

class ToastDemoPage extends StatelessWidget {
  final String lang;
  const ToastDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiToastTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Button(
            child: const Text('Show Success Toast'),
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Operation successful!'),
                backgroundColor: Colors.green,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Button(
            child: const Text('Show Error Toast'),
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Something went wrong!'),
                backgroundColor: Colors.red,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
