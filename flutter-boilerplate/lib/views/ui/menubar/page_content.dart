import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

class MenubarDemoPage extends StatelessWidget {
  final String lang;
  const MenubarDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiMenubarTitle)),
      body: Column(
        children: [
          Container(
            color: Colors.grey[200],
            child: const Row(
              children: [
                _MenuButton(label: 'File'),
                _MenuButton(label: 'Edit'),
                _MenuButton(label: 'View'),
                _MenuButton(label: 'Help'),
              ],
            ),
          ),
          const Expanded(child: Center(child: Text('Menubar demo'))),
        ],
      ),
    );
  }
}

class _MenuButton extends StatelessWidget {
  final String label;
  const _MenuButton({required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: TextButton(onPressed: () {}, child: Text(label)),
    );
  }
}
