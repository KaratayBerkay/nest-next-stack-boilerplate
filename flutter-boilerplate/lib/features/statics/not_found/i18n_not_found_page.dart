import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class I18nNotFoundPage extends StatelessWidget {
  final String lang;
  final String? message;

  const I18nNotFoundPage({super.key, required this.lang, this.message});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '404',
                style: theme.textTheme.displayLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                message ?? 'Page not found',
                style: theme.textTheme.titleMedium,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => context.go('/v1/$lang'),
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
