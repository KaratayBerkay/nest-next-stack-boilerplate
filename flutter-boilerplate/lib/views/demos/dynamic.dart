import 'package:flutter/material.dart';

class DynamicDemo extends StatelessWidget {
  const DynamicDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dynamic Routes')),
      body: const Center(
        child: Text('Dynamic route segments and parameters'),
      ),
    );
  }
}