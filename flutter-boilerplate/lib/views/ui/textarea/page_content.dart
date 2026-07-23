import 'package:flutter/material.dart';
import '../../../components/ui/textarea/textarea.dart';

class TextareaDemoPage extends StatelessWidget {
  final String lang;
  const TextareaDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Textarea')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Basic Textarea', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Textarea(label: 'Message', hintText: 'Enter your message...'),
          const SizedBox(height: 24),
          const Text('With Error', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Textarea(label: 'Comment', errorText: 'This field is required'),
        ],
      ),
    );
  }
}
