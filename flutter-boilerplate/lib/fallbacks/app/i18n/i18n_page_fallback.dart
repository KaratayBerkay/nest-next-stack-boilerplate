import 'package:flutter/material.dart';

class I18nPageFallback extends StatelessWidget {
  const I18nPageFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Text(
      'Loading…',
      style: TextStyle(
        color: colors.onSurface.withValues(alpha: 0.5),
        fontSize: 13,
      ),
    );
  }
}
