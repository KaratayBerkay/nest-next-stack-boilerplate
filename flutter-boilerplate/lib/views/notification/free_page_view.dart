import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/notifications/actions.dart';
import '../../api/client/notifications/query.dart';
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
    final notifAsync = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: AppBar(title: Text(t.notificationHeading)),
      body: notifAsync.when(
        loading: () => const Spinner(),
        error: (_, __) => EmptyWidget(
          title: t.notificationLoadFailed,
          icon: Icons.error_outline,
        ),
        data: (items) {
          if (items.isEmpty) {
            return EmptyWidget(
              title: t.notificationNoNotifications,
              description: t.notificationAllCaughtUp,
              icon: Icons.notifications_off_outlined,
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(notificationsProvider.future),
            child: ListView.separated(
              itemCount: items.length,
              separatorBuilder: (_, __) =>
                  Divider(height: 1, color: colors.border, indent: 72),
              itemBuilder: (_, i) {
                final item = items[i];
                return NotificationItemWidget(
                  item: item,
                  lang: lang,
                  onTap: () {
                    if (!item.isRead) {
                      ref.read(notificationActionsProvider).markRead(item.id);
                      ref.invalidate(notificationsProvider);
                    }
                    if (item.type == 'message') {
                      context.push('/v1/$lang/messages');
                    } else if (item.type == 'friend_request') {
                      context.push('/v1/$lang/find-friends/requests');
                    } else if (item.type == 'post') {
                      context.push('/v1/$lang/posts/${item.id}');
                    }
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}
