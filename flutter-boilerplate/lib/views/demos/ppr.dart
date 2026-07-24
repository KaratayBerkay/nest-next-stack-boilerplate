import 'package:flutter/material.dart';

class PprDemo extends StatelessWidget {
  const PprDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Partial Prerendering')),
      body: const Center(
        child:
            Text('Partial prerendering for hybrid static and dynamic content'),
      ),
    );
  }
}
