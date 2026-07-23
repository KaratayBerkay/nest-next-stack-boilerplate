import 'package:flutter/material.dart';
import '../../../components/ui/popover/popover.dart';
import '../../../components/ui/button/button.dart';

class HoverCardDemoPage extends StatelessWidget {
  final String lang;
  const HoverCardDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hover Card')),
      body: Center(
        child: PopoverWidget(
          child: Button(child: const Text('Hover me'), onPressed: () {}),
          popoverBuilder: (_) => const Padding(
            padding: EdgeInsets.all(12),
            child: Text('Hover card content with additional info.'),
          ),
        ),
      ),
    );
  }
}
