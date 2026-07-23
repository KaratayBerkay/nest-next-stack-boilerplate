import 'package:flutter/material.dart';

class ContextMenu extends StatelessWidget {
  final Widget child;
  final List<ContextMenuEntry> entries;

  const ContextMenu({
    super.key,
    required this.child,
    required this.entries,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: () async {
        final renderBox = context.findRenderObject() as RenderBox;
        final position = renderBox.localToGlobal(Offset.zero);
        final result = await showMenu<String>(
          context: context,
          position: RelativeRect.fromLTRB(
            position.dx,
            position.dy,
            position.dx + renderBox.size.width,
            position.dy + renderBox.size.height,
          ),
          items: entries.map((e) {
            return PopupMenuItem<String>(
              value: e.value,
              child: Row(
                children: [
                  if (e.icon != null) ...[
                    Icon(e.icon, size: 18),
                    const SizedBox(width: 8),
                  ],
                  Text(e.label),
                ],
              ),
            );
          }).toList(),
        );
        if (result != null) {
          final entry = entries.firstWhere((e) => e.value == result);
          entry.onTap?.call();
        }
      },
      child: child,
    );
  }
}

class ContextMenuEntry {
  final String value;
  final String label;
  final IconData? icon;
  final VoidCallback? onTap;

  const ContextMenuEntry({
    required this.value,
    required this.label,
    this.icon,
    this.onTap,
  });
}
