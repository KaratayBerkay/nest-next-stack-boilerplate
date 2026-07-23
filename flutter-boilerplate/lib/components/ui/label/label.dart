import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class Label extends StatelessWidget {
  final String text;
  final bool required;

  const Label({super.key, required this.text, this.required = false});

  @override
  Widget build(BuildContext context) {
    final typography = AppTypography.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(text, style: typography.label),
        if (required)
          const Text(' *', style: TextStyle(color: Colors.red, fontSize: 13)),
      ],
    );
  }
}
