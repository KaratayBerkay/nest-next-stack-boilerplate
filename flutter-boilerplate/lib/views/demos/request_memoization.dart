import 'package:flutter/material.dart';

class RequestMemoizationDemo extends StatelessWidget {
  const RequestMemoizationDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Request Memoization')),
      body: const Center(
        child: Text(
          'Automatic request deduplication and caching across components',
        ),
      ),
    );
  }
}
