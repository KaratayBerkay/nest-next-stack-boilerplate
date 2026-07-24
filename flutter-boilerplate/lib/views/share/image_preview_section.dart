import 'package:flutter/material.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class ImagePreviewSection extends StatelessWidget {
  final String? imageUrl;

  const ImagePreviewSection({super.key, this.imageUrl});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    if (imageUrl == null) {
      return Container(
        height: 200,
        decoration: BoxDecoration(
          color: colors.surfaceAlt,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.image_outlined, size: 48, color: colors.fgMuted),
              const SizedBox(height: 8),
              Text(
                t.shareNoImage,
                style: TextStyle(color: colors.fgMuted),
              ),
            ],
          ),
        ),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.network(
        imageUrl!,
        height: 200,
        width: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          height: 200,
          color: colors.surfaceAlt,
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.broken_image, size: 48, color: colors.danger),
                const SizedBox(height: 8),
                Text(
                  t.shareFailedToLoadImage,
                  style: TextStyle(color: colors.fgMuted),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
