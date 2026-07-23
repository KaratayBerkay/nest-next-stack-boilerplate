import 'package:flutter/material.dart';

class ServerActionsDemo extends StatelessWidget {
  const ServerActionsDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Server Actions')),
      body: const Center(
        child: Text('Server-side form actions and data mutations'),
      ),
    );
  }
}