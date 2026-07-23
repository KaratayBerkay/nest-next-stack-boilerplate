import 'package:flutter/material.dart';

class ButtonGroup extends StatelessWidget {
  final List<Widget> children;
  final MainAxisAlignment alignment;
  final double spacing;

  const ButtonGroup({
    super.key,
    required this.children,
    this.alignment = MainAxisAlignment.start,
    this.spacing = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: spacing,
      runSpacing: spacing,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: children,
    );
  }
}
