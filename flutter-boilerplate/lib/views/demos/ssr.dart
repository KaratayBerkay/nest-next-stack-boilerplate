import 'package:flutter/material.dart';

class SsrDemo extends StatelessWidget {
  const SsrDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Server-Side Rendering')),
      body: const Center(
        child: Text('Server-side rendering with dynamic data on each request'),
      ),
    );
  }
}