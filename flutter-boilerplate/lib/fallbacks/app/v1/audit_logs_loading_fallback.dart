import 'package:flutter/material.dart';

class AuditLogsLoadingFallback extends StatelessWidget {
  const AuditLogsLoadingFallback({super.key});

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
              _SkeletonLine(width: 120, height: 32),
              SizedBox(width: 8),
              _SkeletonLine(width: 100, height: 32),
              SizedBox(width: 8),
              _SkeletonLine(width: 140, height: 32),
            ],
          ),
          const SizedBox(height: 16),
          ...List.generate(
            8,
            (_) => const Padding(
              padding: EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  _SkeletonLine(width: 100),
                  SizedBox(width: 16),
                  _SkeletonLine(width: 80),
                  SizedBox(width: 16),
                  _SkeletonLine(width: 50),
                  SizedBox(width: 16),
                  _SkeletonLine(width: 80),
                  SizedBox(width: 16),
                  _SkeletonLine(width: 60),
                  SizedBox(width: 16),
                  _SkeletonLine(width: 120),
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
  const _SkeletonLine({this.width, this.height = 12});

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
