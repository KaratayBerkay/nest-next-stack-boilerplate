import 'package:flutter/foundation.dart';

import '../../api/client/friends/query.dart';
import '../../api/client/messages/mark_read.dart';
import '../../api/client/messages/query.dart';
import '../../api/client/notifications/query.dart';
import '../../api/client/posts/query.dart';
import '../../app_config.dart';
import '../../constants/chat.dart';
import '../../hooks/use_auth.dart';
import '../../hooks/use_messages_page.dart';
import '../riverpod_compat.dart';
import 'realtime_client.dart';

final realtimeStatusProvider =
    StateProvider<RealtimeStatus>((ref) => RealtimeStatus.idle);

/// Live per-room counts, updated from `room-counts` frames — see
/// convert-frontend-7-flutter.md §10 D12.
final roomCountsProvider = StateProvider<Map<String, int>>((ref) => {});

/// Live member list for a given chat room, updated from `user-joined`/
/// `user-left` frames — see convert-frontend-7-flutter.md §10 D12.
final roomMembersProvider =
    StateProvider.family<List<Map<String, String?>>, String>(
  (ref, room) => [],
);

final realtimeProvider = Provider<RealtimeClient>((ref) {
  final onStatus = ref.read(realtimeStatusProvider.notifier);

  final client = RealtimeClient(
    url: AppConfig.wsUrl,
    getTokens: () async {
      if (ref.read(currentUserProvider) == null) return null;
      return ref.read(authProvider.notifier).getAuthTokens();
    },
    onStatusChange: (status) => onStatus.state = status,
    onBustTokenCache: () =>
        ref.read(authProvider.notifier).refreshAccessToken(),
    onFrame: (frame) {
      final renew = frame['renew'] as String?;
      if (renew != null) {
        handleRenewFrame(ref, renew, frame);
      } else {
        handleEventFrame(ref, frame);
      }
    },
  );

  ref.onDispose(() => client.disconnect());

  return client;
});

/// Cache-invalidation signals — every real notification/message/feed/friend
/// push is wrapped this way server-side (`{renew, type, ...}`); see
/// convert-frontend-7-flutter.md §9 for the wire-format audit and §10 D10
/// for why this replaced the old flat `'notification'`/`'feed_update'` cases
/// that never matched anything the backend actually sends.
@visibleForTesting
void handleRenewFrame(Ref ref, String renew, Map<String, dynamic> frame) {
  final subtype = frame['type'] as String?;
  switch (renew) {
    case 'Notifications':
      switch (subtype) {
        case 'Count':
          ref.invalidate(notificationsUnreadCountProvider);
        case 'DmCount':
          ref.invalidate(dmUnreadCountProvider);
          ref.invalidate(dmUnreadNotificationsProvider);
          ref.invalidate(notificationsUnreadCountProvider);
        case 'Item':
          ref.invalidate(notificationsProvider);
        case 'Read':
          ref.invalidate(notificationsProvider);
          ref.invalidate(notificationsUnreadCountProvider);
      }
    case 'Messages':
      if (subtype == 'Conversation') {
        ref.invalidate(conversationsProvider);
      }
    case 'Feed':
      if (subtype == 'New') {
        ref.invalidate(paginatedFeedProvider);
      } else if (subtype == 'Post') {
        ref.invalidate(paginatedFeedProvider);
        final id = frame['id'] as String?;
        if (id != null) {
          ref.invalidate(postProvider(id));
          ref.invalidate(postCommentsProvider(id));
        }
      }
    case 'Friends':
      if (subtype == 'PendingList') {
        ref.invalidate(friendRequestsProvider);
      }
  }
}

/// Flat (non-`renew`) event frames — data payloads for pages that already
/// have the relevant object materialized, not blunt cache invalidation.
@visibleForTesting
void handleEventFrame(Ref ref, Map<String, dynamic> frame) {
  switch (frame['type'] as String?) {
    case 'direct-message':
      ref.invalidate(conversationsProvider);
      final message = frame['message'] as Map<String, dynamic>?;
      final myId = ref.read(currentUserProvider)?.id;
      final peerId = _peerIdFromMessage(message, myId);
      if (peerId != null) {
        ref.invalidate(conversationMessagesProvider(peerId));
      }
      // Mirrors the web's event-dispatch.ts activePeerId check: a message
      // that arrives while its sender's thread is the one currently open in
      // the Messages page is being seen live, so mark it read immediately —
      // without this, messages that arrive while you're already looking at
      // the conversation get rendered (and auto-scrolled to) but never
      // marked read, so the unread badge never clears for them even though
      // you plainly saw them.
      if (message != null &&
          message['recipientId'] == myId &&
          message['senderId'] == ref.read(selectedConversationUserIdProvider)) {
        ref.read(markReadActionsProvider).call(message['senderId'] as String);
      }
    case 'message-read':
    case 'message-delivered':
      ref.invalidate(conversationsProvider);
      final peerId = frame['peerId'] as String?;
      if (peerId != null) {
        ref.invalidate(conversationMessagesProvider(peerId));
      }
    case 'room-message':
      final room = frame['room'] as String?;
      if (room != null) {
        ref.invalidate(roomMessagesProvider(room));
      }
    case 'room-counts':
      final rooms = frame['rooms'];
      if (rooms is Map) {
        ref.read(roomCountsProvider.notifier).state = rooms.map(
          (k, v) => MapEntry(k as String, v as int),
        );
      }
    case 'user-joined':
    case 'user-left':
      final room = frame['room'] as String?;
      final members = frame['members'];
      if (room != null && members is List) {
        ref.read(roomMembersProvider(room).notifier).state =
            members.map((m) => Map<String, String?>.from(m as Map)).toList();
      }
    case 'online-users':
      final users = frame['users'] as List<dynamic>?;
      if (users != null) {
        ref.read(onlineUsersProvider.notifier).state = Set<String>.from(
          users.map((u) => (u as Map<String, dynamic>)['id'] as String),
        );
      }
    case 'user-online':
      final user = frame['user'] as Map<String, dynamic>?;
      final userId = user?['id'] as String?;
      if (userId != null) {
        final current = ref.read(onlineUsersProvider);
        ref.read(onlineUsersProvider.notifier).state = {...current, userId};
      }
    case 'user-offline':
      final userId = frame['userId'] as String?;
      if (userId != null) {
        final current = ref.read(onlineUsersProvider);
        ref.read(onlineUsersProvider.notifier).state = {...current}
          ..remove(userId);
      }
    case 'typing-start':
      final senderId = frame['senderId'] as String?;
      if (senderId != null) {
        final current = Map<String, DateTime>.from(
          ref.read(typingUsersProvider),
        );
        current[senderId] = DateTime.now();
        ref.read(typingUsersProvider.notifier).state = current;
        // Auto-expire after typingTimeout
        Future.delayed(ChatConstants.typingTimeout, () {
          if (!ref.read(typingUsersProvider).containsKey(senderId)) return;
          final still = Map<String, DateTime>.from(
            ref.read(typingUsersProvider),
          );
          final started = still[senderId];
          if (started != null &&
              DateTime.now().difference(started) >=
                  ChatConstants.typingTimeout) {
            still.remove(senderId);
            ref.read(typingUsersProvider.notifier).state = still;
          }
        });
      }
    case 'typing-stop':
      final senderId = frame['senderId'] as String?;
      if (senderId != null) {
        final current = Map<String, DateTime>.from(
          ref.read(typingUsersProvider),
        );
        current.remove(senderId);
        ref.read(typingUsersProvider.notifier).state = current;
      }
  }
}

/// Direct-message frames carry `senderId`/`recipientId`, not a
/// `conversationId` — the peer (whichever side isn't "me") is the key
/// `conversationMessagesProvider` actually queries by (it's a peer-user-id
/// family despite the name — see `conversation_messages.dart`'s `userId`
/// GraphQL variable).
String? _peerIdFromMessage(Map<String, dynamic>? message, String? myId) {
  if (message == null || myId == null) return null;
  final senderId = message['senderId'] as String?;
  final recipientId = message['recipientId'] as String?;
  return senderId == myId ? recipientId : senderId;
}

final realtimeConnectedProvider = Provider<bool>((ref) {
  final status = ref.watch(realtimeStatusProvider);
  return status == RealtimeStatus.open;
});

/// Set of user IDs that are currently online, maintained from realtime
/// `online-users`, `user-online`, and `user-offline` events — mirrors the
/// web's `usePresence()` hook.
final onlineUsersProvider = StateProvider<Set<String>>((ref) => <String>{});

/// Map of user IDs currently typing to the timestamp when they started.
/// Entries auto-expire after [ChatConstants.typingTimeout].
final typingUsersProvider =
    StateProvider<Map<String, DateTime>>((ref) => <String, DateTime>{});
