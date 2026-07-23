import 'package:flutter/material.dart';

class StreamingDataFallback extends StatelessWidget {
  const StreamingDataFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Text(
      'Streaming data…',
      style: TextStyle(
        color: colors.onSurface.withValues(alpha: 0.5),
        fontSize: 13,
      ),
    );
  }
}
