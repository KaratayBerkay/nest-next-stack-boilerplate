import 'package:flutter/material.dart';
import '../../../components/ui/skeleton/skeleton.dart';

class SkeletonDemoPage extends StatelessWidget {
  final String lang;
  const SkeletonDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Skeleton')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Card Skeleton', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const SkeletonCard(),
          const SizedBox(height: 24),
          const Text('Text Skeleton', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Skeleton(),
          const SizedBox(height: 24),
          const Text('Avatar Skeleton', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const SkeletonCircle(),
        ],
      ),
    );
  }
}
