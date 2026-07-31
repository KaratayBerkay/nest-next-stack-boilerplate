import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/date_time.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/messages/query.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../constants/theme.dart';
import '../../hooks/use_messages_page.dart';
import '../../l10n/app_localizations.dart';
import 'online_avatar.dart';

class MessagesSidebarConversations extends ConsumerWidget {
  final String searchQuery;

  const MessagesSidebarConversations({
    super.key,
    this.searchQuery = '',
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final convAsync = ref.watch(conversationsProvider);
    final selectedUserId = ref.watch(selectedConversationUserIdProvider);
    final t = AppLocalizations.of(context);

    return convAsync.when(
      loading: () => const Spinner(),
      error: (_, __) => Center(child: Text(t.messagesFailedToLoad)),
      data: (convs) {
        final filtered = searchQuery.isEmpty
            ? convs
            : convs
                .where(
                  (c) =>
                      c.userName
                          .toLowerCase()
                          .contains(searchQuery.toLowerCase()) ||
                      (c.lastMessage
                              ?.toLowerCase()
                              .contains(searchQuery.toLowerCase()) ??
                          false),
                )
                .toList();

        if (filtered.isEmpty) {
          return EmptyWidget(
            title: t.messagesNoConversations,
            icon: Icons.forum_outlined,
          );
        }

        return ListView.separated(
          itemCount: filtered.length,
          separatorBuilder: (_, __) => Divider(height: 1, color: colors.border),
          itemBuilder: (_, i) {
            final conv = filtered[i];
            final isSelected = selectedUserId == conv.id;
            return InkWell(
              onTap: () => ref
                  .read(selectedConversationUserIdProvider.notifier)
                  .state = conv.id,
              child: Container(
                color: isSelected ? colors.brand.withValues(alpha: 0.1) : null,
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Row(
                  children: [
                    OnlineAvatar(
                      imageUrl: conv.userAvatarUrl,
                      name: conv.userName,
                      userId: conv.id,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  conv.userName,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                              if (conv.lastMessageAt != null)
                                Text(
                                  DateTimeHelper.relative(conv.lastMessageAt!),
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: colors.fgMuted,
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  conv.lastMessage ?? t.messagesNoMessages,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: conv.unreadCount > 0
                                        ? colors.fg
                                        : colors.fgMuted,
                                    fontWeight: conv.unreadCount > 0
                                        ? FontWeight.w500
                                        : FontWeight.normal,
                                  ),
                                ),
                              ),
                              if (conv.unreadCount > 0)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: colors.brand,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    '${conv.unreadCount}',
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: colors.surface,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                            ],
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
