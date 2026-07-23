import 'package:flutter/material.dart';

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
    return Scaffold(
      appBar: AppBar(title: const Text('Error Boundary')),
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
