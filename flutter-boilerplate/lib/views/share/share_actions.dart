import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class ShareActions extends StatelessWidget {
  final String shareLink;
  final String? title;
  final VoidCallback? onShare;

  const ShareActions({
    super.key,
    required this.shareLink,
    this.title,
    this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        FilledButton.icon(
          onPressed: onShare ?? () {},
          icon: const Icon(Icons.share),
          label: Text(t.shareShareLink),
          style: FilledButton.styleFrom(
            minimumSize: const Size(double.infinity, 48),
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () {
            Clipboard.setData(ClipboardData(text: shareLink));
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(t.shareLinkCopied)),
            );
          },
          icon: Icon(Icons.copy, color: colors.fg),
          label: Text(t.shareCopyLink, style: TextStyle(color: colors.fg)),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 48),
            side: BorderSide(color: colors.border),
          ),
        ),
      ],
    );
  }
}
