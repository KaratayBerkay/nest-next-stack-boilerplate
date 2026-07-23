import 'package:flutter/material.dart';
import '../../../components/ui/label/label.dart';

class LabelDemoPage extends StatelessWidget {
  final String lang;
  const LabelDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Label')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Label(text: 'Standard Label'),
          SizedBox(height: 8),
          Text('Required:'),
          SizedBox(height: 4),
          Label(text: 'Required', required: true),
        ],
      ),
    );
  }
}
