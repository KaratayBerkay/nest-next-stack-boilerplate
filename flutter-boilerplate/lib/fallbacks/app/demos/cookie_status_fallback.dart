import 'package:flutter/material.dart';

class CookieStatusFallback extends StatelessWidget {
  const CookieStatusFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: colors.outlineVariant),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        'Checking cookie...',
        style: TextStyle(
          color: colors.onSurface.withValues(alpha: 0.4),
          fontSize: 13,
        ),
      ),
    );
  }
}
