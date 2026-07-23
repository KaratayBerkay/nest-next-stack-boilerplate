import 'package:flutter/material.dart';

class SearchParamsServerFallback extends StatelessWidget {
  const SearchParamsServerFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Text(
      'Loading server params...',
      style: TextStyle(
        color: colors.onSurface.withValues(alpha: 0.5),
        fontSize: 13,
      ),
    );
  }
}
