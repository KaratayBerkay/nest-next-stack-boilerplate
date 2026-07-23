import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
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
    final colors = AppColors.of(context);

    return Row(
      children: [
        if (canDelete && onDelete != null)
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Button(
              variant: ButtonVariant.danger,
              size: ButtonSize.sm,
              child: const Text('Delete'),
              onPressed: onDelete,
            ),
          ),
        if (onAdd != null)
          Button(
            variant: ButtonVariant.outline,
            size: ButtonSize.sm,
            child: const Text('Add Row'),
            onPressed: onAdd,
          ),
      ],
    );
  }
}
