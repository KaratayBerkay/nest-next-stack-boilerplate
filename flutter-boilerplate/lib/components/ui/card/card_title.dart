import 'package:flutter/material.dart';

class CardTitle extends StatelessWidget {
  final String text;
  final TextStyle? style;

  const CardTitle({super.key, required this.text, this.style});

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: style ??
          Theme.of(context)
              .textTheme
              .titleMedium
              ?.copyWith(fontWeight: FontWeight.w600),
    );
  }
}
