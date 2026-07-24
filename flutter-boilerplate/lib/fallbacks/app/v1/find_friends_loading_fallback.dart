import 'package:flutter/material.dart';

class FindFriendsLoadingFallback extends StatelessWidget {
  const FindFriendsLoadingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SkeletonLine(width: 120),
          const SizedBox(height: 16),
          const Row(
            children: [
              Expanded(child: _SkeletonLine(height: 32)),
              SizedBox(width: 8),
              Expanded(child: _SkeletonLine(height: 32)),
            ],
          ),
          const SizedBox(height: 12),
          const _SkeletonLine(height: 36),
          const SizedBox(height: 16),
          ...List.generate(
            5,
            (_) => const Padding(
              padding: EdgeInsets.only(bottom: 12),
              child: Column(
                children: [
                  _SkeletonLine(width: 200),
                  SizedBox(height: 4),
                  _SkeletonLine(width: 120, height: 10),
                ],
              ),
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
