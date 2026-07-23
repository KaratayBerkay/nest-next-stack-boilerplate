import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';

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
    return Row(
      children: [
        if (canDelete && onDelete != null)
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Button(
              variant: ButtonVariant.danger,
              size: ButtonSize.sm,
              onPressed: onDelete,
              child: const Text('Delete'),
            ),
          ),
        if (onAdd != null)
          Button(
            variant: ButtonVariant.outline,
            size: ButtonSize.sm,
            onPressed: onAdd,
            child: const Text('Add Row'),
          ),
      ],
    );
  }
}
