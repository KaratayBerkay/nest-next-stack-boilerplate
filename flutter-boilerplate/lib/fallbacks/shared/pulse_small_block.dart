import 'package:flutter/material.dart';

class PulseSmallBlockFallback extends StatelessWidget {
  final double size;

  const PulseSmallBlockFallback({super.key, this.size = 24});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}
