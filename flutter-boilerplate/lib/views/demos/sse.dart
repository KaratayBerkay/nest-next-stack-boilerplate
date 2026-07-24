import 'package:flutter/material.dart';

class SseDemo extends StatelessWidget {
  const SseDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Server-Sent Events')),
      body: const Center(
        child: Text('Real-time updates via server-sent event streams'),
      ),
    );
  }
}
