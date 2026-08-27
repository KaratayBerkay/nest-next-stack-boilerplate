import 'package:flutter_boilerplate/lib/realtime/route_claim.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('routeToPageClaim', () {
    test('feed route returns feed page', () {
      final result = routeToPageClaim(Uri.parse('/v1/en/feed'));
      expect(result.page, 'feed');
      expect(result.params, isNull);
    });

    test('post detail route returns post page with id', () {
      final result = routeToPageClaim(
        Uri.parse('/v1/en/posts/550e8400-e29b-41d4-a716-446655440000'),
      );
      expect(result.page, 'post');
      expect(result.params, {'id': '550e8400-e29b-41d4-a716-446655440000'});
    });

    test('posts/create claims post page with id=create (harmless no-op)', () {
      final result = routeToPageClaim(Uri.parse('/v1/en/posts/create'));
      expect(result.page, 'post');
      expect(result.params, {'id': 'create'});
    });

    test('messages route returns messages page', () {
      final result = routeToPageClaim(Uri.parse('/v1/en/messages'));
      expect(result.page, 'messages');
      expect(result.params, isNull);
    });

    test('messages sub-route returns messages page', () {
      final result = routeToPageClaim(Uri.parse('/v1/en/messages/some-id'));
      expect(result.page, 'messages');
      expect(result.params, isNull);
    });

    test('rtc routes claim no page — the backend rejects rtc claims', () {
      // Web's route-mapping emits rtc-meeting/rtc-stream claims, but the
      // server's PAGE_ALLOWLIST doesn't know them and answers with an error
      // frame (which this app surfaces as a snackbar). RTC rooms handle
      // their own reconnect catch-up locally instead.
      expect(
        routeToPageClaim(Uri.parse('/v1/en/rtc/meetings/abc-123')).page,
        isNull,
      );
      expect(
        routeToPageClaim(Uri.parse('/v1/en/rtc/live/xyz-789')).page,
        isNull,
      );
      expect(
        routeToPageClaim(Uri.parse('/v1/en/rtc/live/go-live')).page,
        isNull,
      );
    });

    test('notification route returns notification page', () {
      final result = routeToPageClaim(Uri.parse('/v1/en/notification'));
      expect(result.page, 'notification');
      expect(result.params, isNull);
    });

    test('find-friends route returns friend-request page', () {
      final result = routeToPageClaim(Uri.parse('/v1/en/find-friends'));
      expect(result.page, 'friend-request');
      expect(result.params, isNull);
    });

    test('chat-room route defaults to general room', () {
      final result = routeToPageClaim(Uri.parse('/v1/en/chat-room'));
      expect(result.page, 'chat-room');
      expect(result.params, {'room': 'general'});
    });

    test('chat-room route with conversation param', () {
      final result = routeToPageClaim(
        Uri.parse('/v1/en/chat-room?conversation=tech'),
      );
      expect(result.page, 'chat-room');
      expect(result.params, {'room': 'tech'});
    });

    test('legacy chat route maps to chat-room page', () {
      final result = routeToPageClaim(
        Uri.parse('/v1/en/chat/019f709d-1aaa-76b8-9f1c-4ea0b69c0529'),
      );
      expect(result.page, 'chat-room');
      expect(result.params, {
        'room': '019f709d-1aaa-76b8-9f1c-4ea0b69c0529',
      });
    });

    test('unknown route returns null page and params', () {
      final result = routeToPageClaim(Uri.parse('/v1/en/settings'));
      expect(result.page, isNull);
      expect(result.params, isNull);
    });

    test('root path returns null page and params', () {
      final result = routeToPageClaim(Uri.parse('/'));
      expect(result.page, isNull);
      expect(result.params, isNull);
    });
  });
}
