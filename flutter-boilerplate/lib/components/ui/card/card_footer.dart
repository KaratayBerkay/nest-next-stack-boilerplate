import 'package:flutter/material.dart';

class CardFooter extends StatelessWidget {
  final Widget child;

  const CardFooter({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: colors.outline.withValues(alpha: 0.2)),
        ),
      ),
      child: child,
    );
  }
}
