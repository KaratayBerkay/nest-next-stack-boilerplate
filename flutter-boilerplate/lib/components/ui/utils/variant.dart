import 'package:flutter/material.dart';

typedef VariantStyle<T> = T Function(BuildContext context);

class VariantResolver<T> {
  final Map<String, VariantStyle<T>> _variants;
  final VariantStyle<T> _defaultStyle;

  const VariantResolver({
    required Map<String, VariantStyle<T>> variants,
    required VariantStyle<T> defaultStyle,
  })  : _variants = variants,
        _defaultStyle = defaultStyle;

  T resolve(BuildContext context, String variant) {
    final style = _variants[variant];
    if (style != null) return style(context);
    return _defaultStyle(context);
  }
}
