import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/friends/actions.dart';
import '../../api/client/users/search.dart';
import '../../api/server/friends/suggested.dart';
import '../../api/server/users/search.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import 'suggested_friends_panel.dart';
import 'use_friend_search.dart';
import 'user_search_card.dart';

class MediumFindFriendsContent extends ConsumerWidget {
  final String lang;
  final List<SuggestedUser> suggestedUsers;

  const MediumFindFriendsContent({
    super.key,
    required this.lang,
    required this.suggestedUsers,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final searchState = ref.watch(friendSearchProvider);
    final searchActions = ref.read(friendSearchProvider.notifier);
    final resultsAsync = ref.watch(searchUsersProvider(searchState.query));

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            controller: searchState.controller,
            decoration: InputDecoration(
              hintText: t.findFriendsSearchUsersHint,
              prefixIcon: const Icon(Icons.search),
              border:
                  OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              isDense: true,
            ),
            onChanged: (v) => searchActions.onQueryChanged(v),
          ),
        ),
        Expanded(
          child: searchState.query.isNotEmpty
              ? _buildSearchResults(context, colors, ref, resultsAsync)
              : SuggestedFriendsPanel(
                  suggestedAsync: AsyncData(suggestedUsers),
                  lang: lang,
                ),
        ),
      ],
    );
  }

  Widget _buildSearchResults(
    BuildContext context,
    AppColors colors,
    WidgetRef ref,
    AsyncValue<List<UserSearchResult>> resultsAsync,
  ) {
    return resultsAsync.when(
      loading: () => const Spinner(),
      error: (err, _) => EmptyWidget(
        title: 'Search failed',
        description: err.toString(),
        icon: Icons.error_outline,
      ),
      data: (users) {
        if (users.isEmpty) {
          return const EmptyWidget(
            title: 'No users found',
            description: 'Try a different search term.',
            icon: Icons.search_off,
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: users.length,
          itemBuilder: (_, i) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: UserSearchCard(
              user: users[i],
              onAdd: () =>
                  ref.read(friendActionsProvider).sendRequest(users[i].id),
            ),
          ),
        );
      },
    );
  }
}
