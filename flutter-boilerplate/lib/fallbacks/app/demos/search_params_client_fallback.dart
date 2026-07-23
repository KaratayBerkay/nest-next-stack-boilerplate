import 'package:flutter/material.dart';

class SearchParamsClientFallback extends StatelessWidget {
  const SearchParamsClientFallback({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Text(
      'Loading client params...',
      style: TextStyle(
        color: colors.onSurface.withValues(alpha: 0.5),
        fontSize: 13,
      ),
    );
  }
}
