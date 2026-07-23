import 'package:flutter/material.dart';

class ThemeDemo extends StatelessWidget {
  const ThemeDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Theming')),
      body: const Center(
        child: Text('Application theming with light and dark mode support'),
      ),
    );
  }
}