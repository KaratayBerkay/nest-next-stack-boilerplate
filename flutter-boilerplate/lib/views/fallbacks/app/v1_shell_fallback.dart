import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';
import '../../../constants/ui.dart';

class V1ShellFallback extends StatelessWidget {
  const V1ShellFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Shimmer.fromColors(
      baseColor: colors.surfaceHover,
      highlightColor: colors.surfaceAlt,
      child: Row(
        children: [
          Container(
            width: UIConstants.sidebarCollapsedWidth,
            decoration: BoxDecoration(
              color: colors.surfaceHover,
              border: Border(right: BorderSide(color: colors.border)),
            ),
            child: Column(
              children: List.generate(
                6,
                (i) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: colors.surfaceHover,
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const VerticalDivider(width: 1),
          Container(
            width: UIConstants.sidebarWidth - UIConstants.sidebarCollapsedWidth,
            decoration: BoxDecoration(
              color: colors.surfaceHover,
              border: Border(right: BorderSide(color: colors.border)),
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: List.generate(
                8,
                (i) => Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Row(
                    children: [
                      Container(
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: colors.surfaceHover,
                        ),
                      ),
                      const SizedBox(width: 10),
                      const SizedBox(
                        width: 120,
                        height: 14,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          const Expanded(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(width: 200, height: 24),
                  SizedBox(height: 32),
                  SizedBox(width: double.infinity, height: 200),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
