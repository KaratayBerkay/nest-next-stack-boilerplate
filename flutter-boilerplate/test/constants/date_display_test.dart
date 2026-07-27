import 'package:flutter_boilerplate/constants/date_display.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('DateDisplayConstants', () {
    test('has default format', () {
      expect(DateDisplayConstants.defaultFormat, 'MMM d, yyyy');
    });

    test('has time format', () {
      expect(DateDisplayConstants.timeFormat, 'h:mm a');
    });

    test('has dateTime format', () {
      expect(DateDisplayConstants.dateTimeFormat, 'MMM d, yyyy h:mm a');
    });

    test('has ISO format', () {
      expect(DateDisplayConstants.isoFormat, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    });

    test('has relative time strings', () {
      expect(DateDisplayConstants.relativeJustNow, 'just now');
      expect(DateDisplayConstants.relativeMinutes, 'm ago');
      expect(DateDisplayConstants.relativeHours, 'h ago');
      expect(DateDisplayConstants.relativeDays, 'd ago');
    });
  });
}
