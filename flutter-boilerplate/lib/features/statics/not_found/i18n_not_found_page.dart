import 'package:flutter/material.dart';

class I18nNotFoundPage extends StatelessWidget {
  final String? description;
  final String? backLabel;
  final VoidCallback? onBack;

  const I18nNotFoundPage({
    super.key,
    this.description,
    this.backLabel,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('404', style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Text(
                description ?? 'Page not found',
                style: TextStyle(color: colors.onSurface.withValues(alpha: 0.6)),
              ),
              if (onBack != null) ...[
                const SizedBox(height: 16),
                TextButton(
                  onPressed: onBack,
                  child: Text(backLabel ?? 'Back home'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
