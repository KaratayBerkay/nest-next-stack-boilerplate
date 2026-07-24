import 'package:flutter_boilerplate/validators/forms/schema.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('validateRequired', () {
    test('returns null for non-empty value', () {
      expect(validateRequired('hello'), isNull);
    });

    test('returns error for empty value', () {
      expect(validateRequired(''), isNotEmpty);
      expect(validateRequired('', 'Name'), contains('Name'));
    });
  });

  group('validateMinLength', () {
    test('returns null for value meeting minimum', () {
      expect(validateMinLength('hello', 3), isNull);
    });

    test('returns error for short value', () {
      expect(validateMinLength('ab', 3), isNotEmpty);
    });
  });

  group('validateMaxLength', () {
    test('returns null for value within limit', () {
      expect(validateMaxLength('hello', 10), isNull);
    });

    test('returns error for too-long value', () {
      expect(validateMaxLength('hello world', 5), isNotEmpty);
    });
  });

  group('validateUrl', () {
    test('returns null for valid URL', () {
      expect(validateUrl('https://example.com'), isNull);
      expect(validateUrl('http://example.com/path'), isNull);
    });

    test('returns error for invalid URL', () {
      expect(validateUrl('not-a-url'), isNotEmpty);
    });

    test('returns null for empty URL', () {
      expect(validateUrl(''), isNull);
    });
  });

  group('validateNumber', () {
    test('returns null for valid number', () {
      expect(validateNumber('42'), isNull);
    });

    test('returns error for non-numeric', () {
      expect(validateNumber('abc'), isNotEmpty);
    });
  });

  group('validatePhone', () {
    test('returns null for valid phone', () {
      expect(validatePhone('+905551234567'), isNull);
    });

    test(
      'returns error for short phone',
      () => expect(validatePhone('123'), isNotEmpty),
    );
    test(
      'returns error for empty phone',
      () => expect(validatePhone(''), isNull),
    );
  });
}
