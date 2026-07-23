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
    return PopupMenuButton(
      child: child,
      itemBuilder: (_) => items,
    );
  }
}

class DropdownMenuItemWidget extends PopupMenuItem<dynamic> {
  final String label;
  final IconData? icon;
  final VoidCallback? onTap;

  DropdownMenuItemWidget({
    super.key,
    required this.label,
    this.icon,
    this.onTap,
  }) : super(
          child: Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18),
                const SizedBox(width: 12),
              ],
              Text(label),
            ],
          ),
          onTap: onTap,
        );
}

class DropdownMenuSeparator extends PopupMenuDivider {
  const DropdownMenuSeparator({super.key});
}

class DropdownMenuLabel extends PopupMenuItem<dynamic> {
  final String label;

  DropdownMenuLabel({super.key, required this.label})
      : super(
          enabled: false,
          child: Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 12,
              letterSpacing: 1,
            ),
          ),
        );
}
