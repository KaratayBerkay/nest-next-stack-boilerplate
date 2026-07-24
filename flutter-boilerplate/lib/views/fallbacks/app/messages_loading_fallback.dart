import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../constants/theme.dart';
import '../../../constants/ui.dart';

class MessagesLoadingFallback extends StatelessWidget {
  const MessagesLoadingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Shimmer.fromColors(
      baseColor: colors.surfaceHover,
      highlightColor: colors.surfaceAlt,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: UIConstants.sidebarWidth,
            child: Container(
              decoration: BoxDecoration(
                border: Border(
                  right: BorderSide(color: colors.border),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    height: UIConstants.headerHeight,
                    padding: const EdgeInsets.all(16),
                    child: Container(
                      width: double.infinity,
                      height: 40,
                      decoration: BoxDecoration(
                        color: colors.surfaceHover,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      itemCount: 10,
                      padding: EdgeInsets.zero,
                      itemBuilder: (_, i) => Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 20,
                              backgroundColor: colors.surfaceHover,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        width: 80,
                                        height: 14,
                                        decoration: BoxDecoration(
                                          color: colors.surfaceHover,
                                          borderRadius:
                                              BorderRadius.circular(4),
                                        ),
                                      ),
                                      Container(
                                        width: 36,
                                        height: 10,
                                        decoration: BoxDecoration(
                                          color: colors.surfaceHover,
                                          borderRadius:
                                              BorderRadius.circular(2),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Container(
                                    width: 160,
                                    height: 12,
                                    decoration: BoxDecoration(
                                      color: colors.surfaceHover,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: Column(
              children: [
                Container(
                  height: UIConstants.headerHeight,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: colors.border),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 120,
                        height: 18,
                        decoration: BoxDecoration(
                          color: colors.surfaceHover,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const Spacer(),
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: colors.surfaceHover,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        const _ChatBubble(
                          width: 200,
                          align: CrossAxisAlignment.start,
                        ),
                        const SizedBox(height: 8),
                        const _ChatBubble(
                          width: 150,
                          align: CrossAxisAlignment.end,
                        ),
                        const SizedBox(height: 8),
                        const _ChatBubble(
                          width: 240,
                          align: CrossAxisAlignment.start,
                        ),
                        const SizedBox(height: 8),
                        const _ChatBubble(
                          width: 120,
                          align: CrossAxisAlignment.end,
                        ),
                        const SizedBox(height: 24),
                        Container(
                          width: double.infinity,
                          height: 44,
                          decoration: BoxDecoration(
                            color: colors.surfaceHover,
                            borderRadius: BorderRadius.circular(22),
                          ),
                        ),
                        const SizedBox(height: 8),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final double width;
  final CrossAxisAlignment align;

  const _ChatBubble({required this.width, required this.align});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      width: width,
      height: 36,
      alignment: align == CrossAxisAlignment.end
          ? Alignment.centerRight
          : Alignment.centerLeft,
      child: Container(
        decoration: BoxDecoration(
          color: colors.surfaceHover,
          borderRadius: BorderRadius.circular(8).copyWith(
            bottomLeft: align == CrossAxisAlignment.end
                ? const Radius.circular(8)
                : Radius.zero,
            bottomRight: align == CrossAxisAlignment.start
                ? const Radius.circular(8)
                : Radius.zero,
          ),
        ),
      ),
    );
  }
}
