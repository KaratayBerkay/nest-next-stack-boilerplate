import 'package:flutter/material.dart';

class DynamicLoadingFallback extends StatelessWidget {
  const DynamicLoadingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Text(
      'loading...',
      style: TextStyle(
        fontFamily: 'monospace',
        color: colors.onSurface.withValues(alpha: 0.4),
        fontSize: 13,
      ),
    );
  }
}
