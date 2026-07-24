import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

class ErrorBoundaryDemoPage extends StatefulWidget {
  final String lang;
  const ErrorBoundaryDemoPage({super.key, required this.lang});

  @override
  State<ErrorBoundaryDemoPage> createState() => _ErrorBoundaryDemoPageState();
}

class _ErrorBoundaryDemoPageState extends State<ErrorBoundaryDemoPage> {
  bool _shouldThrow = false;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiErrorBoundaryTitle)),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_shouldThrow) throw Exception('Simulated error'),
            const Text('Tap the button to trigger an error'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => setState(() => _shouldThrow = true),
              child: const Text('Trigger Error'),
            ),
          ],
        ),
      ),
    );
  }
}
