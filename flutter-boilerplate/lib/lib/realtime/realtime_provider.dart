import 'package:flutter/material.dart';

import '../../api/client/friends/query.dart';
import '../../api/client/messages/mark_read.dart';
import '../../api/client/messages/query.dart';
import '../../api/client/notifications/query.dart';
import '../../api/client/posts/query.dart';
import '../../api/client/rtc/meetings_chat_live.dart';
import '../../api/client/rtc/query.dart';
import '../../api/server/crypto/handshake.dart';
import '../../api/server/crypto/re_key.dart';
import '../../api/server/messages/room_messages.dart';
import '../../app/router.dart';
import '../../app_config.dart';
import '../../constants/chat.dart';
import '../../hooks/use_auth.dart';
import '../../hooks/use_messages_page.dart';
import '../../types/messages/message.dart';
import '../../types/notification/notification_item.dart';
import '../../types/rtc/meeting.dart';
import '../riverpod_compat.dart';
import '../rtc/meeting_signal.dart';
import '../rtc/rtc_call_provider.dart';
import '../rtc/rtc_call_state.dart';
import 'realtime_client.dart';
import 'route_claim.dart';

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

/// Data backing the transient "new message" banner shown just under the
/// header for ~3s when a DM or room message arrives while the user isn't
/// already looking at that conversation — mirrors the web's
/// `useHeaderMessageBanner` hook. `body`/`hasAttachments` are raw (no
/// decryption-failure copy resolved here) — the widget resolves display text
/// since it's the one with access to `AppLocalizations`.
class HeaderMessageBannerData {
  final String id;
  final String senderName;
  final String body;
  final bool hasAttachments;
  final String? avatarUrl;
  final bool isRoom;
  final String targetId;

  const HeaderMessageBannerData({
    required this.id,
    required this.senderName,
    required this.body,
    required this.hasAttachments,
    required this.avatarUrl,
    required this.isRoom,
    required this.targetId,
  });
}

final headerMessageBannerProvider =
    StateProvider<HeaderMessageBannerData?>((ref) => null);

final realtimeProvider = Provider<RealtimeClient>((ref) {
  final onStatus = ref.read(realtimeStatusProvider.notifier);

  final client = RealtimeClient(
    url: AppConfig.wsUrl,
    getTokens: () async {
      if (ref.read(currentUserProvider) == null) return null;
      return ref.read(authProvider.notifier).getAuthTokens();
    },
    // client.disconnect() (below, via ref.onDispose) fires during
    // ProviderContainer teardown, where dispose order isn't guaranteed to
    // leave realtimeStatusProvider's own controller alive — guard against
    // "Bad state: Tried to use StateController after dispose was called."
    onStatusChange: (status) {
      if (onStatus.mounted) onStatus.state = status;
    },
    onBustTokenCache: () =>
        ref.read(authProvider.notifier).refreshAccessToken(),
    handshake: (publicKeyHex) =>
        ref.read(cryptoHandshakeServerProvider).call(publicKeyHex),
    requestReKey: () => ref.read(cryptoReKeyServerProvider).call(),
    onAuthenticated: () => resyncAfterConnect(ref),
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

/// Catches up on data that could have gone stale during a connection gap —
/// a WS push missed while disconnected has no other retry path, so nothing
/// else refetches on its own once the socket comes back. Runs on every
/// `authenticated` frame (the first connect AND every reconnect). Mirrors
/// web's `resyncAfterConnect` (lib/realtime/resync.ts), wired the same way
/// to `RealtimeClient.onAuthenticated`.
@visibleForTesting
void resyncAfterConnect(Ref ref) {
  ref.invalidate(conversationsProvider);
  ref.invalidate(friendsListProvider);
  ref.invalidate(notificationsProvider);
  ref.invalidate(notificationsUnreadCountProvider);
  ref.invalidate(dmUnreadNotificationsProvider);
  // Recovers a ringing/connected call whose point-in-time rtc:invite/
  // rtc:accepted push landed during the connection gap.
  ref.invalidate(activeCallProvider);

  final uri = ref.read(routerProvider).routerDelegate.currentConfiguration.uri;
  final claim = routeToPageClaim(uri);
  switch (claim.page) {
    case 'feed':
      ref.invalidate(feedProvider);
    case 'post':
      final id = claim.params?['id'];
      if (id != null) ref.invalidate(postProvider(id));
    case 'messages':
      // Flutter's messages claim carries no peer param (routeToPageClaim's
      // web-mirrored `?user=` deep-link only seeds initial state) — the
      // open conversation lives in this provider regardless of how it got
      // selected (deep link vs. sidebar tap), so read it directly instead.
      final peer = ref.read(selectedConversationUserIdProvider);
      if (peer != null) ref.invalidate(conversationMessagesProvider(peer));
    case 'chat-room':
      final room = claim.params?['room'];
      if (room != null) ref.invalidate(roomMessagesProvider(room));
  }
}

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
          final item = frame['item'] as Map<String, dynamic>?;
          if (item != null && ref.exists(notificationsProvider)) {
            ref
                .read(notificationsProvider.notifier)
                .prependLive(NotificationItem.fromJson(item));
          }
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
      ref.invalidate(friendsListProvider);
  }
}

/// Flat (non-`renew`) event frames — data payloads for pages that already
/// have the relevant object materialized, not blunt cache invalidation.
@visibleForTesting
void handleEventFrame(Ref ref, Map<String, dynamic> frame) {
  switch (frame['type'] as String?) {
    case 'error':
      // Two backend shapes reach here (auth-failure error frames are
      // intercepted earlier in RealtimeClient.handleMessage and never make
      // it to onFrame): sendWsError's {msg, exc, key} for watch/page-claim
      // validation, and the messaging gateway's {message} for chat-level
      // rejections (e.g. VIP-tier room access) — without this case both
      // vanished with zero user feedback.
      final text = (frame['message'] ?? frame['msg']) as String?;
      _showRealtimeError(ref, text);
    case 'rtc:ringing':
      final callId = frame['callId'] as String?;
      if (callId != null) ref.read(rtcCallProvider.notifier).onRinging(callId);
    case 'rtc:invite':
      final callId = frame['callId'] as String?;
      final callerId = frame['callerId'] as String?;
      if (callId != null && callerId != null) {
        ref.read(rtcCallProvider.notifier).onIncoming(
              callId,
              RtcCallPeer(
                id: callerId,
                name: frame['callerName'] as String? ?? '',
                avatarUrl: frame['callerAvatarUrl'] as String?,
              ),
              frame['hasVideo'] as bool? ?? false,
            );
      }
    case 'rtc:accepted':
      final callId = frame['callId'] as String?;
      final token = frame['token'] as String?;
      final roomName = frame['roomName'] as String?;
      if (callId != null && token != null && roomName != null) {
        ref.read(rtcCallProvider.notifier).onAccepted(
              callId,
              token,
              roomName,
              (frame['maxDurationMinutes'] as num?)?.toInt(),
            );
      }
    case 'rtc:rejected':
    case 'rtc:cancelled':
    case 'rtc:hangup':
    case 'rtc:missed':
      final callId = frame['callId'] as String?;
      if (callId != null) ref.read(rtcCallProvider.notifier).onEnded(callId);
    case 'rtc:call-limit-warning':
      final callId = frame['callId'] as String?;
      final seconds = (frame['secondsRemaining'] as num?)?.toInt();
      if (callId != null && seconds != null) {
        ref.read(rtcCallProvider.notifier).onWarning(callId, seconds);
      }
    case 'rtc:error':
      ref.read(rtcCallProvider.notifier).onCallError(
            frame['callId'] as String?,
            frame['reason'] as String? ?? 'error',
          );
    case 'rtc:chat-message':
      final slug = frame['slug'] as String?;
      final message = frame['message'] as Map<String, dynamic>?;
      // Only patch an already-instantiated provider — same guard as
      // room-message's equivalent case (the meeting room page isn't
      // necessarily mounted for every rtc:chat-message this client relays).
      if (slug != null &&
          message != null &&
          ref.exists(meetingChatProvider(slug))) {
        ref
            .read(meetingChatProvider(slug).notifier)
            .appendLive(MeetingChatMessage.fromJson(message));
      }
    case 'rtc:meeting-participant-joined':
      final slug = frame['slug'] as String?;
      final joinedUserId = frame['userId'] as String?;
      final myMeetingUserId = ref.read(currentUserProvider)?.id;
      if (slug != null &&
          joinedUserId != myMeetingUserId &&
          ref.exists(meetingSignalProvider(slug))) {
        ref
            .read(meetingSignalProvider(slug).notifier)
            .participantJoined(frame['name'] as String? ?? '');
      }
    case 'rtc:meeting-ended':
      final slug = frame['slug'] as String?;
      if (slug != null && ref.exists(meetingSignalProvider(slug))) {
        ref.read(meetingSignalProvider(slug).notifier).ended();
      }
    case 'rtc:meeting-removed':
      final slug = frame['slug'] as String?;
      if (slug != null && ref.exists(meetingSignalProvider(slug))) {
        ref.read(meetingSignalProvider(slug).notifier).removed();
      }
    case 'rtc:meeting-force-muted':
      final slug = frame['slug'] as String?;
      final muted = frame['muted'] as bool? ?? false;
      if (slug != null && muted && ref.exists(meetingSignalProvider(slug))) {
        ref.read(meetingSignalProvider(slug).notifier).forceMuted();
      }
    case 'rtc:meeting-limit-warning':
      final slug = frame['slug'] as String?;
      final meetingWarningSeconds =
          (frame['secondsRemaining'] as num?)?.toInt();
      if (slug != null &&
          meetingWarningSeconds != null &&
          ref.exists(meetingSignalProvider(slug))) {
        ref
            .read(meetingSignalProvider(slug).notifier)
            .warning(meetingWarningSeconds);
      }
    case 'direct-message':
      ref.invalidate(conversationsProvider);
      final message = frame['message'] as Map<String, dynamic>?;
      final myId = ref.read(currentUserProvider)?.id;
      final peerId = _peerIdFromMessage(message, myId);
      // Only patch an already-instantiated provider — reading `.notifier`
      // unconditionally would lazily create (and fetch page 1 for) every
      // peer you've ever messaged, not just the one you're viewing.
      if (peerId != null &&
          message != null &&
          ref.exists(conversationMessagesProvider(peerId))) {
        ref
            .read(conversationMessagesProvider(peerId).notifier)
            .appendLive(ChatMessage.fromWireJson(message));
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
      // Header "new message" banner — skip the sender's own echo and skip
      // when the sender's thread is the one already open (that case is
      // handled live by the mark-read branch above instead).
      final senderId = message?['senderId'] as String?;
      if (senderId != null && senderId != myId) {
        final claim = _activePageClaim(ref);
        final alreadyOpen = claim.page == 'messages' &&
            ref.read(selectedConversationUserIdProvider) == senderId;
        if (!alreadyOpen) {
          final sender = message?['sender'] as Map<String, dynamic>?;
          final body = message?['body'];
          final attachments = message?['attachments'];
          _showHeaderMessageBanner(
            ref,
            HeaderMessageBannerData(
              id: message?['id'] as String? ?? senderId,
              senderName: (sender?['name'] as String?) ??
                  (sender?['email'] as String?) ??
                  '',
              body: body is String ? body : '',
              hasAttachments: attachments is List && attachments.isNotEmpty,
              avatarUrl: sender?['avatarUrl'] as String?,
              isRoom: false,
              targetId: senderId,
            ),
          );
        }
      }
    case 'message-read':
    case 'message-delivered':
      ref.invalidate(conversationsProvider);
      final peerId = frame['peerId'] as String?;
      if (peerId != null) {
        ref.invalidate(conversationMessagesProvider(peerId));
      }
    case 'message-deleted':
      ref.invalidate(conversationsProvider);
      // scope "me": peerId rides directly on the frame (a sync frame to the
      // actor's own other devices, not a peer-facing broadcast). scope
      // "everyone": the frame carries absolute senderId/recipientId (flat,
      // not nested under "message" like direct-message), so derive it the
      // same way _peerIdFromMessage does.
      final myId = ref.read(currentUserProvider)?.id;
      final deletePeerId = frame['scope'] == 'me'
          ? frame['peerId'] as String?
          : _peerIdFromMessage(frame, myId);
      if (deletePeerId != null) {
        ref.invalidate(conversationMessagesProvider(deletePeerId));
      }
    case 'room-message':
      final room = frame['room'] as String?;
      final roomMessage = frame['message'] as Map<String, dynamic>?;
      // Only patch an already-instantiated provider — see the equivalent
      // guard in the direct-message case above.
      if (room != null &&
          roomMessage != null &&
          ref.exists(roomMessagesProvider(room))) {
        ref
            .read(roomMessagesProvider(room).notifier)
            .appendLive(RoomMessage.fromJson(roomMessage));
      }
      final roomSenderId = roomMessage?['senderId'] as String?;
      final myRoomUserId = ref.read(currentUserProvider)?.id;
      if (room != null &&
          roomSenderId != null &&
          roomSenderId != myRoomUserId) {
        final claim = _activePageClaim(ref);
        final alreadyOpen =
            claim.page == 'chat-room' && claim.params?['room'] == room;
        if (!alreadyOpen) {
          final body = roomMessage?['body'];
          final attachments = roomMessage?['attachments'];
          _showHeaderMessageBanner(
            ref,
            HeaderMessageBannerData(
              id: roomMessage?['id'] as String? ?? '$room-$roomSenderId',
              senderName: roomMessage?['senderName'] as String? ?? '',
              body: body is String ? body : '',
              hasAttachments: attachments is List && attachments.isNotEmpty,
              avatarUrl: null,
              isRoom: true,
              targetId: room,
            ),
          );
        }
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

void _showHeaderMessageBanner(Ref ref, HeaderMessageBannerData data) {
  ref.read(headerMessageBannerProvider.notifier).state = data;
  Future.delayed(const Duration(seconds: 3), () {
    if (ref.read(headerMessageBannerProvider)?.id == data.id) {
      ref.read(headerMessageBannerProvider.notifier).state = null;
    }
  });
}

PageClaim _activePageClaim(Ref ref) {
  final uri = ref.read(routerProvider).routerDelegate.currentConfiguration.uri;
  return routeToPageClaim(uri);
}

void _showRealtimeError(Ref ref, String? text) {
  final context =
      ref.read(routerProvider).routerDelegate.navigatorKey.currentContext;
  if (context == null || !context.mounted) return;
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(text ?? 'Something went wrong'),
      backgroundColor: Colors.red,
    ),
  );
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
