import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../lib/tier_view.dart';
import '../../constants/theme.dart';
import '../../api/client/friends/query.dart';
import '../../api/client/friends/actions.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../components/ui/empty/empty.dart';

class FindFriendsRequestsPage extends ConsumerWidget {
  final String lang;

  const FindFriendsRequestsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TierGate(
      freeWidget: Scaffold(
        appBar: AppBar(title: const Text('Friend Requests')),
        body: const Center(child: Text('Upgrade to see friend requests')),
      ),
      basicWidget: _RequestsView(),
      mediumWidget: _RequestsView(),
      premiumWidget: _RequestsView(),
    );
  }
}

class _RequestsView extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final requestsAsync = ref.watch(friendRequestsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Friend Requests')),
      body: requestsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (requests) {
          if (requests.isEmpty) {
            return const EmptyWidget(
              title: 'No pending requests',
              icon: Icons.person_add_disabled,
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: requests.length,
            itemBuilder: (_, i) {
              final req = requests[i];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: Avatar(name: req.fromUserName, radius: 20),
                  title: Text(req.fromUserName),
                  subtitle: Text('Sent ${_timeAgo(req.createdAt)}',
                      style: TextStyle(color: colors.fgMuted, fontSize: 12)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: Icon(Icons.check_circle, color: colors.success),
                        onPressed: () => ref.read(friendActionsProvider).acceptRequest(req.id),
                      ),
                      IconButton(
                        icon: Icon(Icons.cancel, color: colors.danger),
                        onPressed: () => ref.read(friendActionsProvider).declineRequest(req.id),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  String _timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}
