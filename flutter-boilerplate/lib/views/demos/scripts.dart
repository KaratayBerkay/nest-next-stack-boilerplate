import 'package:flutter/material.dart';

class ScriptsDemo extends StatelessWidget {
  const ScriptsDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scripts')),
      body: const Center(
        child: Text('Third-party script loading with strategy and scheduling'),
      ),
    );
  }
}