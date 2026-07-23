import 'package:flutter/material.dart';

class ImagesDemo extends StatelessWidget {
  const ImagesDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Images')),
      body: const Center(
        child: Text('Image optimization, lazy loading, and responsive images'),
      ),
    );
  }
}