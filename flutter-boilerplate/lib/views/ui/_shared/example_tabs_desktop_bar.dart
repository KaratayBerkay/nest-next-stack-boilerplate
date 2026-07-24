import 'package:flutter/material.dart';

class UIExample {
  final String id;
  final String title;
  final String description;
  final Widget Function() render;

  const UIExample({
    required this.id,
    required this.title,
    this.description = '',
    required this.render,
  });
}

class ExampleTabsDesktopBar extends StatelessWidget {
  final List<UIExample> examples;
  final String currentValue;
  final ValueChanged<String> onChange;

  const ExampleTabsDesktopBar({
    super.key,
    required this.examples,
    required this.currentValue,
    required this.onChange,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.all(2),
      child: Row(
        children: examples.map((example) {
          final isActive = example.id == currentValue;
          return Expanded(
            child: InkWell(
              onTap: () => onChange(example.id),
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
                  example.title,
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
}
