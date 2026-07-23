import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/popover/popover.dart';

class PopoverDemoPage extends StatelessWidget {
  final String lang;
  const PopoverDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Popover')),
      body: Center(
        child: PopoverWidget(
          child: Button(child: const Text('Open Popover'), onPressed: () {}),
          popoverBuilder: (_) => const Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Popover Content'),
                SizedBox(height: 8),
                Text('Additional details here.'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
