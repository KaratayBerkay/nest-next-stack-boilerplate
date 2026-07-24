import 'package:flutter/material.dart';

class PremiumLoadingFallback extends StatelessWidget {
  const PremiumLoadingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SkeletonLine(width: 160),
          const SizedBox(height: 24),
          Row(
            children: List.generate(
              4,
              (_) => const Expanded(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _SkeletonLine(width: 60),
                      SizedBox(height: 8),
                      _SkeletonLine(height: 32),
                    ],
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          const _SkeletonLine(width: 120),
          const SizedBox(height: 12),
          const _SkeletonLine(),
          const SizedBox(height: 8),
          const _SkeletonLine(width: 200),
        ],
      ),
    );
  }
}

class _SkeletonLine extends StatelessWidget {
  final double? width;
  final double height;
  const _SkeletonLine({this.width, this.height = 16});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      width: width ?? double.infinity,
      height: height,
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}
