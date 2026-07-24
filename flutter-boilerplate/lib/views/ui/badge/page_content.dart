import 'package:flutter/material.dart' hide Badge;
import '../../../components/ui/badge/badge.dart';
import '../../../l10n/app_localizations.dart';

class BadgeDemoPage extends StatelessWidget {
  final String lang;
  const BadgeDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiBadgeTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text(
            'Variants',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              Badge(text: 'Default'),
              Badge(text: 'Secondary', variant: BadgeVariant.secondary),
              Badge(text: 'Success', variant: BadgeVariant.success),
              Badge(text: 'Warning', variant: BadgeVariant.warning),
              Badge(text: 'Danger', variant: BadgeVariant.danger),
              Badge(text: 'Info', variant: BadgeVariant.info),
            ],
          ),
          SizedBox(height: 24),
          Text(
            'With Icons',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              Badge(
                text: 'Verified',
                icon: Icons.check_circle,
                variant: BadgeVariant.success,
              ),
              Badge(
                text: 'Pending',
                icon: Icons.schedule,
                variant: BadgeVariant.warning,
              ),
              Badge(
                text: 'New',
                icon: Icons.fiber_new,
                variant: BadgeVariant.danger,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
