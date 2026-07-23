import 'package:flutter/material.dart';
import '../../../components/ui/scroll_area/scroll_area.dart';

class ScrollAreaDemoPage extends StatelessWidget {
  final String lang;
  const ScrollAreaDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scroll Area')),
      body: ScrollAreaWidget(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: List.generate(50, (i) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Text('Item $i'),
            )),
          ),
        ),
      ),
    );
  }
}
