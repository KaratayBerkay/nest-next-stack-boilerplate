import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

class TypographyDemoPage extends StatelessWidget {
  final String lang;
  const TypographyDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiTypographyTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Display Large',
            style: Theme.of(context).textTheme.displayLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'Display Medium',
            style: Theme.of(context).textTheme.displayMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Display Small',
            style: Theme.of(context).textTheme.displaySmall,
          ),
          const SizedBox(height: 16),
          Text(
            'Headline Large',
            style: Theme.of(context).textTheme.headlineLarge,
          ),
          Text(
            'Headline Medium',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          Text(
            'Headline Small',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Text('Title Large', style: Theme.of(context).textTheme.titleLarge),
          Text('Title Medium', style: Theme.of(context).textTheme.titleMedium),
          Text('Title Small', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 16),
          Text('Body Large', style: Theme.of(context).textTheme.bodyLarge),
          Text('Body Medium', style: Theme.of(context).textTheme.bodyMedium),
          Text('Body Small', style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 16),
          Text('Label Large', style: Theme.of(context).textTheme.labelLarge),
          Text('Label Medium', style: Theme.of(context).textTheme.labelMedium),
          Text('Label Small', style: Theme.of(context).textTheme.labelSmall),
        ],
      ),
    );
  }
}
