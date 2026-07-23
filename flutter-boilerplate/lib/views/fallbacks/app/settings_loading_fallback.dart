import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';

class SettingsLoadingFallback extends StatelessWidget {
  const SettingsLoadingFallback({super.key});

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
              width: 160,
              height: 28,
              decoration: BoxDecoration(
                color: colors.surfaceHover,
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView(
                physics: const NeverScrollableScrollPhysics(),
                children: List.generate(
                  6,
                  (i) => Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 18,
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: colors.surfaceHover,
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Container(
                              height: 16,
                              decoration: BoxDecoration(
                                color: colors.surfaceHover,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            width: 20,
                            height: 20,
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
            const SizedBox(height: 24),
            Container(
              width: 120,
              height: 20,
              decoration: BoxDecoration(
                color: colors.surfaceHover,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 240,
                      height: 14,
                      decoration: BoxDecoration(
                        color: colors.surfaceHover,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: 180,
                      height: 14,
                      decoration: BoxDecoration(
                        color: colors.surfaceHover,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      width: 300,
                      height: 44,
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
