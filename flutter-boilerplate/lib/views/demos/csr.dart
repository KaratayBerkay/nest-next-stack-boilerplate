import 'package:flutter/material.dart';

class CsrDemo extends StatelessWidget {
  const CsrDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Client-Side Rendering')),
      body: const Center(
        child: Text('Client-side rendering with dynamic data fetching'),
      ),
    );
  }
}
