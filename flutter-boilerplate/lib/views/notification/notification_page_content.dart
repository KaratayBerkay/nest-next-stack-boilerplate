import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import '../../lib/date_time.dart';
import '../../components/ui/button/button.dart';
import '../../components/ui/separator/separator.dart';
import '../../types/notification/notification_item.dart';
import 'notification_header.dart';
import 'notification_item.dart';

class _NotificationFilter extends Notifier<String> {
  @override
  String build() => 'all';
  void update(String value) => state = value;
}

final _notificationFilterProvider = NotifierProvider<_NotificationFilter, String>(_NotificationFilter.new);

class NotificationPageContent extends ConsumerWidget {
  final String lang;

  const NotificationPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final filter = ref.watch(_notificationFilterProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
                IconButton(
            icon: Icon(Icons.checklist, color: colors.fgMuted),
            onPressed: () => ref.read(_notificationFilterProvider.notifier).update('all'),
            tooltip: 'Mark all as read',
          ),
          IconButton(
            icon: Icon(Icons.settings, color: colors.fgMuted),
            onPressed: () {},
            tooltip: 'Notification settings',
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: colors.surfaceAlt,
              border: Border(bottom: BorderSide(color: colors.border)),
            ),
            child: Row(
              children: [
                _FilterChip(
                  label: 'All',
                  selected: filter == 'all',
                  onTap: () => ref.read(_notificationFilterProvider.notifier).update('all'),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: 'Unread',
                  selected: filter == 'unread',
                  onTap: () => ref.read(_notificationFilterProvider.notifier).update('unread'),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: 'Mentions',
                  selected: filter == 'mentions',
                  onTap: () => ref.read(_notificationFilterProvider.notifier).update('mentions'),
                ),
                const Spacer(),
                TextButton.icon(
                  onPressed: () {},
                  icon: Icon(Icons.done_all, size: 16, color: colors.brand),
                  label: Text('Mark all read', style: TextStyle(fontSize: 12, color: colors.brand)),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 4),
              itemCount: _sampleNotifications.length,
              separatorBuilder: (_, __) => Separator(margin: const EdgeInsets.symmetric(horizontal: 16)),
              itemBuilder: (_, i) {
                final n = _sampleNotifications[i];
                return NotificationItemWidget(
                  item: n,
                  lang: lang,
                  onTap: () {},
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FilterChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? colors.brand.withOpacity(0.1) : colors.surface,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: selected ? colors.brand : colors.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: selected ? colors.brand : colors.fgMuted,
          ),
        ),
      ),
    );
  }
}

final _sampleNotifications = <NotificationItem>[
  NotificationItem(
    id: '1',
    type: 'welcome',
    title: 'Welcome to the app!',
    body: 'Thanks for joining. We are excited to have you on board. Start exploring the features.',
    createdAt: DateTime.now().subtract(const Duration(minutes: 2)),
    isRead: false,
  ),
  NotificationItem(
    id: '2',
    type: 'feature',
    title: 'New feature available',
    body: 'Dark mode has been released. You can now switch themes in settings.',
    createdAt: DateTime.now().subtract(const Duration(hours: 1)),
    isRead: false,
  ),
  NotificationItem(
    id: '3',
    type: 'security',
    title: 'Security alert',
    body: 'A new login was detected from Chrome on Windows.',
    createdAt: DateTime.now().subtract(const Duration(hours: 5)),
    isRead: true,
  ),
  NotificationItem(
    id: '4',
    type: 'payment',
    title: 'Payment succeeded',
    body: 'Your Premium subscription payment has been processed.',
    createdAt: DateTime.now().subtract(const Duration(days: 1)),
    isRead: true,
  ),
  NotificationItem(
    id: '5',
    type: 'invite',
    title: 'Team invitation',
    body: 'You have been invited to join the Design Team workspace.',
    createdAt: DateTime.now().subtract(const Duration(days: 2)),
    isRead: false,
  ),
  NotificationItem(
    id: '6',
    type: 'storage',
    title: 'Storage limit reached',
    body: 'You have used 90% of your storage. Upgrade to get more space.',
    createdAt: DateTime.now().subtract(const Duration(days: 3)),
    isRead: true,
  ),
];


