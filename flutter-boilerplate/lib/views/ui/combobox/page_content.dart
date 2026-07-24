import 'package:flutter/material.dart';
import '../../../components/ui/combobox/combobox.dart';

class ComboboxDemoPage extends StatelessWidget {
  final String lang;
  const ComboboxDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Combobox')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text(
            'Basic Combobox',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          ComboboxWidget(
            items: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
            label: 'Select a fruit',
          ),
          SizedBox(height: 24),
          Text(
            'With Custom Input',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          ComboboxWidget(
            items: ['React', 'Vue', 'Angular', 'Svelte', 'Flutter'],
            label: 'Framework',
          ),
        ],
      ),
    );
  }
}
