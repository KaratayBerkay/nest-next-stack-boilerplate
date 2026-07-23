import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/messages/send_message.dart';
import '../../server/messages/mark_read.dart';

import '../../server/messages/accept_friend_request.dart';
import '../../server/messages/decline_friend_request.dart';
import '../../server/messages/send_friend_request.dart';

final messageActionsProvider = Provider((ref) => MessageActions(ref));

class MessageActions {
  final Ref _ref;

  MessageActions(this._ref);

  Future<void> sendMessage(String conversationId, String content) async {
    final server = _ref.read(sendMessageServerProvider);
    await server.call(conversationId, content);
  }

  Future<void> markRead(String conversationId) async {
    final server = _ref.read(markReadServerProvider);
    await server.call(conversationId);
  }

  Future<void> acceptFriendRequest(String requestId) async {
    final server = _ref.read(acceptFriendRequestServerProvider);
    await server.call(requestId);
  }

  Future<void> declineFriendRequest(String requestId) async {
    final server = _ref.read(declineFriendRequestServerProvider);
    await server.call(requestId);
  }

  Future<void> sendFriendRequest(String userId) async {
    final server = _ref.read(sendFriendRequestServerProvider);
    await server.call(userId);
  }
}
