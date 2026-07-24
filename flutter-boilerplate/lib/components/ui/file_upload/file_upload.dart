import 'package:flutter/material.dart';

class FileUpload extends StatelessWidget {
  final String? fileName;
  final void Function()? onPick;
  final void Function()? onClear;
  final String? hintText;
  final bool dragActive;

  const FileUpload({
    super.key,
    this.fileName,
    this.onPick,
    this.onClear,
    this.hintText,
    this.dragActive = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return InkWell(
      onTap: onPick,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        decoration: BoxDecoration(
          border: Border.all(
            color: dragActive ? colors.primary : colors.outline,
            width: dragActive ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
          color: dragActive ? colors.primary.withValues(alpha: 0.05) : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              fileName != null
                  ? Icons.description
                  : Icons.cloud_upload_outlined,
              size: 24,
              color: colors.primary,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                fileName ?? hintText ?? 'Drop file here or tap to browse',
                style:
                    TextStyle(color: colors.onSurface.withValues(alpha: 0.6)),
              ),
            ),
            if (fileName != null && onClear != null)
              IconButton(
                icon: const Icon(Icons.close, size: 18),
                onPressed: onClear,
              ),
          ],
        ),
      ),
    );
  }
}
