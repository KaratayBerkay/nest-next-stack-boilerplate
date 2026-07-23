import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/server/friends/suggested.dart';
import '../../constants/theme.dart';
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

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Find People',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Upgrade to Basic to search for users.',
            style: TextStyle(color: colors.fgMuted, fontSize: 13),
          ),
          const SizedBox(height: 24),
          Text(
            'Suggested Friends',
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
