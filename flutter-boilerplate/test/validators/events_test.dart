import 'package:flutter_boilerplate/validators/events/schema.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('validateEventType', () {
    test('returns null for valid event type', () {
      expect(validateEventType('page.view'), isNull);
      expect(validateEventType('network.online'), isNull);
    });

    test('returns error for empty event type', () {
      expect(validateEventType(''), isNotEmpty);
    });

    test('returns error for null event type', () {
      expect(validateEventType(null), isNotEmpty);
    });

    test('returns error for too long event type', () {
      expect(validateEventType('a' * 129), isNotEmpty);
    });
  });

  group('validateClientSessionId', () {
    test('returns null for valid session id', () {
      expect(validateClientSessionId('abc-123'), isNull);
    });

    test('returns error for empty session id', () {
      expect(validateClientSessionId(''), isNotEmpty);
    });

    test('returns error for null session id', () {
      expect(validateClientSessionId(null), isNotEmpty);
    });

    test('returns error for too long session id', () {
      expect(validateClientSessionId('a' * 65), isNotEmpty);
    });
  });

  group('validateTimestamp', () {
    test('returns null for valid timestamp', () {
      expect(validateTimestamp('2026-07-25T12:00:00Z'), isNull);
    });

    test('returns error for empty timestamp', () {
      expect(validateTimestamp(''), isNotEmpty);
    });

    test('returns error for null timestamp', () {
      expect(validateTimestamp(null), isNotEmpty);
    });
  });

  group('validateUserId', () {
    test('always returns null', () {
      expect(validateUserId(null), isNull);
      expect(validateUserId('user-1'), isNull);
      expect(validateUserId(''), isNull);
    });
  });

  group('validateUrl', () {
    test('returns null for valid url', () {
      expect(validateUrl('https://example.com/page'), isNull);
    });

    test('returns null for null url', () {
      expect(validateUrl(null), isNull);
    });

    test('returns null for empty url', () {
      expect(validateUrl(''), isNull);
    });

    test('returns error for too long url', () {
      expect(validateUrl('x' * 2049), isNotEmpty);
    });
  });

  group('validateUserAgent', () {
    test('returns null for valid user agent', () {
      expect(validateUserAgent('Dart/3.5'), isNull);
    });

    test('returns null for null user agent', () {
      expect(validateUserAgent(null), isNull);
    });

    test('returns error for too long user agent', () {
      expect(validateUserAgent('a' * 513), isNotEmpty);
    });
  });

  group('validateCategory', () {
    test('returns null for valid categories', () {
      expect(validateCategory('page'), isNull);
      expect(validateCategory('network'), isNull);
      expect(validateCategory('application-exception'), isNull);
      expect(validateCategory('session'), isNull);
      expect(validateCategory('http-exception'), isNull);
      expect(validateCategory('database'), isNull);
      expect(validateCategory('performance'), isNull);
    });

    test('returns null for null or empty category', () {
      expect(validateCategory(null), isNull);
      expect(validateCategory(''), isNull);
    });

    test('returns error for invalid category', () {
      expect(validateCategory('invalid'), isNotEmpty);
    });
  });

  group('validateExceptionType', () {
    test('returns null for valid exception types', () {
      expect(validateExceptionType('CLIENT_ERROR'), isNull);
      expect(validateExceptionType('CLIENT_REJECTION'), isNull);
      expect(validateExceptionType('CLIENT_REQUEST_ERROR'), isNull);
    });

    test('returns null for null or empty', () {
      expect(validateExceptionType(null), isNull);
      expect(validateExceptionType(''), isNull);
    });

    test('returns error for invalid type', () {
      expect(validateExceptionType('SERVER_ERROR'), isNotEmpty);
    });
  });

  group('validateDurationMs', () {
    test('returns null for valid number strings', () {
      expect(validateDurationMs('100'), isNull);
      expect(validateDurationMs('0'), isNull);
    });

    test('returns null for null or empty', () {
      expect(validateDurationMs(null), isNull);
      expect(validateDurationMs(''), isNull);
    });

    test('returns error for non-numeric string', () {
      expect(validateDurationMs('abc'), isNotEmpty);
    });
  });

  group('validateEventPage', () {
    test('always returns null', () {
      expect(validateEventPage(null), isNull);
      expect(validateEventPage('home'), isNull);
    });
  });

  group('validateBatchSize', () {
    test('returns null for valid batch sizes', () {
      expect(validateBatchSize(1), isNull);
      expect(validateBatchSize(50), isNull);
    });

    test('returns error for empty batch', () {
      expect(validateBatchSize(0), isNotEmpty);
    });

    test('returns error for too large batch', () {
      expect(validateBatchSize(51), isNotEmpty);
    });
  });
}
