import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../server/friends/suggested.dart';
import '../../server/messages/friends.dart';
import '../../server/messages/friend_requests.dart';

final suggestedFriendsProvider = FutureProvider((ref) async {
  final server = ref.read(suggestedFriendsServerProvider);
  return server.call();
});

final friendsListProvider = FutureProvider((ref) async {
  final server = ref.read(friendsListServerProvider);
  return server.call();
});

final friendRequestsProvider = FutureProvider((ref) async {
  final server = ref.read(friendRequestsServerProvider);
  return server.call();
});
