import 'package:flutter/material.dart';
import '../../../components/ui/avatar/avatar.dart';
import '../../../l10n/app_localizations.dart';

class AvatarDemoPage extends StatelessWidget {
  final String lang;
  const AvatarDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiAvatarTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text(
            'Sizes',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              Avatar(name: 'Alice', radius: 12),
              Avatar(name: 'Bob', radius: 16),
              Avatar(name: 'Charlie'),
              Avatar(name: 'Diana', radius: 24),
              Avatar(name: 'Eve', radius: 32),
            ],
          ),
          SizedBox(height: 24),
          Text(
            'With Image',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Avatar(name: 'User', radius: 24),
          SizedBox(height: 24),
          Text(
            'Initials Fallback',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Wrap(
            spacing: 12,
            children: [
              Avatar(name: 'John Doe'),
              Avatar(name: 'Jane Smith'),
              Avatar(name: 'AI'),
            ],
          ),
        ],
      ),
    );
  }
}
