import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/friends/actions.dart';
import '../../api/server/friends/suggested.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../constants/theme.dart';

class SuggestedFriendsPanel extends ConsumerWidget {
  final AsyncValue<List<SuggestedUser>> suggestedAsync;
  final String lang;

  const SuggestedFriendsPanel({
    super.key,
    required this.suggestedAsync,
    required this.lang,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);

    return suggestedAsync.when(
      loading: () => const Spinner(),
      error: (err, _) => EmptyWidget(
        title: 'Failed to load suggestions',
        description: err.toString(),
        icon: Icons.error_outline,
      ),
      data: (users) {
        if (users.isEmpty) {
          return const EmptyWidget(
            title: 'No suggestions yet',
            description: 'Follow more people to get suggestions.',
            icon: Icons.people_outline,
          );
        }
        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: users.length,
          itemBuilder: (_, i) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: Avatar(
                name: users[i].name,
                imageUrl: users[i].avatarUrl,
              ),
              title: Text(users[i].name),
              subtitle: Text(
                '${users[i].mutualFriends} mutual friends',
                style: TextStyle(color: colors.fgMuted, fontSize: 12),
              ),
              trailing: FilledButton.tonal(
                onPressed: () => ref.read(friendActionsProvider).sendRequest(users[i].id),
                child: const Text('Add Friend'),
              ),
            ),
          ),
        );
      },
    );
  }
}
