import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/notifications/actions.dart';
import '../../api/client/notifications/query.dart';
import '../../components/ui/button/button.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import 'notification_item.dart';

class FreeNotificationPage extends ConsumerWidget {
  final String lang;

  const FreeNotificationPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final notifState = ref.watch(notificationsProvider);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 8, 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                t.notificationHeading,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              TextButton(
                onPressed: () async {
                  try {
                    await ref.read(notificationActionsProvider).markAllRead();
                    ref.invalidate(notificationsProvider);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('All marked as read')),
                      );
                    }
                  } catch (_) {}
                },
                child: const Text('Mark all read'),
              ),
            ],
          ),
        ),
        Expanded(
          child: notifState.isInitialLoading
              ? const Spinner()
              : notifState.error != null
                  ? EmptyWidget(
                      title: t.notificationLoadFailed,
                      icon: Icons.error_outline,
                    )
                  : notifState.items.isEmpty
                      ? EmptyWidget(
                          title: t.notificationNoNotifications,
                          description: t.notificationAllCaughtUp,
                          icon: Icons.notifications_off_outlined,
                        )
                      : RefreshIndicator(
                          onRefresh: () => ref
                              .read(notificationsProvider.notifier)
                              .refresh(),
                          child: ListView.separated(
                            itemCount: notifState.items.length +
                                (notifState.hasMore ? 1 : 0),
                            separatorBuilder: (_, __) => Divider(
                              height: 1,
                              color: colors.border,
                              indent: 72,
                            ),
                            itemBuilder: (_, i) {
                              if (notifState.hasMore &&
                                  i == notifState.items.length) {
                                return Padding(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                  ),
                                  child: Center(
                                    child: Button(
                                      variant: ButtonVariant.secondary,
                                      size: ButtonSize.sm,
                                      loading: notifState.isLoadingMore,
                                      onPressed: () => ref
                                          .read(notificationsProvider.notifier)
                                          .loadMore(),
                                      child: Text(t.notificationLoadMore),
                                    ),
                                  ),
                                );
                              }
                              final item = notifState.items[i];
                              final payload = item.payload;
                              final kind = payload?['kind'] as String?;
                              final postId = payload?['postId'] as String?;
                              final slug = payload?['slug'] as String?;
                              return NotificationItemWidget(
                                item: item,
                                lang: lang,
                                onTap: () {
                                  if (!item.isRead) {
                                    ref
                                        .read(notificationActionsProvider)
                                        .markRead(item.id);
                                    ref.invalidate(notificationsProvider);
                                  }
                                  final target = () {
                                    if (kind == 'friend-request' ||
                                        kind == 'friend-accepted') {
                                      return '/v1/$lang/find-friends/requests';
                                    }
                                    if (kind == 'rtc-missed-call') {
                                      return '/v1/$lang/rtc/calls';
                                    }
                                    if (kind == 'rtc-meeting-invite' &&
                                        slug != null) {
                                      return '/v1/$lang/rtc/meetings/$slug';
                                    }
                                    if (kind == 'rtc-stream-live' &&
                                        slug != null) {
                                      return '/v1/$lang/rtc/live/$slug';
                                    }
                                    if (postId != null) {
                                      return '/v1/$lang/posts/$postId';
                                    }
                                    return null;
                                  }();
                                  if (target != null) {
                                    context.push(target);
                                  }
                                },
                              );
                            },
                          ),
                        ),
        ),
      ],
    );
  }
}
