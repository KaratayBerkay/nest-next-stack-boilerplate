import 'package:flutter/material.dart';

class FontsDemo extends StatelessWidget {
  const FontsDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Fonts')),
      body: const Center(
        child: Text('Custom font loading, subsetting, and optimization'),
      ),
    );
  }
}
