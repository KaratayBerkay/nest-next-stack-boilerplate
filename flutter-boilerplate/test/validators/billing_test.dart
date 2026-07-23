import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/validators/billing/schema.dart';

void main() {
  group('validateCardholderName', () {
    test('returns null for valid name', () {
      expect(validateCardholderName('John Doe'), isNull);
    });

    test('returns error for null', () {
      expect(validateCardholderName(null), isNotNull);
    });

    test('returns error for empty', () {
      expect(validateCardholderName(''), isNotNull);
    });
  });

  group('validateBillingAddress', () {
    test('returns null for valid address', () {
      expect(validateBillingAddress('123 Main St'), isNull);
    });

    test('returns error for null', () {
      expect(validateBillingAddress(null), isNotNull);
    });
  });

  group('validateCity', () {
    test('returns null for valid city', () {
      expect(validateCity('Istanbul'), isNull);
    });

    test('returns error for empty', () {
      expect(validateCity(''), isNotNull);
    });
  });

  group('validatePostalCode', () {
    test('returns null for valid code', () {
      expect(validatePostalCode('12345'), isNull);
    });

    test('returns error for short code', () {
      expect(validatePostalCode('12'), isNotNull);
    });

    test('returns error for null', () {
      expect(validatePostalCode(null), isNotNull);
    });
  });

  group('validateCountry', () {
    test('returns null for valid country', () {
      expect(validateCountry('US'), isNull);
    });

    test('returns error for empty', () {
      expect(validateCountry(''), isNotNull);
    });
  });

  group('validateCouponCode', () {
    test('returns null for null', () {
      expect(validateCouponCode(null), isNull);
    });

    test('returns null for valid code', () {
      expect(validateCouponCode('SAVE20'), isNull);
    });

    test('returns error for short code', () {
      expect(validateCouponCode('AB'), isNotNull);
    });
  });
}
