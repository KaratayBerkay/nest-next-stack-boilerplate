import 'package:flutter_boilerplate/lib/activity_logger.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('ActivityLogger', () {
    test('generates a clientSessionId', () {
      final logger = ActivityLogger.instance;
      expect(logger.clientSessionId, isNotEmpty);
    });

    test('clientSessionId is stable across calls', () {
      final logger = ActivityLogger.instance;
      expect(logger.clientSessionId, logger.clientSessionId);
    });
  });
}
