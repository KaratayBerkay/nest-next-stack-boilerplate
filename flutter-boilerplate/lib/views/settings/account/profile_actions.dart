import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
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
          child: Text(saving ? 'Saving...' : saveLabel),
          onPressed: saving ? null : onSave,
        ),
        if (onDelete != null) ...[
          const SizedBox(height: 8),
          Button(
            fullWidth: true,
            variant: ButtonVariant.danger,
            child: Text(deleteLabel),
            onPressed: onDelete,
          ),
        ],
      ],
    );
  }
}
