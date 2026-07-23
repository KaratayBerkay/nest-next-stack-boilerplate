import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../components/ui/button/button.dart';

class FormActionBar extends StatelessWidget {
  final VoidCallback? onCancel;
  final VoidCallback? onSubmit;
  final bool isSubmitting;
  final String? statusMessage;
  final String submitLabel;
  final String cancelLabel;

  const FormActionBar({
    super.key,
    this.onCancel,
    this.onSubmit,
    this.isSubmitting = false,
    this.statusMessage,
    this.submitLabel = 'Save',
    this.cancelLabel = 'Cancel',
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final typography = AppTypography.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: colors.surface,
        border: Border(top: BorderSide(color: colors.border)),
      ),
      child: Row(
        children: [
          if (statusMessage != null)
            Expanded(
              child: Text(
                statusMessage!,
                style: typography.bodySmall.copyWith(color: colors.fgMuted),
              ),
            ),
          if (statusMessage == null) const Spacer(),
          if (onCancel != null)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Button(
                variant: ButtonVariant.ghost,
                onPressed: onCancel,
                child: Text(cancelLabel),
              ),
            ),
          Button(
            variant: ButtonVariant.primary,
            loading: isSubmitting,
            onPressed: onSubmit,
            child: Text(submitLabel),
          ),
        ],
      ),
    );
  }
}
