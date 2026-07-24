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
        children: const [
          Text(
            'Basic Counter',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          CounterWidget(value: 0),
          SizedBox(height: 24),
          Text(
            'With Custom Range',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          CounterWidget(value: 5, max: 10),
        ],
      ),
    );
  }
}
