import 'package:flutter_boilerplate/lib/riverpod_compat.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _currencyKey = 'currency_preference';

final currencyProvider = StateNotifierProvider<CurrencyNotifier, String>((ref) {
  return CurrencyNotifier();
});

class CurrencyNotifier extends StateNotifier<String> {
  CurrencyNotifier() : super('USD') {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_currencyKey);
    if (stored != null) {
      state = stored;
    }
  }

  Future<void> setCurrency(String currency) async {
    state = currency;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_currencyKey, currency);
  }
}
