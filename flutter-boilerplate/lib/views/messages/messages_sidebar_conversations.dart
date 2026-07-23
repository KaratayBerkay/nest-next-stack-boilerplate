import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';
import '../../api/client/messages/query.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../components/ui/empty/empty.dart';
import '../../lib/date_time.dart';

class MessagesSidebarConversations extends ConsumerWidget {
  final String lang;
  final String searchQuery;

  const MessagesSidebarConversations({
    super.key,
    required this.lang,
    this.searchQuery = '',
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final convAsync = ref.watch(conversationsProvider);

    return convAsync.when(
      loading: () => const Spinner(),
      error: (_, __) => const Center(child: Text('Failed to load')),
      data: (convs) {
        final filtered = searchQuery.isEmpty
            ? convs
            : convs.where((c) =>
                c.userName.toLowerCase().contains(searchQuery.toLowerCase()) ||
                (c.lastMessage?.toLowerCase().contains(searchQuery.toLowerCase()) ?? false),
              ).toList();

        if (filtered.isEmpty) {
          return const EmptyWidget(
            title: 'No conversations',
            icon: Icons.forum_outlined,
          );
        }

        return ListView.separated(
          itemCount: filtered.length,
          separatorBuilder: (_, __) => Divider(height: 1, color: colors.border),
          itemBuilder: (_, i) {
            final conv = filtered[i];
            return InkWell(
              onTap: () => context.push('/v1/$lang/chat/${conv.id}'),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Row(
                  children: [
                    Avatar(
                      imageUrl: conv.userAvatarUrl,
                      name: conv.userName,
                      radius: 20,
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
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                ),
                              ),
                              if (conv.lastMessageAt != null)
                                Text(
                                  DateTimeHelper.relative(conv.lastMessageAt!),
                                  style: TextStyle(fontSize: 11, color: colors.fgMuted),
                                ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  conv.lastMessage ?? 'No messages yet',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: conv.unreadCount > 0 ? colors.fg : colors.fgMuted,
                                    fontWeight: conv.unreadCount > 0 ? FontWeight.w500 : FontWeight.normal,
                                  ),
                                ),
                              ),
                              if (conv.unreadCount > 0)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
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
