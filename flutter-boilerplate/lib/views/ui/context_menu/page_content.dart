import 'package:flutter/material.dart';

class ContextMenuDemoPage extends StatelessWidget {
  final String lang;
  const ContextMenuDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Context Menu')),
      body: Center(
        child: GestureDetector(
          onLongPress: () => showMenu(
            context: context,
            position: RelativeRect.fromLTRB(100, 300, 100, 300),
            items: [
              const PopupMenuItem(value: 'edit', child: Text('Edit')),
              const PopupMenuItem(value: 'copy', child: Text('Copy')),
              const PopupMenuItem(value: 'delete', child: Text('Delete')),
            ],
          ),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text('Long press for context menu'),
          ),
        ),
      ),
    );
  }
}
