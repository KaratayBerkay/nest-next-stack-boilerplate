import 'package:flutter/material.dart';

class WsDemo extends StatelessWidget {
  const WsDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('WebSockets')),
      body: const Center(
        child: Text('Real-time bidirectional communication over WebSockets'),
      ),
    );
  }
}
