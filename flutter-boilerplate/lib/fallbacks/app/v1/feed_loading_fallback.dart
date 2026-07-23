import 'package:flutter/material.dart';

class FeedLoadingFallback extends StatelessWidget {
  const FeedLoadingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
        _PulseBlock(width: 64, height: 16),
            SizedBox(height: 16),
            _PulseBlock(width: double.infinity, height: 32),
            SizedBox(height: 16),
            _PulseBlock(width: double.infinity, height: 128),
            SizedBox(height: 12),
            _PulseBlock(width: double.infinity, height: 128),
            SizedBox(height: 12),
            _PulseBlock(width: double.infinity, height: 128),
        ],
      ),
    );
  }
}

class _PulseBlock extends StatelessWidget {
  final double width;
  final double height;
  const _PulseBlock({required this.width, required this.height});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}
