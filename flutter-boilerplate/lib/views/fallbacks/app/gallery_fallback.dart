import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';

class GalleryFallback extends StatelessWidget {
  const GalleryFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    const crossCount = 3;

    return Padding(
      padding: const EdgeInsets.all(4),
      child: Shimmer.fromColors(
        baseColor: colors.surfaceHover,
        highlightColor: colors.surfaceAlt,
        child: GridView.builder(
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossCount,
            mainAxisSpacing: 4,
            crossAxisSpacing: 4,
          ),
          itemCount: crossCount * 8,
          itemBuilder: (_, i) => Container(
            decoration: BoxDecoration(
              color: colors.surfaceHover,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ),
      ),
    );
  }
}
