import 'package:flutter/material.dart';

import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class DocumentItem {
  final String id;
  final String name;
  final String size;
  final String type;

  const DocumentItem({
    required this.id,
    required this.name,
    required this.size,
    required this.type,
  });
}

class DocumentUploadSection extends StatefulWidget {
  final List<DocumentItem> documents;
  final ValueChanged<String>? onDelete;
  final VoidCallback? onBrowse;

  const DocumentUploadSection({
    super.key,
    required this.documents,
    this.onDelete,
    this.onBrowse,
  });

  @override
  State<DocumentUploadSection> createState() => _DocumentUploadSectionState();
}

class _DocumentUploadSectionState extends State<DocumentUploadSection> {
  final bool _isDragging = false;

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
              'Document Upload',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: widget.onBrowse,
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: _isDragging ? colors.surfaceHover : null,
                  border: Border.all(
                    color: _isDragging ? colors.brand : colors.border,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.cloud_upload_outlined,
                        size: 32,
                        color: colors.fgMuted,
                      ),
                      const SizedBox(height: 8),
                      Text(t.formsUploadsDragDrop),
                      const SizedBox(height: 8),
                      Button(
                        variant: ButtonVariant.outline,
                        size: ButtonSize.sm,
                        onPressed: widget.onBrowse,
                        child: Text(t.formsUploadsBrowseFiles),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            if (widget.documents.isNotEmpty) ...[
              const SizedBox(height: 12),
              ...widget.documents.map(
                (doc) => ListTile(
                  leading: Icon(Icons.description, color: colors.brand),
                  title: Text(doc.name),
                  subtitle: Text(
                    '${doc.size} — ${doc.type}',
                    style: TextStyle(color: colors.fgMuted, fontSize: 12),
                  ),
                  trailing: IconButton(
                    icon: Icon(Icons.delete_outline, color: colors.danger),
                    onPressed: () => widget.onDelete?.call(doc.id),
                  ),
                  dense: true,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
