import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class GalleryItem {
  final String id;
  final String url;
  final String name;

  const GalleryItem({
    required this.id,
    required this.url,
    required this.name,
  });
}

class GalleryUploadSection extends StatelessWidget {
  final List<GalleryItem> images;
  final ValueChanged<String>? onDelete;
  final VoidCallback? onAdd;

  const GalleryUploadSection({
    super.key,
    required this.images,
    this.onDelete,
    this.onAdd,
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Gallery',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Button(
                  variant: ButtonVariant.outline,
                  size: ButtonSize.sm,
                  onPressed: onAdd,
                  child: Text(t.formsUploadsAddImages),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (images.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 32),
                  child: Column(
                    children: [
                      Icon(
                        Icons.photo_library_outlined,
                        size: 48,
                        color: colors.fgMuted,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'No images yet',
                        style: TextStyle(color: colors.fgMuted),
                      ),
                      const SizedBox(height: 8),
                      Button(
                        variant: ButtonVariant.outline,
                        size: ButtonSize.sm,
                        onPressed: onAdd,
                        child: Text(t.formsUploadsUploadImages),
                      ),
                    ],
                  ),
                ),
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                ),
                itemCount: images.length,
                itemBuilder: (context, index) {
                  final img = images[index];
                  return Stack(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: colors.surfaceAlt,
                          borderRadius: BorderRadius.circular(6),
                          image: DecorationImage(
                            image: NetworkImage(img.url),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      if (onDelete != null)
                        Positioned(
                          top: 4,
                          right: 4,
                          child: GestureDetector(
                            onTap: () => onDelete!(img.id),
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: colors.danger,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.close,
                                size: 12,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                    ],
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
