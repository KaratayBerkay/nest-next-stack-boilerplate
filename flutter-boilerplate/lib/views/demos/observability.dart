import 'package:flutter/material.dart';

class ObservabilityDemo extends StatelessWidget {
  const ObservabilityDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Observability')),
      body: const Center(
        child: Text('Logging, monitoring, tracing, and error tracking'),
      ),
    );
  }
}