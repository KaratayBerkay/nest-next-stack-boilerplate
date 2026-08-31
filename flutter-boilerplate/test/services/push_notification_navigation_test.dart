import 'package:flutter_boilerplate/services/push_notification_service.dart';
import 'package:flutter_test/flutter_test.dart';

/// CROSS-022 regression: push-notification taps must land on the SAME pages
/// the in-app notification list (and the web service worker) resolve to.
/// The RTC kinds were missing entirely — a missed-call / meeting-invite /
/// stream-live push dumped the user on the generic notification page even
/// though all three destination routes exist in the router.
void main() {
  late PushNotificationService service;
  late List<String> navigated;

  setUp(() {
    service = PushNotificationService();
    navigated = [];
    service.navigateTo = navigated.add;
  });

  test('direct-message push opens the sender conversation', () {
    service.navigateFromData({
      'kind': 'direct-message',
      'senderId': 'u1',
      'lang': 'en',
    });
    expect(navigated, ['/v1/en/messages?user=u1']);
  });

  test(
      'friend-request and friend-accepted pushes open the requests tab '
      '(not bare find-friends — the old web sw.js drift)', () {
    service.navigateFromData({'kind': 'friend-request', 'lang': 'en'});
    service.navigateFromData({'kind': 'friend-accepted', 'lang': 'tr'});
    expect(navigated, [
      '/v1/en/find-friends/requests',
      '/v1/tr/find-friends/requests',
    ]);
  });

  test('rtc-missed-call push opens the calls page', () {
    service.navigateFromData({'kind': 'rtc-missed-call', 'lang': 'en'});
    expect(navigated, ['/v1/en/rtc/calls']);
  });

  test('rtc-meeting-invite push opens that meeting room', () {
    service.navigateFromData({
      'kind': 'rtc-meeting-invite',
      'slug': 'standup-1',
      'lang': 'en',
    });
    expect(navigated, ['/v1/en/rtc/meetings/standup-1']);
  });

  test('rtc-stream-live push opens that stream', () {
    service.navigateFromData({
      'kind': 'rtc-stream-live',
      'slug': 'live-9',
      'lang': 'en',
    });
    expect(navigated, ['/v1/en/rtc/live/live-9']);
  });

  test(
      'rtc kinds missing their slug fall through to the notification page '
      'instead of navigating to a broken route', () {
    service.navigateFromData({'kind': 'rtc-stream-live', 'lang': 'en'});
    expect(navigated, ['/v1/en/notification']);
  });

  test('a postId payload opens that post', () {
    service.navigateFromData({'postId': 'p42', 'lang': 'en'});
    expect(navigated, ['/v1/en/posts/p42']);
  });

  test('unknown payloads land on the notification list', () {
    service.navigateFromData({'kind': 'mystery', 'lang': 'en'});
    expect(navigated, ['/v1/en/notification']);
  });
}
