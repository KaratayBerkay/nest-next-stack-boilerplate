import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';

class RoutingFallback extends StatelessWidget {
  const RoutingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Shimmer.fromColors(
      baseColor: colors.surfaceHover,
      highlightColor: colors.surfaceAlt,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(
          8,
          (i) => Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: colors.surfaceHover,
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 120 + (i % 3) * 40,
                        height: 15,
                        decoration: BoxDecoration(
                          color: colors.surfaceHover,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        width: 80,
                        height: 12,
                        decoration: BoxDecoration(
                          color: colors.surfaceHover,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 18,
                  height: 18,
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
    );
  }
}
