import 'package:flutter/material.dart' hide Badge;
import '../../../components/ui/badge/badge.dart';

class BadgeDemoPage extends StatelessWidget {
  final String lang;
  const BadgeDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Badge')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Variants', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: const [
              Badge(text: 'Default'),
              Badge(text: 'Secondary', variant: BadgeVariant.secondary),
              Badge(text: 'Success', variant: BadgeVariant.success),
              Badge(text: 'Warning', variant: BadgeVariant.warning),
              Badge(text: 'Danger', variant: BadgeVariant.danger),
              Badge(text: 'Info', variant: BadgeVariant.info),
            ],
          ),
          const SizedBox(height: 24),
          const Text('With Icons', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: const [
              Badge(text: 'Verified', icon: Icons.check_circle, variant: BadgeVariant.success),
              Badge(text: 'Pending', icon: Icons.schedule, variant: BadgeVariant.warning),
              Badge(text: 'New', icon: Icons.fiber_new, variant: BadgeVariant.danger),
            ],
          ),
        ],
      ),
    );
  }
}
