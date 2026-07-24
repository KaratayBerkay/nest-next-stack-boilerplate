import 'package:flutter/material.dart';

import '../../constants/theme.dart';

class LinkText extends StatelessWidget {
  final String text;
  final VoidCallback? onTap;
  final double fontSize;

  const LinkText(
    this.text, {
    super.key,
    this.onTap,
    this.fontSize = 12,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return GestureDetector(
      onTap: onTap,
      child: Text(
        text,
        style: TextStyle(
          fontSize: fontSize,
          color: colors.fgMuted,
          decoration: TextDecoration.underline,
        ),
      ),
    );
  }
}
