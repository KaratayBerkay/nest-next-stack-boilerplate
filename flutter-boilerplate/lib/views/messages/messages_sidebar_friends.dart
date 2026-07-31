import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/friends/query.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../constants/theme.dart';
import '../../hooks/use_messages_page.dart';
import '../../l10n/app_localizations.dart';
import 'online_avatar.dart';

class MessagesSidebarFriends extends ConsumerWidget {
  final String searchQuery;

  const MessagesSidebarFriends({super.key, this.searchQuery = ''});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final friendsAsync = ref.watch(friendsListProvider);
    final selectedUserId = ref.watch(selectedConversationUserIdProvider);
    final onlineUsers = ref.watch(onlineUsersProvider);
    final t = AppLocalizations.of(context);

    return friendsAsync.when(
      loading: () => const Spinner(),
      error: (_, __) => Center(child: Text(t.messagesFailedToLoad)),
      data: (friends) {
        final filtered = searchQuery.isEmpty
            ? friends
            : friends
                .where(
                  (f) =>
                      f.name.toLowerCase().contains(searchQuery.toLowerCase()),
                )
                .toList();

        if (filtered.isEmpty) {
          return EmptyWidget(
            title: t.messagesNoFriends,
            icon: Icons.people_outline,
          );
        }

        return ListView.separated(
          itemCount: filtered.length,
          separatorBuilder: (_, __) => Divider(height: 1, color: colors.border),
          itemBuilder: (_, i) {
            final friend = filtered[i];
            final isSelected = selectedUserId == friend.id;
            return InkWell(
              onTap: () => ref
                  .read(selectedConversationUserIdProvider.notifier)
                  .state = friend.id,
              child: Container(
                color: isSelected ? colors.brand.withValues(alpha: 0.1) : null,
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Row(
                  children: [
                    OnlineAvatar(
                      imageUrl: friend.avatarUrl,
                      name: friend.name,
                      userId: friend.id,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            friend.name,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            onlineUsers.contains(friend.id)
                                ? 'Online'
                                : 'Offline',
                            style: TextStyle(
                              fontSize: 12,
                              color: colors.fgMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
