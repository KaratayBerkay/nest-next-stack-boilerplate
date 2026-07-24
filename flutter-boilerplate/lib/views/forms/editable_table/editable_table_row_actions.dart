import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../l10n/app_localizations.dart';

class EditableTableRowActions extends StatelessWidget {
  final VoidCallback? onAdd;
  final bool canDelete;
  final VoidCallback? onDelete;

  const EditableTableRowActions({
    super.key,
    this.onAdd,
    this.canDelete = false,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Row(
      children: [
        if (canDelete && onDelete != null)
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Button(
              variant: ButtonVariant.danger,
              size: ButtonSize.sm,
              onPressed: onDelete,
              child: Text(t.formsEditableTableDelete),
            ),
          ),
        if (onAdd != null)
          Button(
            variant: ButtonVariant.outline,
            size: ButtonSize.sm,
            onPressed: onAdd,
            child: Text(t.formsEditableTableAddRow),
          ),
      ],
    );
  }
}
