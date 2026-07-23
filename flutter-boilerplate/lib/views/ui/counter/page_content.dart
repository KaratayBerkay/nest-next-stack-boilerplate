import 'package:flutter/material.dart';
import '../../../components/ui/counter/counter.dart';

class CounterDemoPage extends StatelessWidget {
  final String lang;
  const CounterDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Basic Counter', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const CounterWidget(value: 0),
          const SizedBox(height: 24),
          const Text('With Custom Range', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const CounterWidget(value: 5, min: 0, max: 10),
        ],
      ),
    );
  }
}
