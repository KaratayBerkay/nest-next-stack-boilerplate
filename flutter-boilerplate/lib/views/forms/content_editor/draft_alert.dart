import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';

class DraftAlert extends StatelessWidget {
  final VoidCallback? onSave;
  final VoidCallback? onDiscard;
  final VoidCallback? onCancel;

  const DraftAlert({
    super.key,
    this.onSave,
    this.onDiscard,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return AlertDialog(
      title: const Text('Unsaved Changes'),
      content: const Text('You have unsaved changes. Do you want to save a draft before leaving?'),
      actions: [
        TextButton(
          onPressed: onDiscard,
          child: Text('Discard', style: TextStyle(color: colors.danger)),
        ),
        TextButton(
          onPressed: onCancel,
          child: const Text('Cancel'),
        ),
        Button(
          size: ButtonSize.sm,
          onPressed: onSave,
          child: const Text('Save Draft'),
        ),
      ],
    );
  }
}

Future<bool?> showDraftAlert(BuildContext context) {
  return showDialog<bool>(
    context: context,
    builder: (ctx) => DraftAlert(
      onSave: () => Navigator.of(ctx).pop(true),
      onDiscard: () => Navigator.of(ctx).pop(false),
      onCancel: () => Navigator.of(ctx).pop(),
    ),
  );
}
