import 'package:flutter/material.dart';

class ConfirmDialogWidget extends StatelessWidget {
  final String title;
  final String message;
  final String confirmText;
  final String cancelText;
  final VoidCallback? onConfirm;
  final VoidCallback? onCancel;

  const ConfirmDialogWidget({
    super.key,
    required this.title,
    required this.message,
    this.confirmText = 'Confirm',
    this.cancelText = 'Cancel',
    this.onConfirm,
    this.onCancel,
  });

  static Future<bool?> show(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'Confirm',
    String cancelText = 'Cancel',
  }) {
    return showDialog<bool>(
      context: context,
      // Pop via the builder's own context, not the outer `context` param —
      // showDialog pushes onto the root navigator by default, but a
      // GoRouter ShellRoute (as this app's authenticated routes use) nests
      // its own Navigator, so `Navigator.of(context)` from the *caller's*
      // context can resolve to that nested navigator instead. Popping the
      // wrong navigator leaves the dialog's own route on the root navigator
      // forever, so `show()`'s Future never resolves and the barrier stays
      // up (a permanent black-screen hang with no crash).
      builder: (dialogContext) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: Text(cancelText),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: Text(confirmText),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink();
  }
}
