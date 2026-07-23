import 'package:flutter/material.dart';
import '../../../components/ui/avatar/avatar.dart';

class AvatarDemoPage extends StatelessWidget {
  final String lang;
  const AvatarDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Avatar')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Sizes', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: const [
              Avatar(name: 'Alice', radius: 12),
              Avatar(name: 'Bob', radius: 16),
              Avatar(name: 'Charlie', radius: 20),
              Avatar(name: 'Diana', radius: 24),
              Avatar(name: 'Eve', radius: 32),
            ],
          ),
          const SizedBox(height: 24),
          const Text('With Image', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Avatar(name: 'User', radius: 24),
          const SizedBox(height: 24),
          const Text('Initials Fallback', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            children: const [
              Avatar(name: 'John Doe', radius: 20),
              Avatar(name: 'Jane Smith', radius: 20),
              Avatar(name: 'AI', radius: 20),
            ],
          ),
        ],
      ),
    );
  }
}
