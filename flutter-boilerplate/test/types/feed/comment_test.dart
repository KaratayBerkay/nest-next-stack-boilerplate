import 'package:flutter_boilerplate/types/feed/comment.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Comment.fromJson', () {
    test('parses all fields', () {
      final json = {
        'id': 'comment-1',
        'postId': 'post-1',
        'authorName': 'Alice',
        'authorAvatarUrl': 'https://example.com/avatar.png',
        'authorId': 'user-1',
        'authorEmail': 'alice@example.com',
        'body': 'Great post!',
        'createdAt': '2024-03-15T10:30:00.000Z',
        'parentId': null,
        'reactions': <dynamic>[
          <String, dynamic>{'id': 'r1', 'type': 'LIKE', 'userId': 'user-2'},
        ],
      };
      final comment = Comment.fromJson(json);
      expect(comment.id, 'comment-1');
      expect(comment.postId, 'post-1');
      expect(comment.authorName, 'Alice');
      expect(comment.authorAvatarUrl, 'https://example.com/avatar.png');
      expect(comment.authorId, 'user-1');
      expect(comment.authorEmail, 'alice@example.com');
      expect(comment.body, 'Great post!');
      expect(comment.createdAt.year, 2024);
      expect(comment.createdAt.month, 3);
      expect(comment.createdAt.day, 15);
      expect(comment.parentId, isNull);
      expect(comment.reactions.length, 1);
      expect(comment.reactions.first.type, 'LIKE');
    });

    test('handles nullable fields being null', () {
      final json = {
        'id': 'comment-2',
        'postId': 'post-1',
        'authorName': 'Bob',
        'body': 'Nice',
        'createdAt': '2024-03-15T10:30:00.000Z',
        'reactions': <dynamic>[],
      };
      final comment = Comment.fromJson(json);
      expect(comment.authorAvatarUrl, isNull);
      expect(comment.authorId, isNull);
      expect(comment.authorEmail, isNull);
    });

    test('parses body field (the GraphQL field name)', () {
      final json = {
        'id': 'comment-3',
        'postId': 'post-1',
        'authorName': 'Charlie',
        'body': 'Hello world',
        'createdAt': '2024-03-15T10:30:00.000Z',
        'reactions': <dynamic>[],
      };
      final comment = Comment.fromJson(json);
      expect(comment.body, 'Hello world');
    });
  });
}
