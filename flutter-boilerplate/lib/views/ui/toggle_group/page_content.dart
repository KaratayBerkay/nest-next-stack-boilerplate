import 'package:flutter/material.dart';

class ToggleGroupDemoPage extends StatefulWidget {
  final String lang;
  const ToggleGroupDemoPage({super.key, required this.lang});

  @override
  State<ToggleGroupDemoPage> createState() => _ToggleGroupDemoPageState();
}

class _ToggleGroupDemoPageState extends State<ToggleGroupDemoPage> {
  String _alignment = 'left';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Toggle Group')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Text Alignment',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          ToggleButtons(
            isSelected: [
              _alignment == 'left',
              _alignment == 'center',
              _alignment == 'right',
            ],
            onPressed: (i) {
              setState(() {
                _alignment = ['left', 'center', 'right'][i];
              });
            },
            children: const [
              Icon(Icons.format_align_left),
              Icon(Icons.format_align_center),
              Icon(Icons.format_align_right),
            ],
          ),
          Text('Selected: $_alignment'),
        ],
      ),
    );
  }
}
