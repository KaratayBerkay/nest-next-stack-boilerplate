import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/dropdown_menu/dropdown_menu.dart';

class DropdownMenuDemoPage extends StatelessWidget {
  final String lang;
  const DropdownMenuDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dropdown Menu')),
      body: const Center(
        child: const DropdownMenuList(
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
