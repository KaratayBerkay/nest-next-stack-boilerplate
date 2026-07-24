import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

enum AlertVariant { info, success, warning, danger }

class AlertWidget extends StatelessWidget {
  final String? title;
  final String message;
  final AlertVariant variant;
  final Widget? icon;
  final bool dismissible;
  final VoidCallback? onDismiss;

  const AlertWidget({
    super.key,
    this.title,
    required this.message,
    this.variant = AlertVariant.info,
    this.icon,
    this.dismissible = false,
    this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    final (Color bg, Color fg, IconData defaultIcon) = switch (variant) {
      AlertVariant.info => (
          colors.info.withValues(alpha: 0.1),
          colors.info,
          Icons.info_outline
        ),
      AlertVariant.success => (
          colors.success.withValues(alpha: 0.1),
          colors.success,
          Icons.check_circle_outline
        ),
      AlertVariant.warning => (
          colors.warning.withValues(alpha: 0.1),
          colors.warning,
          Icons.warning_amber_outlined
        ),
      AlertVariant.danger => (
          colors.danger.withValues(alpha: 0.1),
          colors.danger,
          Icons.error_outline
        ),
    };

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: fg.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          icon ?? Icon(defaultIcon, size: 20, color: fg),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (title != null)
                  Text(
                    title!,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      color: fg,
                    ),
                  ),
                Text(
                  message,
                  style: TextStyle(
                    fontSize: 13,
                    color: fg.withValues(alpha: 0.9),
                  ),
                ),
              ],
            ),
          ),
          if (dismissible)
            InkWell(
              onTap: onDismiss,
              child: Icon(Icons.close, size: 16, color: fg),
            ),
        ],
      ),
    );
  }
}

class AlertTitle extends StatelessWidget {
  final String text;

  const AlertTitle({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
    );
  }
}

class AlertDescription extends StatelessWidget {
  final String text;

  const AlertDescription({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 13));
  }
}
