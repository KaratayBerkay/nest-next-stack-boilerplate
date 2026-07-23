import 'package:flutter/material.dart';

class MenubarDemoPage extends StatelessWidget {
  final String lang;
  const MenubarDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Menubar')),
      body: Column(
        children: [
          Container(
            color: Colors.grey[200],
            child: Row(
              children: [
                _MenuButton(label: 'File'),
                _MenuButton(label: 'Edit'),
                _MenuButton(label: 'View'),
                _MenuButton(label: 'Help'),
              ],
            ),
          ),
          const Expanded(child: Center(child: Text('Menubar demo'))),
        ],
      ),
    );
  }
}

class _MenuButton extends StatelessWidget {
  final String label;
  const _MenuButton({required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: TextButton(onPressed: () {}, child: Text(label)),
    );
  }
}
