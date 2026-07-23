import 'package:flutter/material.dart';

import 'example_tabs_desktop_bar.dart';

class ExampleTabsMobileAccordion extends StatelessWidget {
  final List<UIExample> examples;
  final String currentValue;
  final ValueChanged<String> onChange;
  final bool accordionOpen;
  final VoidCallback onToggle;

  const ExampleTabsMobileAccordion({
    super.key,
    required this.examples,
    required this.currentValue,
    required this.onChange,
    required this.accordionOpen,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            color: colors.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: colors.outlineVariant),
          ),
          child: InkWell(
            onTap: onToggle,
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    examples.firstWhere((e) => e.id == currentValue).title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: accordionOpen ? colors.onSurface : colors.onSurface.withValues(alpha: 0.6),
                    ),
                  ),
                  AnimatedRotation(
                    turns: accordionOpen ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(Icons.expand_more, size: 16, color: colors.onSurface),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (accordionOpen)
          Container(
            margin: const EdgeInsets.only(top: 4),
            decoration: BoxDecoration(
              color: colors.surface,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: colors.outlineVariant),
            ),
            child: Column(
              children: examples.map((example) {
                final isActive = example.id == currentValue;
                return InkWell(
                  onTap: () {
                    onChange(isActive ? '' : example.id);
                    onToggle();
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    child: Text(
                      example.title,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: isActive ? colors.onSurface : colors.onSurface.withValues(alpha: 0.6),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ...examples.where((e) => e.id == currentValue).map((example) => Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (example.description.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Text(
                    example.description,
                    style: TextStyle(
                      fontStyle: FontStyle.italic,
                      color: colors.onSurface.withValues(alpha: 0.6),
                      fontSize: 13,
                    ),
                  ),
                ),
              example.render(),
            ],
          ),
        ),),
      ],
    );
  }
}
