import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

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
    final t = AppLocalizations.of(context);

    return AlertDialog(
      title: Text(t.formsContentEditorUnsavedTitle),
      content: const Text(
        'You have unsaved changes. Do you want to save a draft before leaving?',
      ),
      actions: [
        TextButton(
          onPressed: onDiscard,
          child: Text('Discard', style: TextStyle(color: colors.danger)),
        ),
        TextButton(
          onPressed: onCancel,
          child: Text(t.formsApiKeyCancel),
        ),
        Button(
          size: ButtonSize.sm,
          onPressed: onSave,
          child: Text(t.formsContentEditorSaveDraft),
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
