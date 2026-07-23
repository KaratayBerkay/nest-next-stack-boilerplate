import 'package:flutter/material.dart';

class NotFoundPage extends StatelessWidget {
  final String title;
  final String description;
  final String backLabel;
  final VoidCallback? onBack;

  const NotFoundPage({
    super.key,
    this.title = '404',
    this.description = 'This page could not be found.',
    this.backLabel = 'Go home',
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Text(
                description,
                style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6)),
              ),
              if (onBack != null) ...[
                const SizedBox(height: 16),
                TextButton(
                  onPressed: onBack,
                  child: Text(backLabel),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
