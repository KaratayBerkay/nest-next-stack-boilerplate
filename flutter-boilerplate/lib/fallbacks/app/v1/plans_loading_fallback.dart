import 'package:flutter/material.dart';

class PlansLoadingFallback extends StatelessWidget {
  const PlansLoadingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
           const _SkeletonLine(width: 120),
          const SizedBox(height: 24),
          Row(
            children: List.generate(3, (_) => Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: colors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: colors.outlineVariant),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                       _SkeletonLine(width: 80),
                      SizedBox(height: 8),
                       _SkeletonLine(height: 32),
                      SizedBox(height: 12),
                       _SkeletonLine(),
                      SizedBox(height: 8),
                       _SkeletonLine(),
                      SizedBox(height: 8),
                       _SkeletonLine(width: 120),
                      SizedBox(height: 16),
                       _SkeletonLine(width: 100, height: 36),
                    ],
                  ),
                ),
              ),
            ),),
          ),
        ],
      ),
    );
  }
}

class _SkeletonLine extends StatelessWidget {
  final double? width;
  final double height;
  const  _SkeletonLine({this.width, this.height = 12});

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
