import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/lib/date_time.dart';

void main() {
  group('DateTimeHelper', () {
    group('format', () {
      test('formats with default pattern', () {
        final date = DateTime(2024, 3, 15);
        expect(DateTimeHelper.format(date), 'Mar 15, 2024');
      });

      test('formats with custom pattern', () {
        final date = DateTime(2024, 3, 15);
        expect(DateTimeHelper.format(date, format: 'yyyy/MM/dd'), '2024/03/15');
      });
    });

    group('formatTime', () {
      test('formats time correctly', () {
        final date = DateTime(2024, 3, 15, 14, 30);
        expect(DateTimeHelper.formatTime(date), '2:30 PM');
      });
    });

    group('isSameDay', () {
      test('returns true for same day', () {
        final a = DateTime(2024, 3, 15, 10);
        final b = DateTime(2024, 3, 15, 22);
        expect(DateTimeHelper.isSameDay(a, b), isTrue);
      });

      test('returns false for different days', () {
        final a = DateTime(2024, 3, 15);
        final b = DateTime(2024, 3, 16);
        expect(DateTimeHelper.isSameDay(a, b), isFalse);
      });
    });

    group('startOfDay', () {
      test('returns date at midnight', () {
        final date = DateTime(2024, 3, 15, 14, 30, 45);
        final start = DateTimeHelper.startOfDay(date);
        expect(start.hour, 0);
        expect(start.minute, 0);
        expect(start.second, 0);
      });
    });

    group('endOfDay', () {
      test('returns date at 23:59:59.999', () {
        final date = DateTime(2024, 3, 15);
        final end = DateTimeHelper.endOfDay(date);
        expect(end.hour, 23);
        expect(end.minute, 59);
        expect(end.second, 59);
        expect(end.millisecond, 999);
      });
    });
  });
}
