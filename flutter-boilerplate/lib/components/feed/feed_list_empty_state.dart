import 'package:flutter/material.dart';

import '../../constants/theme.dart';

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

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inbox_outlined, size: 48, color: colors.fgMuted),
            const SizedBox(height: 16),
            Text(
              'No posts yet',
              style: TextStyle(color: colors.fgMuted, fontSize: 14),
            ),
            const SizedBox(height: 16),
            if (onShare != null)
              FilledButton(
                onPressed: onShare,
                child: const Text('Be the first to share'),
              ),
          ],
        ),
      ),
    );
  }
}
