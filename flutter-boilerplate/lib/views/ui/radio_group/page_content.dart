import 'package:flutter/material.dart';

class RadioGroupDemoPage extends StatefulWidget {
  final String lang;
  const RadioGroupDemoPage({super.key, required this.lang});

  @override
  State<RadioGroupDemoPage> createState() => _RadioGroupDemoPageState();
}

class _RadioGroupDemoPageState extends State<RadioGroupDemoPage> {
  String _selected = 'option1';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Radio Group')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Select an option', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  RadioListTile(value: 'option1', groupValue: _selected, title: const Text('Option 1'), onChanged: (v) => setState(() => _selected = v!)),
                  RadioListTile(value: 'option2', groupValue: _selected, title: const Text('Option 2'), onChanged: (v) => setState(() => _selected = v!)),
                  RadioListTile(value: 'option3', groupValue: _selected, title: const Text('Option 3'), onChanged: (v) => setState(() => _selected = v!)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
