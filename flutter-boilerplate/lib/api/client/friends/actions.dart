import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/messages/accept_friend_request.dart';
import '../../server/messages/decline_friend_request.dart';
import '../../server/messages/send_friend_request.dart';

final friendActionsProvider = Provider((ref) => FriendActions(ref));

class FriendActions {
  final Ref _ref;

  FriendActions(this._ref);

  Future<void> sendRequest(String userId) async {
    final server = _ref.read(sendFriendRequestServerProvider);
    await server.call(userId);
  }

  Future<void> acceptRequest(String requestId) async {
    final server = _ref.read(acceptFriendRequestServerProvider);
    await server.call(requestId);
  }

  Future<void> declineRequest(String requestId) async {
    final server = _ref.read(declineFriendRequestServerProvider);
    await server.call(requestId);
  }
}
