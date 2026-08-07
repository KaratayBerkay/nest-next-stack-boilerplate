import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/api/server/messages/friends.dart';
import 'package:flutter_test/flutter_test.dart';

class _CapturingAdapter implements HttpClientAdapter {
  final List<RequestOptions> requests = [];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    return ResponseBody.fromString(
      '''
      [
        {"id":"f1","email":"alice@example.com","name":"Alice","avatar":"AL","online":true},
        {"id":"f2","email":"bob@example.com","name":null,"avatar":"BO","online":false}
      ]
      ''',
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

void main() {
  group('Friend.fromJson', () {
    test('reads the real backend field names (email, name, online)', () {
      // messaging-friend.service.ts's getFriends() sends
      // { id, email, name: string | null, avatar, online } — `avatar` is
      // server-computed initials text, not an image URL, and the wire key
      // is `online`, not `isOnline`. A prior version of this parser read
      // the wrong keys entirely, so avatars/online-status were silently
      // always empty/false for every friend.
      final friend = Friend.fromJson({
        'id': 'f1',
        'email': 'alice@example.com',
        'name': 'Alice',
        'avatar': 'AL',
        'online': true,
      });

      expect(friend.id, 'f1');
      expect(friend.name, 'Alice');
      expect(friend.email, 'alice@example.com');
      expect(friend.isOnline, isTrue);
    });

    test('falls back name to email when the backend sends name: null', () {
      final friend = Friend.fromJson({
        'id': 'f2',
        'email': 'bob@example.com',
        'name': null,
        'avatar': 'BO',
        'online': false,
      });

      expect(friend.name, 'bob@example.com');
      expect(friend.isOnline, isFalse);
    });
  });

  group('FriendsListServer', () {
    test('hits the real backend path and parses the list', () async {
      final adapter = _CapturingAdapter();
      final server = FriendsListServer(Dio()..httpClientAdapter = adapter);

      final result = await server.call();

      expect(adapter.requests.single.path, '/api/friends');
      expect(result, hasLength(2));
      expect(result[0].name, 'Alice');
      expect(result[0].isOnline, isTrue);
      expect(result[1].name, 'bob@example.com');
      expect(result[1].isOnline, isFalse);
    });
  });
}
