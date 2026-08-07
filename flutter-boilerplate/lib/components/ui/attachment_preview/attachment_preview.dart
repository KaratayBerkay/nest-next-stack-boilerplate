import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/api_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../../app_config.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

/// The bucket stores encrypted blobs — `attachment.url` is the raw object
/// URL and is never directly fetchable. Mirrors the web app's `serveUrl()`
/// (`components/AttachmentPreview.tsx`): rewrite to the backend's decrypting
/// `/upload/serve` endpoint, keyed by the object's path as `objectName`.
String _serveUrl(String rawUrl) {
  final objectName = Uri.parse(rawUrl).path.replaceFirst(RegExp(r'^/'), '');
  return '${AppConfig.apiBaseUrl}/upload/serve'
      '?objectName=${Uri.encodeComponent(objectName)}';
}

class AttachmentPreview extends ConsumerWidget {
  final String url;
  final String? type;
  final String? name;

  const AttachmentPreview({
    super.key,
    required this.url,
    this.type,
    this.name,
  });

  bool get _isImage => (type ?? '').startsWith('image/');

  /// `/upload/serve` requires the same session auth as every other backend
  /// call, so — unlike a plain static asset — it can't be opened in an
  /// external browser (no bearer token there). Fetch it through the app's
  /// authenticated Dio instance instead and hand the bytes off via the
  /// share sheet, which lets the user view/save/forward it.
  Future<void> _open(BuildContext context, WidgetRef ref) async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get<List<int>>(
        _serveUrl(url),
        options: Options(responseType: ResponseType.bytes),
      );
      final dir = await getTemporaryDirectory();
      final fileName = (name?.isNotEmpty ?? false) ? name! : 'attachment';
      final file = File('${dir.path}/$fileName');
      await file.writeAsBytes(response.data!);
      await SharePlus.instance.share(ShareParams(files: [XFile(file.path)]));
    } catch (_) {
      if (context.mounted) {
        final t = AppLocalizations.of(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(t.messagesAttachmentOpenFailed)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final headersAsync = ref.watch(authHeadersProvider);

    if (_isImage) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () => _open(context, ref),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: headersAsync.when(
              data: (headers) => CachedNetworkImage(
                imageUrl: _serveUrl(url),
                httpHeaders: headers,
                width: 180,
                height: 120,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  width: 180,
                  height: 120,
                  color: colors.surfaceAlt,
                ),
                errorWidget: (context, url, error) => _FileChip(
                  name: name,
                  colors: colors,
                  onTap: () => _open(context, ref),
                ),
              ),
              loading: () => Container(
                width: 180,
                height: 120,
                color: colors.surfaceAlt,
              ),
              error: (_, __) => _FileChip(
                name: name,
                colors: colors,
                onTap: () => _open(context, ref),
              ),
            ),
          ),
        ),
      );
    }

    return _FileChip(
      name: name,
      colors: colors,
      onTap: () => _open(context, ref),
    );
  }
}

class _FileChip extends StatelessWidget {
  final String? name;
  final AppColors colors;
  final VoidCallback onTap;

  const _FileChip({
    required this.name,
    required this.colors,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: colors.surfaceAlt,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: colors.border),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.description_outlined,
                size: 18,
                color: colors.fgMuted,
              ),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  (name?.isNotEmpty ?? false) ? name! : 'Attachment',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 12, color: colors.fg),
                ),
              ),
              const SizedBox(width: 6),
              Icon(Icons.open_in_new, size: 14, color: colors.fgMuted),
            ],
          ),
        ),
      ),
    );
  }
}
