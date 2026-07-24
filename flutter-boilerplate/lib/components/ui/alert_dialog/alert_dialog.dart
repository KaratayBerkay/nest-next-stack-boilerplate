import 'package:flutter/material.dart';

import '../button/button.dart';

class AlertDialogWidget extends StatelessWidget {
  final String? title;
  final String? description;
  final Widget? content;
  final String? cancelText;
  final String? confirmText;
  final VoidCallback? onConfirm;
  final VoidCallback? onCancel;
  final bool destructive;

  const AlertDialogWidget({
    super.key,
    this.title,
    this.description,
    this.content,
    this.cancelText,
    this.confirmText,
    this.onConfirm,
    this.onCancel,
    this.destructive = false,
  });

  static Future<bool?> show(
    BuildContext context, {
    String? title,
    String? description,
    Widget? content,
    String? cancelText,
    String? confirmText,
    bool destructive = false,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: title != null ? Text(title) : null,
        content: content ?? (description != null ? Text(description) : null),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(cancelText ?? 'Cancel'),
          ),
          Button(
            variant: destructive ? ButtonVariant.danger : ButtonVariant.primary,
            child: Text(confirmText ?? 'Confirm'),
            onPressed: () => Navigator.of(context).pop(true),
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
