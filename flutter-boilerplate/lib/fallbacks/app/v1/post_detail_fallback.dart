import 'package:flutter/material.dart';

class PostDetailFallback extends StatelessWidget {
  const PostDetailFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _PulseBlock(width: 48, height: 16),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: colors.outlineVariant),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: colors.surfaceContainerHighest.withValues(alpha: 0.3),
                    ),
                    const SizedBox(width: 12),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _PulseBlock(width: 96),
                        SizedBox(height: 4),
                        _PulseBlock(width: 64, height: 8),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const _PulseBlock(width: 200, height: 24),
                const SizedBox(height: 12),
                const _PulseBlock(),
                const SizedBox(height: 4),
                const _PulseBlock(width: 200),
                const SizedBox(height: 4),
                const _PulseBlock(width: 150),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PulseBlock extends StatelessWidget {
  final double width;
  final double height;
  const _PulseBlock({this.width = double.infinity, this.height = 12});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}
