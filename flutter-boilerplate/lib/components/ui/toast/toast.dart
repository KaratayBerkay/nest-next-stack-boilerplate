import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

enum ToastType { success, error, warning, info }

void showToast(BuildContext context, String message, {ToastType type = ToastType.info}) {
  final colors = AppColors.of(context);

  final bgColor = switch (type) {
    ToastType.success => colors.success,
    ToastType.error => colors.danger,
    ToastType.warning => colors.warning,
    ToastType.info => colors.fg,
  };

  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(
        message,
        style: TextStyle(color: type == ToastType.warning ? colors.fg : colors.surface),
      ),
      backgroundColor: bgColor,
      behavior: SnackBarBehavior.floating,
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      duration: const Duration(seconds: 3),
    ),
  );
}
