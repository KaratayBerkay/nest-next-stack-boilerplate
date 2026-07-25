import 'package:flutter/material.dart';

class ResizableDemoPage extends StatelessWidget {
  final String lang;
  const ResizableDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 150,
          color: Colors.grey[200],
          child: const Center(child: Text('Sidebar')),
        ),
        const VerticalDivider(width: 1),
        const Expanded(
          child: Center(child: Text('Main Content')),
        ),
      ],
    );
  }
}
