import 'package:flutter/material.dart';

import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class AvatarUploadSection extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final VoidCallback? onUpload;
  final VoidCallback? onRemove;

  const AvatarUploadSection({
    super.key,
    this.imageUrl,
    this.name = 'User',
    this.onUpload,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    final t = AppLocalizations.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Avatar Upload',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Center(
              child: Column(
                children: [
                  Avatar(name: name, imageUrl: imageUrl, radius: 40),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Button(
                        variant: ButtonVariant.outline,
                        size: ButtonSize.sm,
                        onPressed: onUpload,
                        child: Text(t.formsUploadsUploadPhoto),
                      ),
                      if (imageUrl != null && onRemove != null) ...[
                        const SizedBox(width: 8),
                        Button(
                          variant: ButtonVariant.ghost,
                          size: ButtonSize.sm,
                          onPressed: onRemove,
                          child: Text(
                            'Remove',
                            style: TextStyle(color: colors.danger),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
