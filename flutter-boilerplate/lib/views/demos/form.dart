import 'package:flutter/material.dart';

class FormDemo extends StatelessWidget {
  const FormDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Forms')),
      body: const Center(
        child: Text('Form handling with validation and submission'),
      ),
    );
  }
}