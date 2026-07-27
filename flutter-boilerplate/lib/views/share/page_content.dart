import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/posts/actions.dart';
import '../../api/client/posts/query.dart';
import '../../components/ui/button/button.dart';
import '../../components/ui/page_info/page_info.dart';
import '../../constants/page_info/share.dart';
import '../../constants/theme.dart';
import '../../constants/upload.dart';
import '../../l10n/app_localizations.dart';
import 'image_preview_section.dart';

class SharePageContent extends ConsumerStatefulWidget {
  final String lang;

  const SharePageContent({super.key, required this.lang});

  @override
  ConsumerState<SharePageContent> createState() => _SharePageContentState();
}

class _SharePageContentState extends ConsumerState<SharePageContent> {
  final _titleCtrl = TextEditingController();
  final _contentCtrl = TextEditingController();
  bool _submitting = false;
  String? _pickedFilePath;
  String? _uploadedImageUrl;
  UploadStatus _uploadStatus = UploadStatus.idle;
  String? _errorMessage;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _contentCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final t = AppLocalizations.of(context);
    final result = await FilePicker.pickFiles(
      type: FileType.image,
    );
    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    if (file.size > UploadConstants.maxImageSize) {
      _showError(t.settingsFileTooLarge);
      return;
    }
    final ext = file.extension?.toLowerCase();
    if (ext == null || !UploadConstants.allowedImageTypes.contains(ext)) {
      _showError(t.settingsInvalidFileType);
      return;
    }
    if (file.path == null) return;
    setState(() {
      _pickedFilePath = file.path;
      _uploadedImageUrl = null;
      _uploadStatus = UploadStatus.idle;
      _errorMessage = null;
    });
  }

  Future<void> _submit() async {
    final title = _titleCtrl.text.trim();
    final content = _contentCtrl.text.trim();
    if (title.length < 3 || title.length > 200) {
      _showError('Title must be between 3 and 200 characters.');
      return;
    }
    if (content.isEmpty) {
      _showError('Content is required.');
      return;
    }

    setState(() => _submitting = true);

    try {
      String? imageUrl;
      if (_pickedFilePath != null) {
        setState(() => _uploadStatus = UploadStatus.uploading);
        try {
          imageUrl =
              await ref.read(postActionsProvider).uploadImage(_pickedFilePath!);
        } catch (_) {
          if (mounted) {
            setState(() {
              _uploadStatus = UploadStatus.failed;
              _submitting = false;
            });
          }
          return;
        }
        setState(() => _uploadStatus = UploadStatus.idle);
      }

      await ref.read(postActionsProvider).create(
            title: title,
            content: content,
            imageUrl: imageUrl,
          );

      ref.invalidate(paginatedFeedProvider);
      if (mounted) {
        context.go('/v1/${widget.lang}/feed');
      }
    } catch (_) {
      if (mounted) {
        _showError(AppLocalizations.of(context).shareFailedToCreatePost);
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _showError(String message) {
    setState(() => _errorMessage = message);
  }

  void _clearImage() {
    setState(() {
      _pickedFilePath = null;
      _uploadedImageUrl = null;
      _uploadStatus = UploadStatus.idle;
      _errorMessage = null;
    });
  }

  void _retryUpload() {
    if (_pickedFilePath != null) {
      setState(() {
        _uploadStatus = UploadStatus.idle;
        _errorMessage = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text(
                t.shareShareSomething,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              const PageInfoButton(content: sharePageInfo),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _titleCtrl,
            decoration: InputDecoration(
              labelText: t.shareTitle,
              hintText: t.shareTitlePlaceholder,
            ),
            maxLength: 200,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _contentCtrl,
            decoration: InputDecoration(
              labelText: t.shareContent,
              hintText: t.shareContentPlaceholder,
              alignLabelWithHint: true,
            ),
            maxLines: 6,
            textAlignVertical: TextAlignVertical.top,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Text(
                t.shareImageOptional,
                style: TextStyle(color: colors.fgMuted),
              ),
              const Spacer(),
              if (_pickedFilePath == null)
                TextButton.icon(
                  onPressed: _submitting ? null : _pickImage,
                  icon: const Icon(Icons.image, size: 18),
                  label: const Text('Pick Image'),
                ),
            ],
          ),
          if (_pickedFilePath != null || _uploadedImageUrl != null) ...[
            const SizedBox(height: 12),
            ImagePreviewSection(
              filePath: _pickedFilePath,
              uploadStatus: _uploadStatus,
              imageUrl: _uploadedImageUrl,
              onRemove: _clearImage,
              onRetry: _retryUpload,
            ),
          ],
          if (_errorMessage != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: colors.danger.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: colors.danger.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      _errorMessage!,
                      style: TextStyle(color: colors.danger, fontSize: 13),
                    ),
                  ),
                  InkWell(
                    onTap: () => setState(() => _errorMessage = null),
                    child: Icon(Icons.close, size: 16, color: colors.danger),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 24),
          Button(
            onPressed: _submitting ? null : _submit,
            fullWidth: true,
            child: _submitting
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(t.shareShare),
          ),
        ],
      ),
    );
  }
}
