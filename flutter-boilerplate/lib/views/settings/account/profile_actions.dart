import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';

class ProfileActions extends StatelessWidget {
  final bool saving;
  final VoidCallback? onSave;
  final VoidCallback? onDelete;
  final String saveLabel;
  final String deleteLabel;

  const ProfileActions({
    super.key,
    this.saving = false,
    this.onSave,
    this.onDelete,
    this.saveLabel = 'Save Changes',
    this.deleteLabel = 'Delete Account',
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Button(
          fullWidth: true,
          onPressed: saving ? null : onSave,
          child: Text(saving ? 'Saving...' : saveLabel),
        ),
        if (onDelete != null) ...[
          const SizedBox(height: 8),
          Button(
            fullWidth: true,
            variant: ButtonVariant.danger,
            onPressed: onDelete,
            child: Text(deleteLabel),
          ),
        ],
      ],
    );
  }
}
