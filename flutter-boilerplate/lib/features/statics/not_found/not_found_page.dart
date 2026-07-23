import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NotFoundPage extends StatelessWidget {
  final String? message;

  const NotFoundPage({super.key, this.message});

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
                onPressed: () => context.go('/'),
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
