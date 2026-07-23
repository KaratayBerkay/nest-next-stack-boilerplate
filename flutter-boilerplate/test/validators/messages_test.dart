import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_boilerplate/validators/messages/schema.dart';

void main() {
  group('validateMessage', () {
    test('returns null for valid message', () {
      expect(validateMessage('Hello'), isNull);
    });

    test('returns null for null', () {
      expect(validateMessage(null), isNull);
    });

    test('returns null for whitespace', () {
      expect(validateMessage('   '), isNull);
    });

    test('returns error for too long message', () {
      expect(validateMessage('x' * 5001), isNotNull);
    });
  });

  group('validateConversationTitle', () {
    test('returns null for valid title', () {
      expect(validateConversationTitle('General Chat'), isNull);
    });

    test('returns error for null', () {
      expect(validateConversationTitle(null), isNotNull);
    });

    test('returns error for empty', () {
      expect(validateConversationTitle(''), isNotNull);
    });

    test('returns error for whitespace', () {
      expect(validateConversationTitle('   '), isNotNull);
    });

    test('returns error for too long', () {
      expect(validateConversationTitle('x' * 101), isNotNull);
    });
  });
}
