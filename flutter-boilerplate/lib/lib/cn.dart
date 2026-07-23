import 'package:flutter/material.dart';

String cn(String? a, String? b) {
  if (a == null && b == null) return '';
  if (a == null) return b!;
  if (b == null) return a;
  return '$a $b';
}

List<BoxShadow> mergeShadows(List<BoxShadow>? a, List<BoxShadow>? b) {
  if (a == null && b == null) return [];
  if (a == null) return b!;
  if (b == null) return a;
  return [...a, ...b];
}

EdgeInsetsGeometry mergePadding(EdgeInsetsGeometry? a, EdgeInsetsGeometry? b) {
  if (a == null && b == null) return EdgeInsets.zero;
  if (a == null) return b!;
  if (b == null) return a;
  return a.add(b);
}
