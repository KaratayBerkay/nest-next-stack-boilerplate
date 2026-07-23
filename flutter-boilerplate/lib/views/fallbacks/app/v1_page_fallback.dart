import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';
import '../../../constants/ui.dart';

class V1PageFallback extends StatelessWidget {
  const V1PageFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Shimmer.fromColors(
      baseColor: colors.surfaceHover,
      highlightColor: colors.surfaceAlt,
      child: Column(
        children: [
          Container(
            height: UIConstants.headerHeight,
            decoration: BoxDecoration(
              color: colors.surfaceHover,
              border: Border(bottom: BorderSide(color: colors.border)),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Container(
                  width: 100,
                  height: 20,
                  decoration: BoxDecoration(
                    color: colors.surfaceHover,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const Spacer(),
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: colors.surfaceHover,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 240,
                    height: 28,
                    decoration: BoxDecoration(
                      color: colors.surfaceHover,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    height: 160,
                    decoration: BoxDecoration(
                      color: colors.surfaceHover,
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const SizedBox(width: double.infinity, height: 14),
                  const SizedBox(height: 8),
                  const SizedBox(width: double.infinity * 0.8, height: 14),
                  const SizedBox(height: 24),
                  const SizedBox(width: double.infinity, height: 96),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
