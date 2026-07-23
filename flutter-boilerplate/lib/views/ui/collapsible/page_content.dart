import 'package:flutter/material.dart';
import '../../../components/ui/collapsible/collapsible.dart';

class CollapsibleDemoPage extends StatelessWidget {
  final String lang;
  const CollapsibleDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Collapsible')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const CollapsibleWidget(
            title: Text('Show Details'),
            child: Text('Hidden content revealed when expanded.'),
          ),
          const SizedBox(height: 8),
          const CollapsibleWidget(
            title: Text('Configuration'),
            initiallyExpanded: true,
            child: Column(
              children: [
                Text('Setting 1: Enabled'),
                Text('Setting 2: Disabled'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
