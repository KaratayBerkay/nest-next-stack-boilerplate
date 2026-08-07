import 'package:flutter_boilerplate/lib/device_timezone.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('deviceTimezone', () {
    test('falls back to UTC when the platform channel is unavailable', () {
      // flutter_timezone talks to the native OS over a MethodChannel — in a
      // plain `flutter test` run (no platform binding registered), that call
      // throws MissingPluginException. This mirrors the web's own
      // catch-and-fall-back-to-UTC behavior in getBrowserTimezone().
      expect(deviceTimezone(), completion('UTC'));
    });
  });
}
