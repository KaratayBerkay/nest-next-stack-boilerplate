import 'package:flutter/material.dart';

class V1PageFallback extends StatelessWidget {
  const V1PageFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Text(
      'Loading…',
      style: TextStyle(
        color: colors.onSurface.withValues(alpha: 0.5),
        fontSize: 13,
      ),
    );
  }
}
