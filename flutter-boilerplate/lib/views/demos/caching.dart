import 'package:flutter/material.dart';

class CachingDemo extends StatelessWidget {
  const CachingDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Caching')),
      body: const Center(
        child: Text('Data caching and revalidation strategies'),
      ),
    );
  }
}