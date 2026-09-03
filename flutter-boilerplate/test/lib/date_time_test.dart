import 'package:flutter_boilerplate/lib/date_time.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:timezone/data/latest_10y.dart' as tzdata;

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

  // CROSS-019: the profile timezone drives rendering, not the device zone.
  group('DateTimeHelper.setPreferredTimeZone', () {
    setUpAll(tzdata.initializeTimeZones);
    tearDown(() => DateTimeHelper.setPreferredTimeZone(null));

    test('renders wall-clock times in the preferred zone', () {
      DateTimeHelper.setPreferredTimeZone('Asia/Tokyo');
      // 00:00Z is 09:00 in Tokyo.
      expect(DateTimeHelper.formatTime(DateTime.utc(2026, 9, 3)), '9:00 AM');
      expect(
        DateTimeHelper.formatDateTime(DateTime.utc(2026, 9, 3, 22, 30)),
        'Sep 4, 2026 7:30 AM',
      );
      expect(DateTimeHelper.preferredTimeZone, 'Asia/Tokyo');
    });

    test('isSameDay compares calendar days in the preferred zone', () {
      DateTimeHelper.setPreferredTimeZone('Pacific/Kiritimati'); // UTC+14
      expect(
        DateTimeHelper.isSameDay(
          DateTime.utc(2026, 9, 3, 22),
          DateTime.utc(2026, 9, 4, 2),
        ),
        isTrue,
      );
    });

    test('an unknown zone falls back to device-local instead of throwing', () {
      DateTimeHelper.setPreferredTimeZone('Mars/Olympus_Mons');
      expect(DateTimeHelper.preferredTimeZone, isNull);
      final local = DateTime(2026, 9, 3, 14, 5);
      expect(DateTimeHelper.formatTime(local), '2:05 PM');
    });
  });
}
