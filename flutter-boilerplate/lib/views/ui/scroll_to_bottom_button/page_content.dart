import 'package:flutter/material.dart';

class ScrollToBottomButtonDemoPage extends StatelessWidget {
  final String lang;
  const ScrollToBottomButtonDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scroll to Bottom')),
      body:
          const Center(child: Text('Use scroll controller to jump to bottom')),
    );
  }
}
