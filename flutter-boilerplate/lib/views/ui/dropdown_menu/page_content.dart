import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/dropdown_menu/dropdown_menu.dart';
import '../../../l10n/app_localizations.dart';

class DropdownMenuDemoPage extends StatelessWidget {
  final String lang;
  const DropdownMenuDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.uiDropdownMenuTitle)),
      body: const Center(
        child: DropdownMenuList(
          items: [
            PopupMenuItem(value: 'profile', child: Text('Profile')),
            PopupMenuItem(value: 'settings', child: Text('Settings')),
            PopupMenuDivider(),
            PopupMenuItem(value: 'logout', child: Text('Logout')),
          ],
          child: Button(
            child: Text('Open Menu'),
          ),
        ),
      ),
    );
  }
}
