import 'package:flutter/material.dart';

class MenuBar extends StatelessWidget {
  final List<MenuBarItem> items;
  final Color? backgroundColor;

  const MenuBar({
    super.key,
    required this.items,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Container(
      color: backgroundColor ?? colors.surface,
      child: Row(
        children: items.map((item) {
          if (item.children.isEmpty) {
            return TextButton(
              onPressed: item.onTap,
              child: Text(item.label),
            );
          }
          return PopupMenuButton<String>(
            onSelected: (value) {
              final child = item.children.firstWhere((c) => c.value == value);
              child.onTap?.call();
            },
            child: TextButton(
              onPressed: null,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(item.label),
                  const Icon(Icons.keyboard_arrow_down, size: 18),
                ],
              ),
            ),
            itemBuilder: (_) => item.children.map((child) {
              return PopupMenuItem<String>(
                value: child.value,
                child: Text(child.label),
              );
            }).toList(),
          );
        }).toList(),
      ),
    );
  }
}

class MenuBarItem {
  final String label;
  final List<MenuBarChildItem> children;
  final VoidCallback? onTap;

  const MenuBarItem({
    required this.label,
    this.children = const [],
    this.onTap,
  });
}

class MenuBarChildItem {
  final String value;
  final String label;
  final VoidCallback? onTap;

  const MenuBarChildItem({
    required this.value,
    required this.label,
    this.onTap,
  });
}
