import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';

class Skeleton extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const Skeleton({
    super.key,
    this.width = double.infinity,
    this.height = 16,
    this.borderRadius = 4,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Shimmer.fromColors(
      baseColor: colors.surfaceHover,
      highlightColor: colors.surfaceAlt,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: colors.surfaceHover,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

class SkeletonCircle extends StatelessWidget {
  final double radius;

  const SkeletonCircle({super.key, this.radius = 20});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Shimmer.fromColors(
      baseColor: colors.surfaceHover,
      highlightColor: colors.surfaceAlt,
      child: CircleAvatar(
        radius: radius,
        backgroundColor: colors.surfaceHover,
      ),
    );
  }
}

class SkeletonCard extends StatelessWidget {
  final int lines;

  const SkeletonCard({super.key, this.lines = 3});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Skeleton(width: 120, height: 20),
            const SizedBox(height: 12),
            ...List.generate(lines, (i) {
              return Padding(
                padding: EdgeInsets.only(bottom: i < lines - 1 ? 8 : 0),
                child: Skeleton(
                  width: i == lines - 1 ? 0.6 : 1,
                  height: 14,
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
