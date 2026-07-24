import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/server/friends/suggested.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import 'suggested_friends_panel.dart';

class FreeFindFriendsContent extends ConsumerWidget {
  final String lang;
  final AsyncValue<List<SuggestedUser>> suggestedAsync;

  const FreeFindFriendsContent({
    super.key,
    required this.lang,
    required this.suggestedAsync,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            t.findFriendsTitle,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            t.findFriendsUpgradeToSee,
            style: TextStyle(color: colors.fgMuted, fontSize: 13),
          ),
          const SizedBox(height: 24),
          Text(
            t.findFriendsSuggestedFriends,
            style: TextStyle(
              color: colors.fgMuted,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 8),
          SuggestedFriendsPanel(
            suggestedAsync: suggestedAsync,
            lang: lang,
          ),
        ],
      ),
    );
  }
}
