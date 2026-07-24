import 'package:flutter/material.dart';

class ClientDataDemo extends StatelessWidget {
  const ClientDataDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Client Data')),
      body: const Center(
        child: Text('Client-side data fetching, state management, and caching'),
      ),
    );
  }
}
