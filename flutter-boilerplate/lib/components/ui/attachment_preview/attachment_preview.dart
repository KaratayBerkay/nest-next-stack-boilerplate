import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../constants/theme.dart';

class AttachmentPreview extends StatelessWidget {
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

  Future<void> _open() async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (_isImage) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: _open,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: CachedNetworkImage(
              imageUrl: url,
              width: 180,
              height: 120,
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                width: 180,
                height: 120,
                color: colors.surfaceAlt,
              ),
              errorWidget: (context, url, error) => _FileChip(
                url: url,
                name: name,
                type: type,
                colors: colors,
              ),
            ),
          ),
        ),
      );
    }

    return _FileChip(url: url, name: name, type: type, colors: colors);
  }
}

class _FileChip extends StatelessWidget {
  final String url;
  final String? name;
  final String? type;
  final AppColors colors;

  const _FileChip({
    required this.url,
    required this.name,
    required this.type,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: colors.surfaceAlt,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () async {
          final uri = Uri.parse(url);
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          }
        },
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
