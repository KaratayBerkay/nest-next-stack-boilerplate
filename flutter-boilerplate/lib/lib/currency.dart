import 'package:intl/intl.dart';

import '../constants/currency.dart';

const _localeMap = {
  'USD': 'en_US',
  'EUR': 'de_DE',
  'TRY': 'tr_TR',
};

/// Narrows a currency string from an API response to a known currency code,
/// falling back to USD for anything this app doesn't have a locale for.
String toCurrencyCode(String currency) {
  final upper = currency.toUpperCase();
  return CurrencyConstants.supportedCurrencies.contains(upper) ? upper : 'USD';
}

String formatCurrency(int cents, String currency) {
  final locale = _localeMap[currency] ?? _localeMap['USD']!;
  // simpleCurrency (unlike the plain .currency constructor) infers the real
  // "$"/"€"/"₺" glyph from locale+currency — .currency falls back to using
  // the ISO code itself as the symbol ("USD9.99") unless one is given.
  final format = NumberFormat.simpleCurrency(locale: locale, name: currency);
  return format.format(cents / 100);
}

/// A recurring plan price — same formatting as [formatCurrency], plus the
/// "/mo" cadence and a "Free" special case. Not for one-time amounts like
/// invoice line items; use [formatCurrency] for those.
String formatPrice(int cents, String currency) {
  if (cents == 0) return 'Free';
  return '${formatCurrency(cents, currency)}/mo';
}
