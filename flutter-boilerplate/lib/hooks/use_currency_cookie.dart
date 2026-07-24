import 'package:flutter_boilerplate/lib/riverpod_compat.dart';

enum CurrencyCode {
  usd,
  eur,
  tl;

  String get symbol {
    switch (this) {
      case CurrencyCode.usd:
        return '\$';
      case CurrencyCode.eur:
        return '€';
      case CurrencyCode.tl:
        return '₺';
    }
  }
}

final currencyCookieProvider =
    StateProvider<CurrencyCode>((ref) => CurrencyCode.usd);
