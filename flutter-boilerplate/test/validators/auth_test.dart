import 'package:flutter_test/flutter_test.dart';

import '../../lib/validators/auth/schema.dart';

void main() {
  group('validateEmail', () {
    test('returns null for valid email', () {
      expect(validateEmail('user@example.com'), isNull);
      expect(validateEmail('test+label@domain.co'), isNull);
    });

    test('returns error for empty email', () {
      expect(validateEmail(''), isNotEmpty);
    });

    test('returns error for invalid email', () {
      expect(validateEmail('not-an-email'), isNotEmpty);
      expect(validateEmail('@domain.com'), isNotEmpty);
    });
  });

  group('validatePassword', () {
    test('returns null for password meeting length requirement', () {
      expect(validatePassword('abcdefgh'), isNull);
      expect(validatePassword('Password1'), isNull);
      expect(validatePassword('12345678'), isNull);
    });

    test('returns error for short password', () {
      expect(validatePassword('Ab1'), isNotEmpty);
      expect(validatePassword('short'), isNotEmpty);
    });

    test('returns error for empty password', () {
      expect(validatePassword(''), isNotEmpty);
    });
  });

  group('validateName', () {
    test('returns null for valid name', () {
      expect(validateName('John'), isNull);
      expect(validateName('Jane Doe'), isNull);
    });

    test('returns error for empty name', () {
      expect(validateName(''), isNotEmpty);
    });

    test('returns error for short name', () {
      expect(validateName('J'), isNotEmpty);
    });
  });
}
