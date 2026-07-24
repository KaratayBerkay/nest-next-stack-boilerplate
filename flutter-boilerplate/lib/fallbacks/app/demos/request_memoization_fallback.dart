import 'package:flutter/material.dart';

class RequestMemoizationFallback extends StatelessWidget {
  const RequestMemoizationFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Text(
      'Loading results...',
      style: TextStyle(
        color: colors.onSurface.withValues(alpha: 0.4),
        fontSize: 13,
      ),
    );
  }
}
