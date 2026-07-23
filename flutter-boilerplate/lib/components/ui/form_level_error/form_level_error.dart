import 'package:flutter/material.dart';

import '../form_error_banner/form_error_banner.dart';

class FormLevelError extends StatelessWidget {
  final String? error;
  final VoidCallback? onDismiss;

  const FormLevelError({
    super.key,
    this.error,
    this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    if (error == null) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: FormErrorBanner(
              errors: [error!],
            ),
          ),
          if (onDismiss != null)
            Padding(
              padding: const EdgeInsets.only(left: 8),
              child: IconButton(
                icon: const Icon(Icons.close, size: 14),
                onPressed: onDismiss,
                visualDensity: VisualDensity.compact,
              ),
            ),
        ],
      ),
    );
  }
}
