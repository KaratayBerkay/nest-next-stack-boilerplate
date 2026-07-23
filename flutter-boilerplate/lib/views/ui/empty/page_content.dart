import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/empty/empty.dart';

class EmptyDemoPage extends StatelessWidget {
  final String lang;
  const EmptyDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Empty')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const EmptyWidget(title: 'No items'),
          const SizedBox(height: 24),
          const EmptyWidget(
            title: 'No results',
            description: 'Try adjusting your search or filters.',
            icon: Icons.search_off,
          ),
          const SizedBox(height: 24),
          EmptyWidget(
            title: 'No messages',
            description: 'Start a conversation with someone.',
            icon: Icons.chat_bubble_outline,
            action: Button(child: const Text('New Message'), onPressed: () {}),
          ),
        ],
      ),
    );
  }
}
