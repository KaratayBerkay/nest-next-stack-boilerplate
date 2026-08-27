import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/posts/query.dart';
import '../../../components/ui/avatar/avatar.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class WhoReacted extends ConsumerWidget {
  final String postId;

  const WhoReacted({super.key, required this.postId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final reactorsAsync = ref.watch(whoReactedProvider(postId));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          t.postsReactionsHeading,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        reactorsAsync.when(
          loading: () => const Padding(
            padding: EdgeInsets.all(12),
            child: Center(
              child: SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
          ),
          error: (_, __) => Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              color: colors.surfaceAlt,
            ),
            child: Text(
              t.postsReactionsFailed,
              style: TextStyle(fontSize: 13, color: colors.fgMuted),
            ),
          ),
          data: (reactors) {
            if (reactors.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: colors.surfaceAlt,
                ),
                child: Text(
                  t.postsNoReactionsYet,
                  style: TextStyle(fontSize: 13, color: colors.fgMuted),
                ),
              );
            }
            final names =
                reactors.map((r) => r.name ?? t.postsUnknownUser).toList();
            final label = names.length <= 2
                ? names.join(', ')
                : '${names.take(2).join(', ')} ${t.postsAndNOthers(names.length - 2)}';
            return Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: colors.surfaceAlt,
              ),
              child: Row(
                children: [
                  AvatarGroup(
                    overlap: 6,
                    avatars: reactors
                        .take(3)
                        .map(
                          (r) => Avatar(
                            name: r.name ?? t.postsUnknownUser,
                            radius: 14,
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      label,
                      style: TextStyle(fontSize: 13, color: colors.fgMuted),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
