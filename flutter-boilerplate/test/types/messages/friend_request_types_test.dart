import 'package:flutter_boilerplate/types/messages/friend_request_types.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  FriendRequest makeRequest({
    required String id,
    required String fromUserId,
    required String direction,
  }) {
    return FriendRequest(
      id: id,
      fromUserId: fromUserId,
      fromUserName: 'User $fromUserId',
      direction: direction,
      createdAt: DateTime.utc(2026),
    );
  }

  group('outgoingPendingIds', () {
    test('keeps only the user ids of outgoing requests', () {
      final requests = [
        makeRequest(id: 'r1', fromUserId: 'a', direction: 'outgoing'),
        makeRequest(id: 'r2', fromUserId: 'b', direction: 'incoming'),
        makeRequest(id: 'r3', fromUserId: 'c', direction: 'outgoing'),
      ];

      expect(outgoingPendingIds(requests), {'a', 'c'});
    });

    // Regression: an incoming request (someone else asked *me*) previously
    // got mixed into the "already sent" set, mislabeling that person as
    // pending in search results even though I never sent them anything.
    test('excludes incoming requests', () {
      final requests = [
        makeRequest(id: 'r1', fromUserId: 'a', direction: 'incoming'),
      ];

      expect(outgoingPendingIds(requests), isEmpty);
    });

    test('returns an empty set for no requests', () {
      expect(outgoingPendingIds(const []), isEmpty);
    });
  });
}
