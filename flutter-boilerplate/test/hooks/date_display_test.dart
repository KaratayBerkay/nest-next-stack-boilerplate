import 'package:flutter_boilerplate/hooks/use_date_display.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('DateDisplayNotifier', () {
    test('defaults to Long when nothing stored', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();

      final notifier = DateDisplayNotifier();
      await prefs.reload();
      expect(notifier.state, 'Long');
    });

    test('loads stored value from SharedPreferences', () async {
      SharedPreferences.setMockInitialValues({'date_display': 'Short'});
      final prefs = await SharedPreferences.getInstance();

      final notifier = DateDisplayNotifier();
      await prefs.reload();
      expect(notifier.state, 'Short');
    });

    test('persists on setDateDisplay', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();

      final notifier = DateDisplayNotifier();
      await notifier.setDateDisplay('ISO');
      await prefs.reload();

      expect(notifier.state, 'ISO');
      final stored = prefs.getString('date_display');
      expect(stored, 'ISO');
    });
  });
}
