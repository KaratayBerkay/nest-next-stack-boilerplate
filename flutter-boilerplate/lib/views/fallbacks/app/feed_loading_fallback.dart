import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';
import '../../../constants/ui.dart';

class FeedLoadingFallback extends StatelessWidget {
  const FeedLoadingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Shimmer.fromColors(
      baseColor: colors.surfaceHover,
      highlightColor: colors.surfaceAlt,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 160,
              height: 22,
              decoration: BoxDecoration(
                color: colors.surfaceHover,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 20),
            ...List.generate(
              4,
              (i) => Padding(
                padding: EdgeInsets.only(bottom: 16),
                child: Card(
                  margin: EdgeInsets.zero,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: colors.surfaceHover,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(width: 100, height: 14),
                                const SizedBox(height: 4),
                                Container(width: 60, height: 11),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Container(
                          width: double.infinity,
                          height: 14,
                        ),
                        const SizedBox(height: 6),
                        Container(
                          width: double.infinity * 0.9,
                          height: 14,
                        ),
                        const SizedBox(height: 12),
                        Container(
                          width: double.infinity,
                          height: 180,
                          decoration: BoxDecoration(
                            color: colors.surfaceHover,
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: colors.surfaceHover,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(width: 60, height: 12),
                            const Spacer(),
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: colors.surfaceHover,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(width: 60, height: 12),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
