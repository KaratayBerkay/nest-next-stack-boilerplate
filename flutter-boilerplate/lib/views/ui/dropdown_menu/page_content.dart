import 'package:flutter/material.dart';
import '../../../components/ui/dropdown_menu/dropdown_menu.dart';
import '../../../components/ui/button/button.dart';

class DropdownMenuDemoPage extends StatelessWidget {
  final String lang;
  const DropdownMenuDemoPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dropdown Menu')),
      body: Center(
        child: DropdownMenuList(
          child: const Button(
            child: Text('Open Menu'),
            onPressed: null,
          ),
          items: [
            DropdownMenuItemWidget(label: 'Profile'),
            DropdownMenuItemWidget(label: 'Settings'),
            const DropdownMenuSeparator(),
            DropdownMenuItemWidget(label: 'Logout'),
          ],
        ),
      ),
    );
  }
}
