import 'package:flutter/material.dart';

class PulseBlockFallback extends StatelessWidget {
  final double width;
  final double height;

  const PulseBlockFallback({
    super.key,
    this.width = double.infinity,
    this.height = 48,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}
