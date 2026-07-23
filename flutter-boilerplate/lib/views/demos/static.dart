import 'package:flutter/material.dart';

class StaticDemo extends StatelessWidget {
  const StaticDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Static Generation')),
      body: const Center(
        child: Text('Static site generation at build time for optimal performance'),
      ),
    );
  }
}