import 'package:flutter_boilerplate/lib/riverpod_compat.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _dateDisplayKey = 'date_display';

final dateDisplayProvider =
    StateNotifierProvider<DateDisplayNotifier, String>((ref) {
  return DateDisplayNotifier();
});

class DateDisplayNotifier extends StateNotifier<String> {
  DateDisplayNotifier() : super('Long') {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_dateDisplayKey);
    if (stored != null) {
      state = stored;
    }
  }

  Future<void> setDateDisplay(String format) async {
    state = format;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_dateDisplayKey, format);
  }
}
