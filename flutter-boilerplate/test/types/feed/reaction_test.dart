import 'package:flutter_boilerplate/types/feed/reaction.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('FeedReaction.fromJson', () {
    test('parses type and userId', () {
      final json = {
        'id': 'reaction-1',
        'type': 'LIKE',
        'userId': 'user-1',
      };
      final reaction = FeedReaction.fromJson(json);
      expect(reaction.type, 'LIKE');
      expect(reaction.userId, 'user-1');
    });

    test('parses different reaction types', () {
      final json = {
        'id': 'reaction-2',
        'type': 'LOVE',
        'userId': 'user-2',
      };
      final reaction = FeedReaction.fromJson(json);
      expect(reaction.type, 'LOVE');
    });
  });
}
