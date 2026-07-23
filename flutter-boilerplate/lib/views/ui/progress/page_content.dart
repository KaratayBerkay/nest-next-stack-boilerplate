import 'package:flutter/material.dart';
import '../../../components/ui/progress/progress.dart';

class ProgressDemoPage extends StatelessWidget {
  final String lang;
  const ProgressDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Progress')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text('Progress Bar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          SizedBox(height: 8),
          ProgressWidget(value: 0.3),
          SizedBox(height: 8),
          ProgressWidget(value: 0.6),
          SizedBox(height: 8),
          ProgressWidget(value: 1.0),
          SizedBox(height: 24),
          Text('Indeterminate', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          SizedBox(height: 8),
          ProgressWidget(color: Colors.grey),
        ],
      ),
    );
  }
}
