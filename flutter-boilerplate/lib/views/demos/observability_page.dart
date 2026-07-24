import 'package:flutter/material.dart';
import 'package:logger/logger.dart';

import '../../l10n/app_localizations.dart';

final _logger = Logger();

class ObservabilityDemoPage extends StatelessWidget {
  final String lang;
  const ObservabilityDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.demoObservabilityPageTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Logging & Monitoring',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const Text(
            'Demo of logging, analytics, and performance tracking.',
            style: TextStyle(fontSize: 13, color: Colors.grey),
          ),
          const SizedBox(height: 16),
          _LogButton(
            label: 'Log Info',
            icon: Icons.info,
            onTap: () {
              _logger.i('Info event: User viewed observability demo');
              _showSnack(context, 'Info logged');
            },
          ),
          const SizedBox(height: 8),
          _LogButton(
            label: 'Log Warning',
            icon: Icons.warning,
            onTap: () {
              _logger.w('Warning: Rate limit approaching');
              _showSnack(context, 'Warning logged');
            },
          ),
          const SizedBox(height: 8),
          _LogButton(
            label: 'Log Error',
            icon: Icons.error,
            onTap: () {
              _logger.e('Error: Failed to fetch data');
              _showSnack(context, 'Error logged');
            },
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Logger Output',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Check the debug console for logger output.',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showSnack(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }
}

class _LogButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _LogButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(label),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      tileColor: Theme.of(context).colorScheme.surfaceContainerHighest,
    );
  }
}
