import 'package:flutter/material.dart';
import '../../../components/ui/spinner/spinner.dart';

class SpinnerDemoPage extends StatelessWidget {
  final String lang;
  const SpinnerDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Spinner')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text('Sizes', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          SizedBox(height: 8),
          Wrap(
            spacing: 24,
            runSpacing: 16,
            children: [
              Spinner(size: 16),
              Spinner(),
              Spinner(size: 32),
              Spinner(size: 48),
            ],
          ),
        ],
      ),
    );
  }
}
