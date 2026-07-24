import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/friends/actions.dart';
import '../../api/client/friends/query.dart';
import '../../api/client/users/search.dart';
import '../../api/server/friends/suggested.dart';
import '../../api/server/users/search.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../constants/theme.dart';
import '../../types/messages/friend_request_types.dart';
import 'pending_request_card.dart';
import 'suggested_friends_panel.dart';
import 'use_friend_search.dart';
import 'user_search_card.dart';

class PremiumFindFriendsPage extends ConsumerWidget {
  final String lang;

  const PremiumFindFriendsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final suggestedAsync = ref.watch(suggestedFriendsProvider);
    final requestsAsync = ref.watch(friendRequestsProvider);
    final searchState = ref.watch(friendSearchProvider);
    final searchActions = ref.read(friendSearchProvider.notifier);
    final resultsAsync = ref.watch(searchUsersProvider(searchState.query));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Friends'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterSheet(context),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: TextField(
              controller: searchState.controller,
              decoration: InputDecoration(
                hintText: 'Search users by name or email...',
                prefixIcon: const Icon(Icons.search),
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                isDense: true,
              ),
              onChanged: (v) => searchActions.onQueryChanged(v),
            ),
          ),
          Expanded(
            child: _buildContent(
              context: context,
              colors: colors,
              lang: lang,
              ref: ref,
              searchState: searchState,
              resultsAsync: resultsAsync,
              suggestedAsync: suggestedAsync,
              requestsAsync: requestsAsync,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent({
    required BuildContext context,
    required AppColors colors,
    required String lang,
    required WidgetRef ref,
    required FriendSearchState searchState,
    required AsyncValue<List<UserSearchResult>> resultsAsync,
    required AsyncValue<dynamic> suggestedAsync,
    required AsyncValue<dynamic> requestsAsync,
  }) {
    if (searchState.query.isNotEmpty) {
      return _buildSearchResults(context, colors, ref, resultsAsync);
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ..._buildRequestsSection(requestsAsync, ref, colors),
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
            suggestedAsync: suggestedAsync as AsyncValue<List<SuggestedUser>>,
            lang: lang,
          ),
        ],
      ),
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

  List<Widget> _buildRequestsSection(
    AsyncValue<dynamic> requestsAsync,
    WidgetRef ref,
    AppColors colors,
  ) {
    final requests = requestsAsync.asData?.value;
    if (requests == null || (requests as List).isEmpty) return [];

    return [
      Text(
        'Pending Requests',
        style: TextStyle(
          color: colors.fgMuted,
          fontWeight: FontWeight.w600,
          fontSize: 13,
        ),
      ),
      const SizedBox(height: 8),
      ...(requests as List<FriendRequest>).map(
        (req) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: PendingRequestCard(
            request: req,
            onAccept: () =>
                ref.read(friendActionsProvider).acceptRequest(req.id),
            onDecline: () =>
                ref.read(friendActionsProvider).declineRequest(req.id),
          ),
        ),
      ),
      const SizedBox(height: 16),
    ];
  }

  void _showFilterSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      builder: (_) => const Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Filter by', style: TextStyle(fontWeight: FontWeight.w600)),
            SizedBox(height: 16),
            ListTile(
              leading: Icon(Icons.people),
              title: Text('Mutual friends'),
              trailing: Icon(Icons.check),
            ),
            ListTile(
              leading: Icon(Icons.location_on),
              title: Text('Nearby'),
            ),
            ListTile(
              leading: Icon(Icons.school),
              title: Text('Same interests'),
            ),
          ],
        ),
      ),
    );
  }
}
