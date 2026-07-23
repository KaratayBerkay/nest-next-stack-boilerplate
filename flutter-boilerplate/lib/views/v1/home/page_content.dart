import 'package:flutter/material.dart';

class V1HomeContent extends StatelessWidget {
  final String lang;

  const V1HomeContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Version v1 · locale $lang',
            style: TextStyle(
              color: theme.colorScheme.primary,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Welcome to v1',
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'This page is wrapped by V1Shell. Use the navigation to explore.',
            style: TextStyle(color: theme.colorScheme.onSurface.withValues(alpha: 0.6)),
          ),
        ],
      ),
    );
  }
}
