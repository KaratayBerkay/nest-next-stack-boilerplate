import 'package:flutter/material.dart';
import '../../../components/ui/spinner/spinner.dart';

class LogoSpinnerDemoPage extends StatelessWidget {
  final String lang;
  const LogoSpinnerDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Logo Spinner')),
      body: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Spinner(size: 48),
            SizedBox(height: 16),
            Text('Loading...'),
          ],
        ),
      ),
    );
  }
}
