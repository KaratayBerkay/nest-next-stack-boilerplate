import 'package:flutter/material.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class FeedListEmptyState extends StatelessWidget {
  final String? lang;
  final VoidCallback? onShare;

  const FeedListEmptyState({
    super.key,
    this.lang,
    this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inbox_outlined, size: 48, color: colors.fgMuted),
            const SizedBox(height: 16),
            Text(
              t.feedNoPostsYet,
              style: TextStyle(color: colors.fgMuted, fontSize: 14),
            ),
            const SizedBox(height: 16),
            if (onShare != null)
              FilledButton(
                onPressed: onShare,
                child: Text(t.feedBeFirstToShare),
              ),
          ],
        ),
      ),
    );
  }
}
