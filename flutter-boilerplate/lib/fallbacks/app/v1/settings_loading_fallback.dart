import 'package:flutter/material.dart';

class SettingsLoadingFallback extends StatelessWidget {
  const SettingsLoadingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
           _SkeletonLine(width: 100),
          SizedBox(height: 24),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
               _SkeletonLine(width: 60, height: 12),
              SizedBox(height: 6),
               _SkeletonLine(height: 36),
              SizedBox(height: 16),
               _SkeletonLine(width: 80, height: 12),
              SizedBox(height: 6),
               _SkeletonLine(height: 36),
              SizedBox(height: 16),
               _SkeletonLine(width: 48, height: 12),
              SizedBox(height: 6),
               _SkeletonLine(height: 80),
              SizedBox(height: 16),
               _SkeletonLine(width: 100, height: 36),
            ],
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
