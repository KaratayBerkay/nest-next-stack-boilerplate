import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/lib/initials.dart';

void main() {
  group('getInitials', () {
    test('returns ? for empty string', () {
      expect(getInitials(''), '?');
    });

    test('returns single letter for single name', () {
      expect(getInitials('John'), 'J');
    });

    test('returns first and last initials for full name', () {
      expect(getInitials('John Doe'), 'JD');
    });

    test('handles multiple spaces', () {
      expect(getInitials('  John   Doe  '), 'JD');
    });

    test('uppercases initials', () {
      expect(getInitials('john doe'), 'JD');
    });

    test('handles middle name - uses first and last', () {
      expect(getInitials('John Michael Doe'), 'JD');
    });
  });
}
