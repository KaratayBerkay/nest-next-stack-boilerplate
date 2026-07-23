import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';

class LazyLoadingFallback extends StatelessWidget {
  const LazyLoadingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final random = math.Random(42);

    return Shimmer.fromColors(
      baseColor: colors.surfaceHover,
      highlightColor: colors.surfaceAlt,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 80),
          Icon(Icons.hourglass_empty, size: 48, color: colors.fgMuted),
          const SizedBox(height: 24),
          Container(
            width: 100,
            height: 16,
            decoration: BoxDecoration(
              color: colors.surfaceHover,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            width: 220,
            height: 12,
            decoration: BoxDecoration(
              color: colors.surfaceHover,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 40),
          ...List.generate(
            4,
            (i) => Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 6,
              ),
              child: FractionallySizedBox(
                widthFactor: 0.3 + random.nextDouble() * 0.5,
                child: Container(
                  height: 14,
                  decoration: BoxDecoration(
                    color: colors.surfaceHover,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
