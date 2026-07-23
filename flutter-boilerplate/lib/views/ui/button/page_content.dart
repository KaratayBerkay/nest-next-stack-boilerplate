import 'package:flutter/material.dart';
import '../../../components/ui/button/button.dart';

class ButtonDemoPage extends StatelessWidget {
  final String lang;
  const ButtonDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Button')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Variants', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: [
              Button(child: const Text('Primary'), onPressed: () {}),
              Button(variant: ButtonVariant.secondary, child: const Text('Secondary'), onPressed: () {}),
              Button(variant: ButtonVariant.outline, child: const Text('Outline'), onPressed: () {}),
              Button(variant: ButtonVariant.ghost, child: const Text('Ghost'), onPressed: () {}),
              Button(variant: ButtonVariant.danger, child: const Text('Danger'), onPressed: () {}),
            ],
          ),
          const SizedBox(height: 24),
          const Text('Sizes', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: [
              Button(size: ButtonSize.sm, child: const Text('Small'), onPressed: () {}),
              Button(child: const Text('Medium'), onPressed: () {}),
              Button(size: ButtonSize.lg, child: const Text('Large'), onPressed: () {}),
            ],
          ),
          const SizedBox(height: 24),
          const Text('States', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: [
              const Button(child: Text('Disabled')),
              Button(onPressed: () {}, loading: true, child: const Text('Loading')),
              Button(onPressed: () {}, fullWidth: true, child: const Text('Full Width')),
            ],
          ),
        ],
      ),
    );
  }
}
