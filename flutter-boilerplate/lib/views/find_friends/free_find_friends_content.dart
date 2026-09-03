import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/friends/actions.dart';
import '../../api/client/friends/query.dart';
import '../../api/client/users/search.dart';
import '../../api/server/users/search.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../l10n/app_localizations.dart';
import '../../types/messages/friend_request_types.dart'
    show FriendRequest, outgoingPendingIds;
import 'pending_request_card.dart';
import 'use_friend_search.dart';
import 'user_search_card.dart';

/// Shared by Free and Basic — the backend has exactly one tier gate in this
/// whole contract (`suggestedFriends`, MEDIUM+); search and friend-request
/// handling are open to every tier, so both should get real search + a
/// pending-requests view, not an upgrade wall or suggestions-only view.
class FreeFindFriendsContent extends ConsumerWidget {
  final String lang;

  const FreeFindFriendsContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final searchState = ref.watch(friendSearchProvider);
    final searchActions = ref.read(friendSearchProvider.notifier);
    final resultsAsync = ref.watch(searchUsersProvider(searchState.query));
    final requestsAsync = ref.watch(friendRequestsProvider);

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
              ? _buildSearchResults(context, ref, resultsAsync, requestsAsync)
              : _buildRequests(context, ref, requestsAsync),
        ),
      ],
    );
  }

  Widget _buildSearchResults(
    BuildContext context,
    WidgetRef ref,
    AsyncValue<List<UserSearchResult>> resultsAsync,
    AsyncValue<List<FriendRequest>> requestsAsync,
  ) {
    final t = AppLocalizations.of(context);
    final pendingIds = outgoingPendingIds(requestsAsync.asData?.value ?? []);
    return resultsAsync.when(
      loading: () => const Spinner(),
      error: (err, _) => EmptyWidget(
        title: t.findFriendsSearchFailed,
        description: err.toString(),
        icon: Icons.error_outline,
      ),
      data: (users) {
        if (users.isEmpty) {
          return EmptyWidget(
            title: t.findFriendsNoUsersFound,
            description: t.findFriendsSearchDifferentTerm,
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
              isPending: pendingIds.contains(users[i].id),
              onAdd: () =>
                  ref.read(friendActionsProvider).sendRequest(users[i].id),
            ),
          ),
        );
      },
    );
  }

  Widget _buildRequests(
    BuildContext context,
    WidgetRef ref,
    AsyncValue<List<FriendRequest>> requestsAsync,
  ) {
    final t = AppLocalizations.of(context);
    return requestsAsync.when(
      loading: () => const Spinner(),
      error: (err, _) => EmptyWidget(
        title: t.findFriendsFailedToLoadSuggestions,
        description: err.toString(),
        icon: Icons.error_outline,
      ),
      data: (requests) {
        if (requests.isEmpty) {
          return EmptyWidget(
            title: t.findFriendsNoRequests,
            icon: Icons.person_add_disabled,
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: requests.length,
          itemBuilder: (_, i) {
            final req = requests[i];
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: PendingRequestCard(
                request: req,
                onAccept: req.isIncoming
                    ? () => ref
                        .read(friendActionsProvider)
                        .acceptRequest(req.fromUserId)
                    : null,
                onDecline: () => ref
                    .read(friendActionsProvider)
                    .declineRequest(req.fromUserId),
              ),
            );
          },
        );
      },
    );
  }
}
