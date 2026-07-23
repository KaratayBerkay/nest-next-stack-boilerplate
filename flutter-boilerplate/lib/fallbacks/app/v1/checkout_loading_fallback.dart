import 'package:flutter/material.dart';

class CheckoutLoadingFallback extends StatelessWidget {
  const CheckoutLoadingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
           const _SkeletonLine(width: 140),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: colors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: colors.outlineVariant),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                 _SkeletonLine(width: 200),
                SizedBox(height: 16),
                 _SkeletonLine(height: 36),
                SizedBox(height: 12),
                 _SkeletonLine(height: 36),
                SizedBox(height: 12),
                 _SkeletonLine(height: 36),
                SizedBox(height: 16),
                 _SkeletonLine(width: 120, height: 36),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SkeletonLine extends StatelessWidget {
  final double? width;
  final double height;
  const  _SkeletonLine({this.width, this.height = 16});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      width: width ?? double.infinity,
      height: height,
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}
