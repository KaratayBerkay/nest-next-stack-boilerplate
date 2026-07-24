import 'package:flutter/material.dart';

class TabNavItem {
  final String id;
  final String title;

  const TabNavItem({required this.id, required this.title});
}

class TabNav extends StatefulWidget {
  final List<TabNavItem> items;
  final String basePath;
  final String activeId;
  final ValueChanged<String> onChanged;

  const TabNav({
    super.key,
    required this.items,
    required this.basePath,
    required this.activeId,
    required this.onChanged,
  });

  @override
  State<TabNav> createState() => _TabNavState();
}

class _TabNavState extends State<TabNav> {
  bool _accordionOpen = false;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= 768) {
          return _buildDesktop(colors);
        }
        return _buildMobile(colors);
      },
    );
  }

  Widget _buildDesktop(ColorScheme colors) {
    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.all(2),
      child: Row(
        children: widget.items.map((item) {
          final isActive = item.id == widget.activeId;
          return Expanded(
            child: InkWell(
              onTap: () => widget.onChanged(item.id),
              borderRadius: BorderRadius.circular(6),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: isActive
                      ? colors.surfaceContainerHighest
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(6),
                  border: isActive
                      ? Border.all(color: colors.outlineVariant)
                      : null,
                ),
                child: Text(
                  item.title,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: isActive
                        ? colors.onSurface
                        : colors.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMobile(ColorScheme colors) {
    return Column(
      children: [
        InkWell(
          onTap: () => setState(() => _accordionOpen = !_accordionOpen),
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: _accordionOpen
                  ? colors.surfaceContainerHighest
                  : colors.surface,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: colors.outlineVariant),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.items.firstWhere((i) => i.id == widget.activeId).title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: _accordionOpen
                        ? colors.onSurface
                        : colors.onSurface.withValues(alpha: 0.6),
                  ),
                ),
                AnimatedRotation(
                  turns: _accordionOpen ? 0.5 : 0,
                  duration: const Duration(milliseconds: 200),
                  child: Icon(
                    Icons.expand_more,
                    size: 16,
                    color: colors.onSurface,
                  ),
                ),
              ],
            ),
          ),
        ),
        if (_accordionOpen)
          Container(
            margin: const EdgeInsets.only(top: 4),
            decoration: BoxDecoration(
              color: colors.surface,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: colors.outlineVariant),
            ),
            child: Column(
              children: widget.items.map((item) {
                final isActive = item.id == widget.activeId;
                return InkWell(
                  onTap: () {
                    widget.onChanged(item.id);
                    setState(() => _accordionOpen = false);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    child: Text(
                      item.title,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: isActive
                            ? colors.onSurface
                            : colors.onSurface.withValues(alpha: 0.6),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
      ],
    );
  }
}
