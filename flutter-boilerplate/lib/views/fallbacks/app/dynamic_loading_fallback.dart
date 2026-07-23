import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';

class DynamicLoadingFallback extends StatelessWidget {
  final int itemCount;

  const DynamicLoadingFallback({super.key, this.itemCount = 3});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Shimmer.fromColors(
      baseColor: colors.surfaceHover,
      highlightColor: colors.surfaceAlt,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(
          itemCount,
          (i) => Padding(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: i == 0 ? 16 : 0,
              bottom: 16,
            ),
            child: Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 80,
                      height: 20,
                      decoration: BoxDecoration(
                        color: colors.surfaceHover,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 16),
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
                      width: double.infinity * 0.7,
                      height: 14,
                      decoration: BoxDecoration(
                        color: colors.surfaceHover,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      width: 120,
                      height: 12,
                      decoration: BoxDecoration(
                        color: colors.surfaceHover,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
