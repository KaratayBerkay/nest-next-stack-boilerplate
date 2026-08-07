import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/friends/query.dart';
import '../../api/server/messages/friends.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../components/ui/badge/badge.dart';
import '../../components/ui/button/button.dart';
import '../../components/ui/card/card.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../constants/theme.dart';
import '../../hooks/use_messages_page.dart';
import '../../l10n/app_localizations.dart';

/// Mirrors next-js-boilerplate's `views/friends/FriendsPageContent.tsx` —
/// same content for every tier (Basic/Medium/Premium re-export FreePageView
/// on web), so there's a single content widget rather than per-tier ones.
class FriendsPageContent extends ConsumerWidget {
  final String lang;

  const FriendsPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    final friendsAsync = ref.watch(friendsListProvider);

    return friendsAsync.when(
      loading: () => const Center(child: Spinner()),
      error: (err, _) => Center(child: Text('$err')),
      data: (friends) {
        if (friends.isEmpty) {
          return Padding(
            padding: const EdgeInsets.all(24),
            child: EmptyWidget(
              icon: Icons.people_outline,
              title: t.friendsNoFriends,
              description: t.friendsNoFriendsDescription,
              action: Button(
                onPressed: () => context.go('/v1/$lang/find-friends'),
                child: Text(t.friendsFindFriends),
              ),
            ),
          );
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    t.friendsTitle,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Button(
                    variant: ButtonVariant.outline,
                    size: ButtonSize.sm,
                    onPressed: () => context.go('/v1/$lang/find-friends'),
                    child: Text(t.friendsFindFriends),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              CardWidget(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    for (var i = 0; i < friends.length; i++) ...[
                      if (i > 0) Divider(height: 1, color: colors.border),
                      _FriendRow(friend: friends[i], lang: lang),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _FriendRow extends ConsumerWidget {
  final Friend friend;
  final String lang;

  const _FriendRow({required this.friend, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final colors = AppColors.of(context);
    // The backend always sends a real name or falls it back to the email
    // (see Friend.fromJson) — a second, distinct email line is only useful
    // when it says something the name doesn't already say.
    final showEmail = friend.email != friend.name;

    return InkWell(
      onTap: () {
        ref.read(selectedConversationUserIdProvider.notifier).state = friend.id;
        context.go('/v1/$lang/messages');
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Avatar(name: friend.name),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    friend.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (showEmail)
                    Text(
                      friend.email,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 12, color: colors.fgMuted),
                    ),
                ],
              ),
            ),
            Badge(text: t.friendsMessage, variant: BadgeVariant.secondary),
          ],
        ),
      ),
    );
  }
}
