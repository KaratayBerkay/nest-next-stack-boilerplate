import 'package:flutter/material.dart';

class PprFallback extends StatelessWidget {
  const PprFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Text(
      'Loading personalization...',
      style: TextStyle(
        color: colors.onSurface.withValues(alpha: 0.5),
        fontSize: 13,
      ),
    );
  }
}
