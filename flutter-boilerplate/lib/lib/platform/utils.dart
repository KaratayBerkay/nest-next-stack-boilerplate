import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

bool get isIOS => Platform.isIOS;
bool get isAndroid => Platform.isAndroid;
bool get isWeb => Platform.environment.containsKey('FLUTTER_WEB');

EdgeInsets safeAreaInsets(BuildContext context) {
  return MediaQuery.of(context).padding;
}

double get bottomNavBarInset {
  if (isIOS) return 34;
  return 0;
}

Future<bool> handleAndroidBackGesture(
  BuildContext context, {
  VoidCallback? onBack,
}) async {
  if (isAndroid) {
    onBack?.call();
    return true;
  }
  return false;
}

EdgeInsets appPadding(BuildContext context) {
  final insets = safeAreaInsets(context);
  return EdgeInsets.only(
    top: insets.top + 8,
    bottom: insets.bottom + 8,
    left: insets.left + 16,
    right: insets.right + 16,
  );
}

double keyboardInset(BuildContext context) {
  return MediaQuery.of(context).viewInsets.bottom;
}
