import 'package:flutter/material.dart';
import '../../../components/ui/separator/separator.dart';

class SeparatorDemoPage extends StatelessWidget {
  final String lang;
  const SeparatorDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Separator')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text('Above separator'),
          Separator(),
          Text('Below separator'),
          SizedBox(height: 24),
          SizedBox(
            height: 100,
            child: Row(
              children: [
                Expanded(child: Text('Left')),
                VerticalSeparator(),
                Expanded(child: Text('Right')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
