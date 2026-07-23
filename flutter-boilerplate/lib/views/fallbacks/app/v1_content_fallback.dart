import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';

class V1ContentFallback extends StatelessWidget {
  const V1ContentFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Shimmer.fromColors(
      baseColor: colors.surfaceHover,
      highlightColor: colors.surfaceAlt,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              height: 180,
              decoration: BoxDecoration(
                color: colors.surfaceHover,
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            const SizedBox(height: 20),
            Container(
              width: 200,
              height: 22,
              decoration: BoxDecoration(
                color: colors.surfaceHover,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              width: 160,
              height: 14,
              decoration: BoxDecoration(
                color: colors.surfaceHover,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 20),
            Container(
              width: double.infinity,
              height: 14,
              decoration: BoxDecoration(
                color: colors.surfaceHover,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              height: 14,
              decoration: BoxDecoration(
                color: colors.surfaceHover,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              width: double.infinity * 0.75,
              height: 14,
              decoration: BoxDecoration(
                color: colors.surfaceHover,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
