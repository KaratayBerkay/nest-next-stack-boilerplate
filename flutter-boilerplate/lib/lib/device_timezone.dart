import 'package:flutter_timezone/flutter_timezone.dart';

/// Mirrors the web's `TimezoneProvider`/`readTimezone()`
/// (`Intl.DateTimeFormat().resolvedOptions().timeZone`) — Dart has no
/// built-in way to read the OS's IANA zone (only a raw UTC offset, which
/// isn't enough to satisfy the backend's `@IsTimeZone()` validator), so the
/// native platform is asked instead. Falls back to 'UTC' on failure,
/// matching the web helper's own catch-and-fall-back-to-UTC behavior.
Future<String> deviceTimezone() async {
  try {
    final info = await FlutterTimezone.getLocalTimezone();
    return info.identifier;
  } catch (_) {
    return 'UTC';
  }
}
