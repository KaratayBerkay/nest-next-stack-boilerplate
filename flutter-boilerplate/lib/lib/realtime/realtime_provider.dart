import '../riverpod_compat.dart';

import '../../api/client/messages/query.dart';
import '../../api/client/notifications/query.dart';
import '../../api/client/posts/query.dart';
import '../../app_config.dart';
import '../../hooks/use_auth.dart';
import 'realtime_client.dart';

final realtimeStatusProvider = StateProvider<RealtimeStatus>((ref) => RealtimeStatus.idle);

final realtimeProvider = Provider<RealtimeClient>((ref) {
  final onStatus = ref.read(realtimeStatusProvider.notifier);

  final client = RealtimeClient(
    url: AppConfig.wsUrl,
    getTokens: () async {
      final user = ref.read(currentUserProvider);
      if (user == null) return null;
      return {'userId': user.id, 'tier': user.tier};
    },
    onStatusChange: (status) => onStatus.state = status,
    onFrame: (frame) {
      final type = frame['type'] as String?;
      switch (type) {
        case 'new_message':
        case 'direct-message':
          ref.invalidate(conversationsProvider);
          final conversationId = frame['conversationId'] as String?;
          if (conversationId != null) {
            ref.invalidate(conversationMessagesProvider(conversationId));
          }
        case 'message-read':
          ref.invalidate(conversationsProvider);
        case 'notification':
          ref.invalidate(notificationsProvider);
          ref.invalidate(notificationsUnreadCountProvider);
        case 'feed_update':
          ref.invalidate(feedProvider);
      }
    },
  );

  ref.onDispose(() => client.disconnect());

  return client;
});

final realtimeConnectedProvider = Provider<bool>((ref) {
  final status = ref.watch(realtimeStatusProvider);
  return status == RealtimeStatus.open;
});
