import 'package:flutter/material.dart';

class MessagesLoadingFallback extends StatelessWidget {
  const MessagesLoadingFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const Row(
            children: [
              _PulseCircle(radius: 16),
              SizedBox(width: 12),
              _PulseLine(width: 96),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: Row(
              children: [
                const SizedBox(
                  width: 320,
                  child: Column(
                    children: [
                      _PulseLine(height: 40),
                      SizedBox(height: 8),
                      _PulseLine(height: 32),
                      SizedBox(height: 8),
                      _PulseLine(height: 32),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    children: [
                      const Row(
                        children: [
                          _PulseCircle(radius: 16),
                          SizedBox(width: 12),
                          _PulseLine(width: 128),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: ListView(
                          children: List.generate(6, (i) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: Row(
                                mainAxisAlignment: i.isEven ? MainAxisAlignment.end : MainAxisAlignment.start,
                                children: [
                                  _PulseLine(
                                    width: 100.0 + (i % 3) * 60,
                                    height: 40,
                                  ),
                                ],
                              ),
                            );
                          }),
                        ),
                      ),
                      const _PulseLine(height: 40),
                    ],
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

class _PulseCircle extends StatelessWidget {
  final double radius;
  const _PulseCircle({required this.radius});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return CircleAvatar(
      radius: radius,
      backgroundColor: colors.surfaceContainerHighest.withValues(alpha: 0.3),
    );
  }
}

class _PulseLine extends StatelessWidget {
  final double? width;
  final double height;
  const _PulseLine({this.width, this.height = 16});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      width: width ?? double.infinity,
      height: height,
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(height > 20 ? 16 : 4),
      ),
    );
  }
}
