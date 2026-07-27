import 'dart:io';

import 'package:flutter/material.dart';

import '../../components/ui/spinner/spinner.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

enum UploadStatus { idle, uploading, failed }

class ImagePreviewSection extends StatelessWidget {
  final String? filePath;
  final UploadStatus uploadStatus;
  final String? imageUrl;
  final VoidCallback? onRemove;
  final VoidCallback? onRetry;

  const ImagePreviewSection({
    super.key,
    this.filePath,
    this.uploadStatus = UploadStatus.idle,
    this.imageUrl,
    this.onRemove,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    if (filePath == null && imageUrl == null) return const SizedBox.shrink();

    final isUploading = uploadStatus == UploadStatus.uploading;
    final isFailed = uploadStatus == UploadStatus.failed;

    return Column(
      children: [
        Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(
                File(filePath!),
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 200,
                  color: colors.surfaceAlt,
                  child: Center(
                    child: Icon(Icons.broken_image, size: 48, color: colors.danger),
                  ),
                ),
              ),
            ),
            if (isUploading)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(child: Spinner()),
                ),
              ),
            if (!isUploading && !isFailed)
              Positioned(
                top: 8,
                right: 8,
                child: InkWell(
                  onTap: onRemove,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.5),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, size: 18, color: Colors.white),
                  ),
                ),
              ),
          ],
        ),
        if (isFailed) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: colors.danger.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: colors.danger.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                Icon(Icons.error_outline, size: 16, color: colors.danger),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    t.shareImageUploadFailed,
                    style: TextStyle(color: colors.danger, fontSize: 13),
                  ),
                ),
                TextButton(
                  onPressed: onRemove,
                  child: Text(t.shareRemove, style: TextStyle(fontSize: 12, color: colors.danger)),
                ),
                TextButton(
                  onPressed: onRetry,
                  child: Text(t.shareRetry, style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
