import 'package:flutter/material.dart';

class LazyLoadingDemo extends StatelessWidget {
  const LazyLoadingDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lazy Loading')),
      body: const Center(
        child: Text('Lazy loading components and data for performance'),
      ),
    );
  }
}
