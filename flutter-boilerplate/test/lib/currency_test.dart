import 'package:flutter_boilerplate/lib/currency.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('toCurrencyCode', () {
    test('uppercases a known currency', () {
      expect(toCurrencyCode('eur'), 'EUR');
    });

    test('falls back to USD for an unsupported currency', () {
      expect(toCurrencyCode('gbp'), 'USD');
    });
  });

  group('formatPrice', () {
    test('renders "Free" for zero cents, regardless of currency', () {
      expect(formatPrice(0, 'EUR'), 'Free');
    });

    test('formats USD with the /mo cadence suffix', () {
      expect(formatPrice(999, 'USD'), '\$9.99/mo');
    });

    test('formats TRY using the Turkish locale grouping', () {
      // tr_TR uses a comma decimal separator, unlike en_US.
      expect(formatPrice(1999, 'TRY'), contains('19,99'));
    });
  });

  group('formatCurrency', () {
    test('does not add the /mo suffix (unlike formatPrice)', () {
      expect(formatCurrency(500, 'USD'), '\$5.00');
    });
  });
}
