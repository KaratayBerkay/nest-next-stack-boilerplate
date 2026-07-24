import 'package:flutter/material.dart';
import '../../../components/ui/checkbox/checkbox.dart';

class CheckboxDemoPage extends StatelessWidget {
  final String lang;
  const CheckboxDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Checkbox')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text(
            'Variants',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          CheckboxWidget(value: false, label: 'Default Checkbox'),
          CheckboxWidget(value: true, label: 'Checked'),
          CheckboxWidget(value: false, label: 'Disabled'),
          SizedBox(height: 24),
          Text(
            'Checkbox Group',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          CheckboxGroup(
            options: ['Option A', 'Option B', 'Option C'],
            selected: ['Option A'],
          ),
          SizedBox(height: 24),
          Text(
            'Checkbox Card',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          CheckboxCard(
            value: false,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Card Style Checkbox'),
                Text(
                  'With additional description text',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
