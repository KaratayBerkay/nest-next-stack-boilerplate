import 'package:flutter/material.dart';

class DropdownMenuList extends StatelessWidget {
  final Widget child;
  final List<PopupMenuEntry<dynamic>> items;

  const DropdownMenuList({
    super.key,
    required this.child,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<dynamic>(
      itemBuilder: (context) => items,
      child: child,
    );
  }
}
