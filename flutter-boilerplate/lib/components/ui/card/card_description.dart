import 'package:flutter/material.dart';

class CardDescription extends StatelessWidget {
  final String text;

  const CardDescription({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Text(
      text,
      style: TextStyle(color: colors.onSurface.withValues(alpha: 0.6), fontSize: 13),
    );
  }
}
