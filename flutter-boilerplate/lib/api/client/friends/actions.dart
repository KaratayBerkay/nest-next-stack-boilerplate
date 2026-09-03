import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/messages/accept_friend_request.dart';
import '../../server/messages/decline_friend_request.dart';
import '../../server/messages/send_friend_request.dart';
import 'query.dart';

final friendActionsProvider = Provider((ref) => FriendActions(ref));

class FriendActions {
  final Ref _ref;

  FriendActions(this._ref);

  Future<void> sendRequest(String userId) async {
    final server = _ref.read(sendFriendRequestServerProvider);
    await server.call(userId);
    _invalidate();
  }

  // Both take the *other user's* id (the backend route is
  // `friends/accept|decline/:userId`), not the FriendRequest row's own id —
  // a prior bug here sent the request id and 404'd on every tap.
  Future<void> acceptRequest(String userId) async {
    final server = _ref.read(acceptFriendRequestServerProvider);
    await server.call(userId);
    _invalidate();
  }

  Future<void> declineRequest(String userId) async {
    final server = _ref.read(declineFriendRequestServerProvider);
    await server.call(userId);
    _invalidate();
  }

  // Mirrors the web's useFriendActions(), which invalidates every
  // `["friends", ...]`-keyed query after each of these three mutations —
  // every friends-shaped list that could change as a result of any of them,
  // not just the one the calling screen happens to render.
  void _invalidate() {
    _ref.invalidate(friendsListProvider);
    _ref.invalidate(friendRequestsProvider);
    _ref.invalidate(suggestedFriendsProvider);
  }
}
