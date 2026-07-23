import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

enum TypographyVariant { h1, h2, h3, h4, body, bodySmall, caption, code, label }

class Typography extends StatelessWidget {
  final String text;
  final TypographyVariant variant;
  final Color? color;
  final TextAlign? textAlign;

  const Typography({
    super.key,
    required this.text,
    this.variant = TypographyVariant.body,
    this.color,
    this.textAlign,
  });

  @override
  Widget build(BuildContext context) {
    final typography = AppTypography.of(context);
    TextStyle style;

    style = switch (variant) {
      TypographyVariant.h1 => typography.h1,
      TypographyVariant.h2 => typography.h2,
      TypographyVariant.h3 => typography.h3,
      TypographyVariant.h4 => typography.h4,
      TypographyVariant.body => typography.body,
      TypographyVariant.bodySmall => typography.bodySmall,
      TypographyVariant.caption => typography.caption,
      TypographyVariant.code => typography.code,
      TypographyVariant.label => typography.label,
    };

    if (color != null) {
      style = style.copyWith(color: color);
    }

    return Text(text, style: style, textAlign: textAlign);
  }
}
