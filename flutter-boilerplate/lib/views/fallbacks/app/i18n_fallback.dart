import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';

class I18nFallback extends StatelessWidget {
  const I18nFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Shimmer.fromColors(
        baseColor: colors.surfaceHover,
        highlightColor: colors.surfaceAlt,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 180,
              height: 24,
              decoration: BoxDecoration(
                color: colors.surfaceHover,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 24),
            Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: List.generate(
                    4,
                    (i) => Padding(
                      padding: EdgeInsets.only(
                        bottom: i < 3 ? 16.0 : 0,
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 20,
                            height: 20,
                            decoration: BoxDecoration(
                              color: colors.surfaceHover,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Container(
                              height: 16,
                              decoration: BoxDecoration(
                                color: colors.surfaceHover,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 140,
                      height: 16,
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
                    const SizedBox(height: 6),
                    Container(
                      width: 200,
                      height: 14,
                      decoration: BoxDecoration(
                        color: colors.surfaceHover,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      width: 120,
                      height: 40,
                      decoration: BoxDecoration(
                        color: colors.surfaceHover,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
