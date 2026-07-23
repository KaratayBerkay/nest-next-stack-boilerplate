const Map<String, String> _currencySymbols = {
  'USD': r'$',
  'EUR': r'€',
  'GBP': r'£',
  'TRY': r'₺',
  'BTC': r'₿',
  'ETH': r'Ξ',
};

String formatPrice(double amount, String currency) {
  final symbol = _currencySymbols[currency.toUpperCase()] ?? '$currency ';
  final formatted = amount.toStringAsFixed(2);
  return '$symbol$formatted';
}
