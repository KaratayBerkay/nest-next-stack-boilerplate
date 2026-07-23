import 'package:flutter/material.dart';
import '../../../components/ui/kbd/kbd.dart';

class KbdDemoPage extends StatelessWidget {
  final String lang;
  const KbdDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('KBD')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Keyboard Shortcuts', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 12,
            children: const [
              Row(mainAxisSize: MainAxisSize.min, children: [KbdWidget(label: 'Ctrl'), Text(' + '), KbdWidget(label: 'C')]),
              SizedBox(width: 24),
              Row(mainAxisSize: MainAxisSize.min, children: [KbdWidget(label: '⌘'), Text(' + '), KbdWidget(label: 'Shift'), Text(' + '), KbdWidget(label: 'P')]),
              SizedBox(width: 24),
              Row(mainAxisSize: MainAxisSize.min, children: [KbdWidget(label: 'Alt'), Text(' + '), KbdWidget(label: 'F4')]),
            ],
          ),
        ],
      ),
    );
  }
}
